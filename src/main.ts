import { Plugin } from "obsidian";
import { StateField, RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";

// ---------------------------------------------------------------------------
// Mots-clés ABAL
// ---------------------------------------------------------------------------
const KEYWORDS = new Set([
  "dcl", "on", "inherit", "swap", "version", "runtime", "bell", "virtual",
  "create", "remove", "static", "routine", "this", "forget", "do", "extern",
  "initglobal", "attach", "detach", "kbf", "hotkey", "ifndef", "mask",
  "timer", "atb", "ret", "strict", "rename", "inline", "tran", "arg",
  "find", "askcolor", "line", "int", "load", "go", "ldgo", "dfile", "seg",
  "small", "parse", "alter", "ifdef", "hex", "open", "pointer", "substr",
  "chr", "destructor", "shr", "shl", "close", "exception", "resume",
  "strn", "class", "common", "endclass", "private", "public", "function",
  "integer", "string", "numeric", "constructor", "method", "alias",
  "paint", "conf", "large", "error", "return", "const", "forward",
  "include", "includ", "segment", "while", "wend", "if", "else", "endif",
  "local", "for", "to", "next", "mod", "user", "endloc", "print", "case",
  "select", "endsel", "goto", "gosub", "default", "eseg", "end", "ask",
  "program", "left", "break", "tab", "pause", "until", "loop", "stop",
  "asc", "tabv", "repeat", "proc", "endproc", "exit", "field", "op",
  "module", "len", "conv", "event", "assign", "fix", "ptr", "collect",
  "up", "down", "posit", "search", "data", "date", "and", "or", "ox",
  "step", "call", "erradr", "validptr", "process", "index", "modif",
  "insert", "write", "read", "cfile", "gener",
]);

// ---------------------------------------------------------------------------
// Décorations CM6 — mode édition (live preview / source)
// ---------------------------------------------------------------------------
const DEC: Record<string, Decoration> = {
  keyword:     Decoration.mark({ class: "abal-keyword"     }),
  string:      Decoration.mark({ class: "abal-string"      }),
  comment:     Decoration.mark({ class: "abal-comment"     }),
  number:      Decoration.mark({ class: "abal-number"      }),
  operator:    Decoration.mark({ class: "abal-operator"    }),
  punctuation: Decoration.mark({ class: "abal-punctuation" }),
};

function addDecorations(
  source: string,
  offset: number,
  builder: RangeSetBuilder<Decoration>
) {
  let i = 0;
  const n = source.length;

  while (i < n) {
    // Commentaire
    if (source[i] === ";") {
      let j = i; while (j < n && source[j] !== "\n") j++;
      builder.add(offset + i, offset + j, DEC.comment);
      i = j; continue;
    }
    // Chaîne
    if (source[i] === '"') {
      let j = i + 1;
      while (j < n && source[j] !== '"' && source[j] !== "\n") j++;
      if (j < n && source[j] === '"') j++;
      builder.add(offset + i, offset + j, DEC.string);
      i = j; continue;
    }
    // Nombre hex
    const hexM = source.slice(i).match(/^0[xX][0-9a-fA-F]+/);
    if (hexM) {
      builder.add(offset + i, offset + i + hexM[0].length, DEC.number);
      i += hexM[0].length; continue;
    }
    // Nombre décimal
    const decM = source.slice(i).match(/^\d+(?:\.\d+)?/);
    if (decM && (i === 0 || !/[a-zA-Z_$]/.test(source[i - 1]))) {
      builder.add(offset + i, offset + i + decM[0].length, DEC.number);
      i += decM[0].length; continue;
    }
    // Identifiant / mot-clé
    const idM = source.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (idM) {
      if (KEYWORDS.has(idM[0].toLowerCase()))
        builder.add(offset + i, offset + i + idM[0].length, DEC.keyword);
      i += idM[0].length; continue;
    }
    // Opérateur
    if (/[+\-*\/=<>!&|%]/.test(source[i])) {
      builder.add(offset + i, offset + i + 1, DEC.operator);
      i++; continue;
    }
    // Ponctuation
    if (/[()[\]{},.:@]/.test(source[i])) {
      builder.add(offset + i, offset + i + 1, DEC.punctuation);
      i++; continue;
    }
    i++;
  }
}

function buildDecorations(doc: string): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  // Trouve tous les blocs ```abal ... ```
  const fenceRe = /^```abal[ \t]*\n([\s\S]*?)^```[ \t]*$/gim;
  let match: RegExpExecArray | null;
  while ((match = fenceRe.exec(doc)) !== null) {
    // Position du début du contenu (après le \n de la ligne d'ouverture)
    const contentStart = doc.indexOf("\n", match.index) + 1;
    addDecorations(match[1], contentStart, builder);
  }
  return builder.finish();
}

const abalField = StateField.define<DecorationSet>({
  create(state) {
    return buildDecorations(state.doc.toString());
  },
  update(deco, tr) {
    if (!tr.docChanged) return deco;
    return buildDecorations(tr.state.doc.toString());
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ---------------------------------------------------------------------------
// Tokenizer HTML — mode lecture
// ---------------------------------------------------------------------------
function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function span(cls: string, text: string): string {
  return `<span class="token ${cls}">${escHtml(text)}</span>`;
}
function highlight(source: string): string {
  let out = "", i = 0;
  const n = source.length;
  while (i < n) {
    if (source[i] === ";") {
      let j = i; while (j < n && source[j] !== "\n") j++;
      out += span("comment", source.slice(i, j)); i = j; continue;
    }
    if (source[i] === '"') {
      let j = i + 1;
      while (j < n && source[j] !== '"' && source[j] !== "\n") j++;
      if (j < n && source[j] === '"') j++;
      out += span("string", source.slice(i, j)); i = j; continue;
    }
    const hexM = source.slice(i).match(/^0[xX][0-9a-fA-F]+/);
    if (hexM) { out += span("number", hexM[0]); i += hexM[0].length; continue; }
    const decM = source.slice(i).match(/^\d+(?:\.\d+)?/);
    if (decM && (i === 0 || !/[a-zA-Z_$]/.test(source[i - 1]))) {
      out += span("number", decM[0]); i += decM[0].length; continue;
    }
    const idM = source.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (idM) {
      out += KEYWORDS.has(idM[0].toLowerCase()) ? span("keyword", idM[0]) : escHtml(idM[0]);
      i += idM[0].length; continue;
    }
    if (/[+\-*\/=<>!&|%]/.test(source[i])) { out += span("operator",    source[i++]); continue; }
    if (/[()[\]{},.:@]/.test(source[i]))    { out += span("punctuation", source[i++]); continue; }
    out += escHtml(source[i++]);
  }
  return out;
}

function applyHighlight(block: HTMLElement, observers: MutationObserver[]) {
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

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------
export default class AbalLangPlugin extends Plugin {
  private observers: MutationObserver[] = [];

  async onload() {
    // Mode édition : décorations CM6 directement sur le texte
    this.registerEditorExtension(abalField);

    // Mode lecture : coloration HTML via post-processeur
    this.registerMarkdownPostProcessor((el) => {
      el.querySelectorAll<HTMLElement>("code[class*='language-abal']").forEach((b) => {
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
}
