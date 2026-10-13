// Shared, dependency-free format for speech links in the viewer and helper.
(function (root) {
  "use strict";

  function validateCards(cards) {
    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error("A speech must contain at least one text card.");
    }
    for (const card of cards) {
      if (typeof card !== "string" || !card.trim()) {
        throw new Error("Every speech card must contain text.");
      }
    }
    return cards;
  }

  function encode(cards) {
    const bytes = new TextEncoder().encode(JSON.stringify(validateCards(cards)));
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const payload = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return "v1." + payload;
  }

  function decode(value) {
    if (typeof value !== "string" || !value.startsWith("v1.")) {
      throw new Error("Unsupported speech link format. Create a new link with the helper.");
    }
    const payload = value.slice(3);
    let cards;
    try {
      if (!/^[A-Za-z0-9_-]+$/.test(payload) || payload.length % 4 === 1) {
        throw new Error("Invalid base64url");
      }
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
      if (btoa(binary).replace(/=+$/, "") !== base64) throw new Error("Invalid base64url");
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      cards = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch {
      throw new Error("The speech data is invalid or incomplete. Copy the entire link or create it again with the helper.");
    }
    return validateCards(cards);
  }

  const api = { encode, decode };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SpeechData = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
