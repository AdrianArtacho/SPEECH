// Run with: node --test tests/*.test.cjs
// Uses only Node's built-in test runner; no package installation is needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const SpeechData = require('../speech-data.js');

const encodeJson = value => 'v1.' + Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

test('encodes a versioned, URL-safe JSON array with a stable simple example', () => {
  assert.equal(SpeechData.encode(['Hello']), 'v1.WyJIZWxsbyJd');
  assert.deepEqual(SpeechData.decode('v1.WyJIZWxsbyJd'), ['Hello']);
});

test('preserves Markdown, whitespace, Unicode, newlines, and URL punctuation', () => {
  const cards = [
    '  # Grüß dich, Adrián! 🎹\n\n**Speech & Sound**  \nSecond line\t',
    '100% + 20% = ? #tag & text; /path?x=a+b&y=%25',
    '- one\n- two\n\n```txt\n  code indentation\n```',
    '漢字, العربية, e\u0301, 😀',
  ];
  const encoded = SpeechData.encode(cards);
  assert.match(encoded, /^v1\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(SpeechData.decode(encoded), cards);

  const url = new URL('https://example.org/SPEECH/index.html');
  url.searchParams.set('speech', encoded);
  url.searchParams.set('title', 'Speech & Sound + 100% #1 🎤');
  url.searchParams.set('i', '2');
  const received = new URL(url.toString()).searchParams;
  assert.deepEqual(SpeechData.decode(received.get('speech')), cards);
  assert.equal(received.get('title'), 'Speech & Sound + 100% #1 🎤');
  assert.equal(received.get('i'), '2');
});

test('rejects invalid card collections at both encoding and decoding', () => {
  for (const cards of [[], [''], [' \n\t'], ['valid', ''], ['valid', null], [123], [{}], {}, 'text', null]) {
    assert.throws(() => SpeechData.encode(cards), `encode must reject ${JSON.stringify(cards)}`);
    assert.throws(() => SpeechData.decode(encodeJson(cards)), `decode must reject ${JSON.stringify(cards)}`);
  }
  assert.throws(() => SpeechData.encode(new Array(2)), 'encode must reject array holes');
});

test('rejects malformed versions, base64url, UTF-8, and JSON', () => {
  const malformed = [
    '', 'v1.', 'v2.WyJIZWxsbyJd', 'WyJIZWxsbyJd',
    'v1.!', 'v1.A', 'v1.WyJIZWxsbyJd=', 'v1.WyJIZWxsbyJd ',
    'v1.WyJIZWxsbyJd+', 'v1.WyJIZWxsbyJd/',
    'v1.' + Buffer.from([0xc3, 0x28]).toString('base64url'),
    'v1.' + Buffer.from('["unterminated"').toString('base64url'),
    'v1.' + Buffer.from('undefined').toString('base64url'),
  ];
  for (const value of malformed) assert.throws(() => SpeechData.decode(value), `must reject ${value}`);
  for (const value of [undefined, null, {}, []]) assert.throws(() => SpeechData.decode(value));
});

test('handles a long speech without argument-spread limits', () => {
  const cards = ['🎤'.repeat(40000), '  end\n'];
  assert.deepEqual(SpeechData.decode(SpeechData.encode(cards)), cards);
});

test('exposes the same codec in a plain browser script', () => {
  const context = vm.createContext({TextEncoder, TextDecoder, atob, btoa});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'speech-data.js'), 'utf8'), context);
  assert.equal(typeof context.SpeechData.encode, 'function');
  const cards = ['Grüße 🎵', '# Two\n\nA & B'];
  assert.equal(context.SpeechData.encode(cards), SpeechData.encode(cards));
  assert.equal(JSON.stringify(context.SpeechData.decode(SpeechData.encode(cards))), JSON.stringify(cards));
});
