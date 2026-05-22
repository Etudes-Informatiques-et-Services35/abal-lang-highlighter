# ABAL Language Highlighter

An [Obsidian](https://obsidian.md) plugin that adds syntax highlighting for the **ABAL** programming language inside fenced code blocks.

## Features

- Syntax highlighting in **edit mode** (Live Preview & Source) via CodeMirror 6 decorations
- Syntax highlighting in **reading mode** via a Markdown post-processor
- Case-insensitive keyword detection
- Highlights the following token types:
  - **Keywords** — control flow, data types, OOP constructs, built-in instructions
  - **Strings** — double-quoted literals
  - **Comments** — lines starting with `;`
  - **Numbers** — decimal and hexadecimal (`0x...`) literals
  - **Operators** — `+ - * / = < > ! & | %`
  - **Punctuation** — `( ) [ ] { } , . : @`

## Usage

Use the ` ```abal ` fenced code block in any note:

~~~markdown
```abal
; This is a comment
dcl myVar integer
if myVar = 0
  print "Hello, World!"
endif
```
~~~

## Installation

1. Download the latest release from the [Releases](https://github.com/Etudes-Informatiques-et-Services35/abal-lang-highlighter/releases) page.
2. Copy `main.js`, `manifest.json`, and `styles.css` into your vault's `.obsidian/plugins/abal-lang/` folder.
3. Enable the plugin in **Settings → Community plugins**.

## Requirements

- Obsidian `1.8.7` or later
- Works on desktop and mobile

## Author

**Kilian Breton** — [Etudes Informatiques et Services](https://github.com/Etudes-Informatiques-et-Services35)
