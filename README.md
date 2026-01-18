# SPEECH (Text Cards)

A minimal full-screen friendly “text card” viewer that loads its content from a CSV URL.

## Usage

Open your GitHub Pages URL like:

- `...?csv=`[<ENCODED_CSV_URL>](https://adrianartacho.github.io/UrlEncode/)
- Optional: `&title=Musikproduktion`

Example (Google Sheets published CSV):

`?csv=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vTZgGV7UM0gkQz7GdeIGV_Gq3uzTpUnW3dbWXew4S_X2Ls3ngc8oB3pvrywhIHm3ge6oRRlHHmbnZwP%2Fpub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&title=Musikproduktion`

## CSV format

Each row becomes one card. The **first column (A)** is used as the card text.

Markdown is supported (headings, lists, links, inline code, etc.). Emoji works as usual.

## Controls

- Swipe left/right (mobile)
- Tap anywhere (go next)
- Buttons ◀ ▶
- Keyboard: ←/→, PageUp/PageDown, Space (next)
- Fullscreen button ⛶ (or press `f`)

## Looping

When you reach the last card, it wraps to the first automatically.

## GitHub Pages setup

1. Put `index.html` at the repo root
2. Settings → Pages → Deploy from branch → `main` / root
