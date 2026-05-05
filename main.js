var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AbalLangPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var KEYWORDS = /* @__PURE__ */ new Set([
  "dcl",
  "on",
  "inherit",
  "swap",
  "version",
  "runtime",
  "bell",
  "virtual",
  "create",
  "remove",
  "static",
  "routine",
  "this",
  "forget",
  "do",
  "extern",
  "initglobal",
  "attach",
  "detach",
  "kbf",
  "hotkey",
  "ifndef",
  "mask",
  "timer",
  "atb",
  "ret",
  "strict",
  "rename",
  "inline",
  "tran",
  "arg",
  "find",
  "askcolor",
  "line",
  "int",
  "load",
  "go",
  "ldgo",
  "dfile",
  "seg",
  "small",
  "parse",
  "alter",
  "ifdef",
  "hex",
  "open",
  "pointer",
  "substr",
  "chr",
  "destructor",
  "shr",
  "shl",
  "close",
  "exception",
  "resume",
  "strn",
  "class",
  "common",
  "endclass",
  "private",
  "public",
  "function",
  "integer",
  "string",
  "numeric",
  "constructor",
  "method",
  "alias",
  "paint",
  "conf",
  "large",
  "error",
  "return",
  "const",
  "forward",
  "include",
  "includ",
  "segment",
  "while",
  "wend",
  "if",
  "else",
  "endif",
  "local",
  "for",
  "to",
  "next",
  "mod",
  "user",
  "endloc",
  "print",
  "case",
  "select",
  "endsel",
  "goto",
  "gosub",
  "default",
  "eseg",
  "end",
  "ask",
  "program",
  "left",
  "break",
  "tab",
  "pause",
  "until",
  "loop",
  "stop",
  "asc",
  "tabv",
  "repeat",
  "proc",
  "endproc",
  "exit",
  "field",
  "op",
  "module",
  "len",
  "conv",
  "event",
  "assign",
  "fix",
  "ptr",
  "collect",
  "up",
  "down",
  "posit",
  "search",
  "data",
  "date",
  "and",
  "or",
  "ox",
  "step",
  "call",
  "erradr",
  "validptr",
  "process",
  "index",
  "modif",
  "insert",
  "write",
  "read",
  "cfile",
  "gener"
]);
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function span(cls, text) {
  return `<span class="token ${cls}">${escHtml(text)}</span>`;
}
function highlight(source) {
  let out = "";
  let i = 0;
  const n = source.length;
  while (i < n) {
    if (source[i] === ";") {
      let j = i;
      while (j < n && source[j] !== "\n") j++;
      out += span("comment", source.slice(i, j));
      i = j;
      continue;
    }
    if (source[i] === '"') {
      let j = i + 1;
      while (j < n && source[j] !== '"' && source[j] !== "\n") j++;
      if (j < n && source[j] === '"') j++;
      out += span("string", source.slice(i, j));
      i = j;
      continue;
    }
    const hexMatch = source.slice(i).match(/^0[xX][0-9a-fA-F]+/);
    if (hexMatch) {
      out += span("number", hexMatch[0]);
      i += hexMatch[0].length;
      continue;
    }
    const decMatch = source.slice(i).match(/^\d+(?:\.\d+)?/);
    if (decMatch && (i === 0 || !/[a-zA-Z_$]/.test(source[i - 1]))) {
      out += span("number", decMatch[0]);
      i += decMatch[0].length;
      continue;
    }
    const identMatch = source.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (identMatch) {
      const word = identMatch[0];
      out += KEYWORDS.has(word.toLowerCase()) ? span("keyword", word) : escHtml(word);
      i += word.length;
      continue;
    }
    if (/[+\-*\/=<>!&|%]/.test(source[i])) {
      out += span("operator", source[i++]);
      continue;
    }
    if (/[()[\]{},.:@]/.test(source[i])) {
      out += span("punctuation", source[i++]);
      continue;
    }
    out += escHtml(source[i++]);
  }
  return out;
}
var AbalLangPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.observers = [];
  }
  async onload() {
    this.registerMarkdownPostProcessor((element) => {
      element.querySelectorAll("code[class*='language-abal']").forEach((block) => {
        this.highlightBlock(block);
      });
    });
  }
  onunload() {
    this.observers.forEach((obs) => obs.disconnect());
    this.observers = [];
  }
  highlightBlock(block) {
    const obs = new MutationObserver(() => {
      if (!block.querySelector(".token")) {
        obs.disconnect();
        block.innerHTML = highlight(block.textContent ?? "");
        obs.observe(block, { childList: true, subtree: true });
      }
    });
    block.innerHTML = highlight(block.textContent ?? "");
    obs.observe(block, { childList: true, subtree: true });
    this.observers.push(obs);
  }
};
