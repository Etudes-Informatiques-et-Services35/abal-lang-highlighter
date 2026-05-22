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
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
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
var DEC = {
  keyword: import_view.Decoration.mark({ class: "abal-keyword" }),
  string: import_view.Decoration.mark({ class: "abal-string" }),
  comment: import_view.Decoration.mark({ class: "abal-comment" }),
  number: import_view.Decoration.mark({ class: "abal-number" }),
  operator: import_view.Decoration.mark({ class: "abal-operator" }),
  punctuation: import_view.Decoration.mark({ class: "abal-punctuation" })
};
function addDecorations(source, offset, builder) {
  let i = 0;
  const n = source.length;
  while (i < n) {
    if (source[i] === ";") {
      let j = i;
      while (j < n && source[j] !== "\n") j++;
      builder.add(offset + i, offset + j, DEC.comment);
      i = j;
      continue;
    }
    if (source[i] === '"') {
      let j = i + 1;
      while (j < n && source[j] !== '"' && source[j] !== "\n") j++;
      if (j < n && source[j] === '"') j++;
      builder.add(offset + i, offset + j, DEC.string);
      i = j;
      continue;
    }
    const hexM = source.slice(i).match(/^0[xX][0-9a-fA-F]+/);
    if (hexM) {
      builder.add(offset + i, offset + i + hexM[0].length, DEC.number);
      i += hexM[0].length;
      continue;
    }
    const decM = source.slice(i).match(/^\d+(?:\.\d+)?/);
    if (decM && (i === 0 || !/[a-zA-Z_$]/.test(source[i - 1]))) {
      builder.add(offset + i, offset + i + decM[0].length, DEC.number);
      i += decM[0].length;
      continue;
    }
    const idM = source.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (idM) {
      if (KEYWORDS.has(idM[0].toLowerCase()))
        builder.add(offset + i, offset + i + idM[0].length, DEC.keyword);
      i += idM[0].length;
      continue;
    }
    if (/[+\-\$*\/=<>!&|%]/.test(source[i])) {
      builder.add(offset + i, offset + i + 1, DEC.operator);
      i++;
      continue;
    }
    if (/[()[\]{},.:@]/.test(source[i])) {
      builder.add(offset + i, offset + i + 1, DEC.punctuation);
      i++;
      continue;
    }
    i++;
  }
}
function buildDecorations(doc) {
  const builder = new import_state.RangeSetBuilder();
  const fenceRe = /^```abal[ \t]*\n([\s\S]*?)^```[ \t]*$/gim;
  let match;
  while ((match = fenceRe.exec(doc)) !== null) {
    const contentStart = doc.indexOf("\n", match.index) + 1;
    addDecorations(match[1], contentStart, builder);
  }
  return builder.finish();
}
var abalField = import_state.StateField.define({
  create(state) {
    return buildDecorations(state.doc.toString());
  },
  update(deco, tr) {
    if (!tr.docChanged) return deco;
    return buildDecorations(tr.state.doc.toString());
  },
  provide: (f) => import_view.EditorView.decorations.from(f)
});
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function span(cls, text) {
  return `<span class="token ${cls}">${escHtml(text)}</span>`;
}
function highlight(source) {
  let out = "", i = 0;
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
    const hexM = source.slice(i).match(/^0[xX][0-9a-fA-F]+/);
    if (hexM) {
      out += span("number", hexM[0]);
      i += hexM[0].length;
      continue;
    }
    const decM = source.slice(i).match(/^\d+(?:\.\d+)?/);
    if (decM && (i === 0 || !/[a-zA-Z_$]/.test(source[i - 1]))) {
      out += span("number", decM[0]);
      i += decM[0].length;
      continue;
    }
    const idM = source.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (idM) {
      out += KEYWORDS.has(idM[0].toLowerCase()) ? span("keyword", idM[0]) : escHtml(idM[0]);
      i += idM[0].length;
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
function applyHighlight(block, observers) {
  block.innerHTML = highlight(block.textContent ?? "");
  const obs = new MutationObserver(() => {
    if (!block.querySelector(".token")) {
      obs.disconnect();
      block.innerHTML = highlight(block.textContent ?? "");
      obs.observe(block, { childList: true, subtree: true });
    }
  });
  obs.observe(block, { childList: true, subtree: true });
  observers.push(obs);
}
var AbalLangPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.observers = [];
  }
  async onload() {
    this.registerEditorExtension(abalField);
    this.registerMarkdownPostProcessor((el) => {
      el.querySelectorAll("code[class*='language-abal']").forEach((b) => {
        if (!b.dataset.abal) {
          b.dataset.abal = "1";
          applyHighlight(b, this.observers);
        }
      });
    });
  }
  onunload() {
    this.observers.forEach((o) => o.disconnect());
    this.observers = [];
  }
};
