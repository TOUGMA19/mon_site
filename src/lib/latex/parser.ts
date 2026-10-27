import type {
  BlockKind,
  Choice,
  DocMeta,
  LatexDoc,
  ListItem,
  Node,
  StyleName,
  TableCell,
  TableRow,
  TocEntry,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Contexte partagé                                                          */
/* -------------------------------------------------------------------------- */

interface TheoremSpec {
  label: string;
  kind: BlockKind;
  numbered: boolean;
  counter: string;
}

interface Ctx {
  macros: Record<string, string>;
  macroDefs: Record<string, { n: number; body: string }>;
  theorems: Record<string, TheoremSpec>;
  counters: Record<string, number>;
  sec: number[];
  labels: Record<string, string>;
  lastNumber: string;
  footnotes: Node[][];
  meta: DocMeta;
  toc: TocEntry[];
  usedIds: Set<string>;
  hasChapter: boolean;
  hasCorrections: boolean;
  questions: { id: number; correct: number[] }[];
  expansions: number;
  enumDepth: number;
  itemDepth: number;
}

const STOP_END = Symbol("end");
const STOP_ITEM = Symbol("item");

interface Stop {
  env?: string;
  brace?: boolean;
  item?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Tables de référence                                                       */
/* -------------------------------------------------------------------------- */

const THEOREM_BUILTINS: Record<string, TheoremSpec> = {};
const reg = (names: string[], label: string, kind: BlockKind, numbered: boolean) => {
  for (const n of names) THEOREM_BUILTINS[n] = { label, kind, numbered, counter: label };
};
reg(["theorem", "thm", "theoreme", "théorème", "théoreme"], "Théorème", "theorem", true);
reg(["lemma", "lem", "lemme"], "Lemme", "theorem", true);
reg(["proposition", "prop"], "Proposition", "theorem", true);
reg(["corollary", "cor", "corollaire"], "Corollaire", "theorem", true);
reg(["propriete", "propriété", "property", "propriete"], "Propriété", "theorem", true);
reg(["conjecture"], "Conjecture", "theorem", true);
reg(["definition", "défintion", "défin", "definit", "defi", "defn", "dfn", "définition"], "Définition", "definition", true);
reg(["notation"], "Notation", "definition", false);
reg(["remark", "rem", "remarque", "remarques"], "Remarque", "remark", false);
reg(["example", "exemple", "exemples", "ex"], "Exemple", "remark", false);
reg(["rappel"], "Rappel", "remark", false);
reg(["attention"], "Attention", "remark", false);
reg(["methode", "méthode", "method"], "Méthode", "method", true);
reg(["exercise", "exercice", "exo"], "Exercice", "exercise", true);
reg(["problem", "probleme", "problème"], "Problème", "exercise", true);

const PROOF_ENVS = new Set(["proof", "preuve", "demonstration", "démonstration", "demo"]);

const CORRECTION_LABELS: Record<string, string> = {
  solution: "Solution",
  solutions: "Solutions",
  correction: "Correction",
  corrige: "Corrigé",
  corrigé: "Corrigé",
  corriges: "Corrigés",
  indication: "Indication",
  indications: "Indications",
  reponse: "Réponse",
  réponse: "Réponse",
};

const MATH_DISPLAY_ENVS: Record<string, string> = {
  equation: "equation",
  "equation*": "equation*",
  align: "align",
  "align*": "align*",
  alignat: "alignat",
  "alignat*": "alignat*",
  flalign: "align",
  "flalign*": "align*",
  gather: "gather",
  "gather*": "gather*",
  multline: "gather",
  "multline*": "gather*",
  eqnarray: "align",
  "eqnarray*": "align*",
};

const RAW_CODE_ENVS = new Set(["verbatim", "verbatim*", "Verbatim", "lstlisting", "minted", "alltt"]);
const PICTURE_ENVS = new Set(["tikzpicture", "pgfpicture", "pspicture", "circuitikz", "tikzcd", "axis"]);

const DECLS: Record<string, { style: StyleName | "center" | "left" | "right" }> = {
  bf: { style: "bold" },
  bfseries: { style: "bold" },
  it: { style: "italic" },
  itshape: { style: "italic" },
  em: { style: "italic" },
  sl: { style: "italic" },
  slshape: { style: "italic" },
  tt: { style: "mono" },
  ttfamily: { style: "mono" },
  sc: { style: "smallcaps" },
  scshape: { style: "smallcaps" },
  sf: { style: "sans" },
  sffamily: { style: "sans" },
  rm: { style: "serif" },
  rmfamily: { style: "serif" },
  large: { style: "large" },
  Large: { style: "large" },
  LARGE: { style: "large" },
  huge: { style: "large" },
  Huge: { style: "large" },
  small: { style: "small" },
  footnotesize: { style: "small" },
  scriptsize: { style: "small" },
  tiny: { style: "small" },
  normalsize: { style: "plain" },
  centering: { style: "center" },
  raggedright: { style: "left" },
  raggedleft: { style: "right" },
};

const STYLE_CMDS: Record<string, StyleName> = {
  textbf: "bold",
  textit: "italic",
  emph: "italic",
  textsl: "italic",
  underline: "underline",
  texttt: "mono",
  textsc: "smallcaps",
  textsf: "sans",
  textrm: "serif",
  textmd: "plain",
  textnormal: "plain",
  mbox: "plain",
  hbox: "plain",
  textsuperscript: "sup",
  textsubscript: "sub",
  up: "sup",
  fbox: "boxed",
  framebox: "boxed",
};

const SYMBOLS: Record<string, string> = {
  textbackslash: "\\",
  textasciitilde: "~",
  textasciicircum: "^",
  textdegree: "°",
  textbar: "|",
  textless: "<",
  textgreater: ">",
  euro: "€",
  ldots: "…",
  dots: "…",
  textellipsis: "…",
  cdots: "⋯",
  LaTeX: "LaTeX",
  TeX: "TeX",
  og: "«\u00A0",
  fg: "\u00A0»",
  oe: "œ",
  OE: "Œ",
  ae: "æ",
  AE: "Æ",
  ss: "ß",
  o: "ø",
  O: "Ø",
  aa: "å",
  AA: "Å",
  l: "ł",
  L: "Ł",
  i: "ı",
  j: "ȷ",
  S: "§",
  P: "¶",
  copyright: "©",
  pounds: "£",
  dag: "†",
  ddag: "‡",
  quad: "\u2003",
  qquad: "\u2003\u2003",
  enspace: "\u2002",
  textquoteright: "’",
  textquoteleft: "‘",
  guillemotleft: "«\u00A0",
  guillemotright: "\u00A0»",
};

/** Commandes dont on ignore silencieusement les arguments. */
const IGNORE_ARGS: Record<string, number> = {
  vspace: 1,
  hspace: 1,
  setlength: 2,
  setcounter: 2,
  addtocounter: 2,
  usepackage: 1,
  documentclass: 1,
  geometry: 1,
  pagestyle: 1,
  thispagestyle: 1,
  bibliographystyle: 1,
  bibliography: 1,
  input: 1,
  include: 1,
  graphicspath: 1,
  hypersetup: 1,
  lstset: 1,
  setlist: 1,
  selectlanguage: 1,
  frenchbsetup: 1,
  pagenumbering: 1,
  newcounter: 1,
  cline: 1,
  rule: 2,
  phantom: 1,
  hphantom: 1,
  vphantom: 1,
  stepcounter: 1,
  fancyhead: 1,
  fancyfoot: 1,
  rhead: 1,
  lhead: 1,
  chead: 1,
  rfoot: 1,
  lfoot: 1,
  cfoot: 1,
  graphicspaths: 1,
};

const IGNORE_NOARGS = new Set([
  "noindent",
  "indent",
  "maketitle",
  "tableofcontents",
  "newpage",
  "clearpage",
  "pagebreak",
  "linebreak",
  "nopagebreak",
  "hfill",
  "hline",
  "toprule",
  "midrule",
  "bottomrule",
  "displaystyle",
  "makeatletter",
  "makeatother",
  "frenchspacing",
  "nonfrenchspacing",
  "relax",
  "protect",
  "ignorespaces",
  "fancyhf",
  "footnotetext",
]);

const ACCENTS: Record<string, string> = {
  "'": "\u0301",
  "`": "\u0300",
  "^": "\u0302",
  '"': "\u0308",
  "~": "\u0303",
  "=": "\u0304",
  ".": "\u0307",
  c: "\u0327",
  v: "\u030C",
  u: "\u0306",
  H: "\u030B",
  k: "\u0328",
};

const FR_MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

const isLetter = (c: string | undefined) => !!c && /[a-zA-Z]/.test(c);

const toRoman = (n: number): string => {
  const map: [number, string][] = [
    [1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"],
    [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
  ];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
};

const toAlpha = (n: number): string =>
  n >= 1 && n <= 26 ? String.fromCharCode(96 + n) : String(n);

function counterValue(kind: "arabic" | "alph" | "Alph" | "roman" | "Roman", n: number): string {
  switch (kind) {
    case "arabic": return String(n);
    case "alph": return toAlpha(n);
    case "Alph": return toAlpha(n).toUpperCase();
    case "roman": return toRoman(n);
    case "Roman": return toRoman(n).toUpperCase();
  }
}

/** Corrections typographiques sur du texte brut (tirets, guillemets, espaces insécables). */
export function typo(t: string): string {
  return t
    .replace(/[ \t]*\n[ \t]*/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/``/g, "“")
    .replace(/''/g, "”")
    .replace(/`/g, "‘")
    .replace(/'/g, "’")
    .replace(/<</g, "«\u00A0")
    .replace(/>>/g, "\u00A0»")
    .replace(/ ([;!?])/g, "\u202F$1")
    .replace(/ :/g, "\u00A0:")
    .replace(/« /g, "«\u00A0")
    .replace(/ »/g, "\u00A0»");
}

/** Supprime les commentaires `%` (hors verbatim) en imitant TeX. */
export function stripComments(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let inVerb = false;
  let joinNext = false;
  for (let line of lines) {
    if (joinNext) {
      line = line.replace(/^[ \t]+/, "");
      joinNext = false;
    }
    if (inVerb) {
      out.push(line);
      if (/\\end\{(verbatim\*?|Verbatim|lstlisting|minted|alltt)\}/.test(line)) inVerb = false;
      continue;
    }
    if (/\\begin\{(verbatim\*?|Verbatim|lstlisting|minted|alltt)\}/.test(line) &&
        !/\\end\{(verbatim\*?|Verbatim|lstlisting|minted|alltt)\}/.test(line)) {
      inVerb = true;
      out.push(line);
      continue;
    }
    let cut = -1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "\\") { i++; continue; }
      if (line[i] === "%") { cut = i; break; }
    }
    if (cut === -1) {
      out.push(line);
    } else {
      const before = line.slice(0, cut);
      if (before.trim() === "") continue; // ligne entièrement commentée
      out.push(before);
      // TeX avale le retour à la ligne : on recolle avec la ligne suivante.
      out[out.length - 1] = before;
      joinNext = true;
      // on marque par un séparateur spécial retiré ensuite
      out[out.length - 1] = before + "\uE000";
    }
  }
  return out.join("\n").replace(/\uE000\n/g, "").replace(/\uE000/g, "");
}

/** Texte brut approximatif d'un argument LaTeX (pour titres, métadonnées). */
export function plainText(raw: string): string {
  return raw
    .replace(/\\\\/g, " ")
    .replace(/\\[a-zA-Z]+\*?/g, "")
    .replace(/[{}]/g, "")
    .replace(/~/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function plainOfNodes(nodes: Node[]): string {
  return nodes
    .map((n) => {
      if (n.type === "text") return n.value;
      if (n.type === "style" || n.type === "link") return plainOfNodes(n.children);
      return "";
    })
    .join("");
}

/** Applique les déclarations (\bf, \centering…) jusqu'à la fin du groupe courant. */
function applyDecls(nodes: Node[]): Node[] {
  const i = nodes.findIndex((n) => n.type === "decl");
  if (i < 0) return nodes;
  const d = nodes[i] as Extract<Node, { type: "decl" }>;
  const rest = applyDecls(nodes.slice(i + 1));
  const before = nodes.slice(0, i);
  if (d.style === "center" || d.style === "left" || d.style === "right") {
    return [...before, { type: "align", align: d.style, children: rest }];
  }
  return [...before, { type: "style", style: d.style, color: d.color, children: rest }];
}

/** Sépare `s` selon `sep` au niveau le plus externe (hors accolades, maths, environnements). */
function splitTop(s: string, sep: "rows" | "cells"): string[] {
  const parts: string[] = [];
  let cur = "";
  let brace = 0;
  let env = 0;
  let math = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      if (s.startsWith("\\begin{", i)) env++;
      else if (s.startsWith("\\end{", i)) env--;
      if (sep === "rows" && s[i + 1] === "\\" && !math && brace === 0 && env === 0) {
        parts.push(cur);
        cur = "";
        i += 1;
        if (s[i + 1] === "*") i++;
        if (s[i + 1] === "[") {
          const close = s.indexOf("]", i + 1);
          if (close > 0) i = close;
        }
        continue;
      }
      cur += c + (s[i + 1] ?? "");
      i++;
      continue;
    }
    if (c === "$") math = !math;
    else if (c === "{") brace++;
    else if (c === "}") brace--;
    else if (c === "&" && sep === "cells" && !math && brace === 0 && env === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

/** Interprète une spécification de colonnes `{|c|lr|p{3cm}|}`. */
function parseColSpec(spec: string): { aligns: ("left" | "center" | "right")[]; vlines: boolean } {
  const aligns: ("left" | "center" | "right")[] = [];
  let vlines = false;
  // développe *{n}{spec}
  spec = spec.replace(/\*\{(\d+)\}\{([^}]*)\}/g, (_, n, s) => String(s).repeat(Number(n)));
  for (let i = 0; i < spec.length; i++) {
    const c = spec[i];
    if (c === "|") vlines = true;
    else if (c === "l") aligns.push("left");
    else if (c === "c") aligns.push("center");
    else if (c === "r") aligns.push("right");
    else if (c === "p" || c === "m" || c === "b" || c === "X") {
      aligns.push("left");
      if (spec[i + 1] === "{") i = skipBraces(spec, i + 1);
    } else if (c === "@" || c === ">" || c === "<" || c === "!") {
      if (spec[i + 1] === "{") i = skipBraces(spec, i + 1);
    }
  }
  return { aligns, vlines };
}

function skipBraces(s: string, i: number): number {
  let depth = 0;
  for (; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return s.length;
}

function guessKind(name: string, label: string): BlockKind {
  const s = `${name} ${label}`.toLowerCase();
  if (/exercic|probl[eè]m|exercise|question/.test(s)) return "exercise";
  if (/d[ée]finition|notation|d[ée]f\b|defn/.test(s)) return "definition";
  if (/remarque|exemple|rappel|attention|note|m[ée]thode|astuce|example|remark/.test(s)) return "remark";
  return "theorem";
}

/* -------------------------------------------------------------------------- */
/*  Parseur                                                                   */
/* -------------------------------------------------------------------------- */

class Parser {
  src: string;
  pos = 0;
  ctx: Ctx;
  depth: number;
  lastStop: "end" | "item" | "brace" | "eof" = "eof";

  constructor(src: string, ctx: Ctx, depth = 0) {
    this.src = src;
    this.ctx = ctx;
    this.depth = depth;
  }

  /* ----------------------------- lecture d'arguments ---------------------- */

  private skipWs() {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++;
  }

  private skipStar(): boolean {
    if (this.src[this.pos] === "*") {
      this.pos++;
      return true;
    }
    return false;
  }

  private readBalanced(open: string, close: string): string {
    const s = this.src;
    const start = this.pos + 1;
    let depth = 0;
    let brace = 0;
    for (let i = this.pos; i < s.length; i++) {
      const c = s[i];
      if (c === "\\") { i++; continue; }
      if (open === "[") {
        if (c === "{") brace++;
        else if (c === "}") brace--;
        if (brace > 0) continue;
      }
      if (c === open) depth++;
      else if (c === close) {
        depth--;
        if (depth === 0) {
          this.pos = i + 1;
          return s.slice(start, i);
        }
      }
    }
    this.pos = s.length;
    return s.slice(start);
  }

  /** Argument obligatoire : `{...}` ou un seul caractère / une seule commande. */
  private readArg(): string | null {
    this.skipWs();
    const s = this.src;
    if (this.pos >= s.length) return null;
    if (s[this.pos] === "{") return this.readBalanced("{", "}");
    if (s[this.pos] === "\\") {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(this.pos, this.pos + 60));
      if (m) {
        this.pos += m[0].length;
        return m[0];
      }
    }
    return s[this.pos++];
  }

  private readOpt(): string | null {
    const save = this.pos;
    this.skipWs();
    if (this.src[this.pos] === "[") return this.readBalanced("[", "]");
    this.pos = save;
    return null;
  }

  private fragment(raw: string): Node[] {
    if (this.depth > 30) return [];
    const p = new Parser(raw, this.ctx, this.depth + 1);
    return p.parseNodes({});
  }

  /* ----------------------------- boucle principale ------------------------ */

  parseNodes(stop: Stop): Node[] {
    const out: Node[] = [];
    let text = "";
    const flush = () => {
      if (text) {
        out.push({ type: "text", value: typo(text) });
        text = "";
      }
    };
    this.lastStop = "eof";

    loop: while (this.pos < this.src.length) {
      const s = this.src;
      const c = s[this.pos];

      if (c === "\\") {
        flush();
        const r = this.handleCommand(stop);
        if (r === STOP_END) { this.lastStop = "end"; break loop; }
        if (r === STOP_ITEM) { this.lastStop = "item"; break loop; }
        out.push(...r);
        continue;
      }
      if (c === "{") {
        flush();
        this.pos++;
        const kids = this.parseNodes({ brace: true });
        out.push(...kids);
        this.lastStop = "eof";
        continue;
      }
      if (c === "}") {
        this.pos++;
        if (stop.brace) {
          flush();
          this.lastStop = "brace";
          break loop;
        }
        continue;
      }
      if (c === "$") {
        flush();
        const display = s[this.pos + 1] === "$";
        const delim = display ? "$$" : "$";
        const from = this.pos + delim.length;
        const end = this.findDelim(delim, from);
        if (end < 0) {
          text += "$";
          this.pos++;
          continue;
        }
        out.push({ type: "math", value: s.slice(from, end), display });
        this.pos = end + delim.length;
        continue;
      }
      if (c === "~") { text += "\u00A0"; this.pos++; continue; }
      if (c === "\n") {
        // ligne vide => nouveau paragraphe
        let j = this.pos + 1;
        while (j < s.length && (s[j] === " " || s[j] === "\t")) j++;
        if (s[j] === "\n") {
          flush();
          while (j < s.length && /\s/.test(s[j])) j++;
          this.pos = j;
          out.push({ type: "par" });
        } else {
          text += " ";
          this.pos++;
        }
        continue;
      }
      // texte courant
      const m = /[^\\{}$~\n]+/y;
      m.lastIndex = this.pos;
      const r = m.exec(s);
      if (r) {
        text += r[0];
        this.pos += r[0].length;
      } else {
        this.pos++;
      }
    }
    // texte restant
    if (text) out.push({ type: "text", value: typo(text) });
    if (this.pos >= this.src.length && this.lastStop === "eof") this.lastStop = "eof";
    return applyDecls(out);
  }

  private findDelim(delim: string, from: number): number {
    const s = this.src;
    for (let i = from; i < s.length; i++) {
      if (s.startsWith(delim, i)) return i;
      if (s[i] === "\\") i++;
    }
    return -1;
  }

  /* ----------------------------- commandes -------------------------------- */

  private handleCommand(stop: Stop): Node[] | typeof STOP_END | typeof STOP_ITEM {
    const s = this.src;
    const start = this.pos;
    this.pos++;
    const ch = s[this.pos];
    if (ch === undefined) return [];

    if (!isLetter(ch)) {
      this.pos++;
      switch (ch) {
        case "\\":
          this.skipStar();
          if (s[this.pos] === "[") {
            const close = s.indexOf("]", this.pos);
            if (close > 0) this.pos = close + 1;
          }
          return [{ type: "br" }];
        case ",": return [{ type: "text", value: "\u202F" }];
        case ";":
        case ":": return [{ type: "text", value: "\u2005" }];
        case "!": return [];
        case " ":
        case "\n": return [{ type: "text", value: " " }];
        case "%": case "&": case "$": case "#": case "_": case "{": case "}":
          return [{ type: "text", value: ch }];
        case "-": case "/": case "@": return [];
        case "(": {
          const end = this.findDelim("\\)", this.pos);
          const val = end < 0 ? s.slice(this.pos) : s.slice(this.pos, end);
          this.pos = end < 0 ? s.length : end + 2;
          return [{ type: "math", value: val, display: false }];
        }
        case "[": {
          const end = this.findDelim("\\]", this.pos);
          const val = end < 0 ? s.slice(this.pos) : s.slice(this.pos, end);
          this.pos = end < 0 ? s.length : end + 2;
          return [{ type: "math", value: val, display: true }];
        }
        default:
          if (ACCENTS[ch]) return this.accent(ch);
          return [{ type: "text", value: ch }];
      }
    }

    let end = this.pos;
    while (end < s.length && isLetter(s[end])) end++;
    const name = s.slice(this.pos, end);
    this.pos = end;
    return this.letterCommand(name, start, stop);
  }

  private accent(kind: string): Node[] {
    const s = this.src;
    const letterAccent = isLetter(kind);
    if (letterAccent && s[this.pos] === " ") this.pos++;
    let base = "";
    if (s[this.pos] === "{") {
      base = this.readBalanced("{", "}");
    } else if (s[this.pos] === "\\") {
      const m = /^\\([ij])(?![a-zA-Z])/.exec(s.slice(this.pos, this.pos + 3));
      if (m) {
        base = m[1];
        this.pos += 2;
      }
    } else if (this.pos < s.length) {
      base = s[this.pos++];
    }
    base = base.replace(/^\\([ij])$/, "$1");
    if (!base) return [];
    const first = base[0];
    const composed = (first + ACCENTS[kind]).normalize("NFC");
    return [{ type: "text", value: composed + base.slice(1) }];
  }

  private letterCommand(
    name: string,
    start: number,
    stop: Stop,
  ): Node[] | typeof STOP_END | typeof STOP_ITEM {
    const ctx = this.ctx;

    switch (name) {
      case "begin":
        return this.environment();

      case "end": {
        const n = (this.readArg() ?? "").trim();
        if (stop.env && n === stop.env) return STOP_END;
        return [];
      }

      case "bonne":
      case "mauvaise":
        if (stop.item) {
          this.pos = start;
          return STOP_ITEM;
        }
        return [];

      case "item":
        if (stop.item) {
          this.pos = start;
          return STOP_ITEM;
        }
        return [];

      case "chapter": case "section": case "subsection": case "subsubsection":
      case "paragraph": case "subparagraph":
        return this.heading(name);

      case "textcolor": {
        const color = (this.readArg() ?? "").trim();
        const body = this.readArg() ?? "";
        return [{ type: "style", style: "color", color, children: this.fragment(body) }];
      }
      case "color": {
        const color = (this.readArg() ?? "").trim();
        return [{ type: "decl", style: "color", color }];
      }

      case "par": return [{ type: "par" }];
      case "newline": return [{ type: "br" }];
      case "bigskip": return [{ type: "vspace", size: "big" }];
      case "medskip": return [{ type: "vspace", size: "med" }];
      case "smallskip": return [{ type: "vspace", size: "small" }];
      case "hrule": return [{ type: "rule" }];
      case "hrulefill": return [{ type: "rule" }];

      case "today": {
        const d = new Date();
        return [{ type: "text", value: `${d.getDate()} ${FR_MONTHS[d.getMonth()]} ${d.getFullYear()}` }];
      }
      case "ier": return [{ type: "style", style: "sup", children: [{ type: "text", value: "er" }] }];
      case "iere": return [{ type: "style", style: "sup", children: [{ type: "text", value: "re" }] }];
      case "ieme": return [{ type: "style", style: "sup", children: [{ type: "text", value: "e" }] }];
      case "iemes": return [{ type: "style", style: "sup", children: [{ type: "text", value: "es" }] }];

      case "title": { ctx.meta.titre ??= plainText(this.readArg() ?? ""); return []; }
      case "author": { ctx.meta.auteur ??= plainText(this.readArg() ?? ""); return []; }
      case "date": { ctx.meta.date ??= plainText(this.readArg() ?? ""); return []; }

      case "label": {
        const key = (this.readArg() ?? "").trim();
        if (key) ctx.labels[key] = ctx.lastNumber;
        return [];
      }
      case "ref": case "autoref": case "pageref": case "cref": case "eqref": {
        const key = (this.readArg() ?? "").trim();
        return [{ type: "ref", key, paren: name === "eqref" }];
      }
      case "cite": {
        this.readOpt();
        const key = (this.readArg() ?? "").trim();
        return [{ type: "text", value: `[${key}]` }];
      }
      case "footnote": {
        this.readOpt();
        const body = this.readArg() ?? "";
        ctx.footnotes.push(this.fragment(body));
        return [{ type: "footnote", index: ctx.footnotes.length }];
      }
      case "url": {
        const href = (this.readArg() ?? "").trim();
        return [{ type: "link", href, children: [{ type: "text", value: href }] }];
      }
      case "href": {
        const href = (this.readArg() ?? "").trim();
        const body = this.readArg() ?? "";
        return [{ type: "link", href, children: this.fragment(body) }];
      }
      case "includegraphics": {
        this.skipStar();
        const opt = this.readOpt() ?? "";
        const file = (this.readArg() ?? "").trim();
        const w = /width\s*=\s*([0-9.]+)\s*\\(?:text|line|column)width/.exec(opt);
        const wcm = /width\s*=\s*([0-9.]+)\s*(cm|mm|pt|in|px)/.exec(opt);
        let width: string | undefined;
        if (w) width = `${Math.round(parseFloat(w[1]) * 100)}%`;
        else if (wcm) {
          const v = parseFloat(wcm[1]);
          const px = { cm: 37.8, mm: 3.78, pt: 1.333, in: 96, px: 1 }[wcm[2] as "cm"] * v;
          width = `${Math.round(px)}px`;
        }
        let f = file.replace(/^\.\//, "").replace(/^figures\//, "");
        if (!/\.[a-zA-Z0-9]{2,4}$/.test(f)) f += ".png"; // LaTeX permet d'omettre l'extension
        const src = /^(https?:)?\//.test(file) ? file : `/enseignement/figures/${f}`;
        return [{ type: "image", src, width }];
      }
      case "caption": {
        this.skipStar();
        this.readOpt();
        const body = this.readArg() ?? "";
        return [{ type: "caption", children: this.fragment(body) }];
      }
      case "verb": {
        this.skipStar();
        const delim = s0(this.src, this.pos);
        this.pos++;
        const close = this.src.indexOf(delim, this.pos);
        const val = close < 0 ? this.src.slice(this.pos) : this.src.slice(this.pos, close);
        this.pos = close < 0 ? this.src.length : close + 1;
        return [{ type: "code", value: val, inline: true }];
      }
      case "ensuremath": {
        const body = this.readArg() ?? "";
        return [{ type: "math", value: body, display: false }];
      }

      case "newcommand": case "renewcommand": case "providecommand":
        this.defineCommand();
        return [];
      case "def":
        this.defineDef();
        return [];
      case "DeclareMathOperator": {
        const star = this.skipStar();
        const nm = (this.readArg() ?? "").trim();
        const body = this.readArg() ?? "";
        if (nm) ctx.macros[nm] = `\\operatorname${star ? "*" : ""}{${body}}`;
        return [];
      }
      case "newtheorem":
        this.defineTheorem();
        return [];
      case "newenvironment": case "renewenvironment":
        this.skipStar();
        this.readArg(); this.readOpt(); this.readArg(); this.readArg();
        return [];
    }

    if (STYLE_CMDS[name]) {
      this.skipStar();
      const body = this.readArg() ?? "";
      return [{ type: "style", style: STYLE_CMDS[name], children: this.fragment(body) }];
    }
    if (DECLS[name]) return [{ type: "decl", style: DECLS[name].style }];
    if (name in SYMBOLS) {
      while (this.src[this.pos] === " " || this.src[this.pos] === "\t") this.pos++; // TeX avale les espaces après un mot de contrôle
      return [{ type: "text", value: SYMBOLS[name] }];
    }
    if (name === "c" || name === "v" || name === "u" || name === "H" || name === "k") return this.accent(name);
    if (name in IGNORE_ARGS) {
      this.skipStar();
      this.readOpt();
      for (let i = 0; i < IGNORE_ARGS[name]; i++) this.readArg();
      return [];
    }
    if (IGNORE_NOARGS.has(name)) return [];

    const def = ctx.macroDefs[name];
    if (def) {
      if (++ctx.expansions > 4000) return [];
      const args: string[] = [];
      for (let i = 0; i < def.n; i++) args.push(this.readArg() ?? "");
      const body = def.body.replace(/#(\d)/g, (_, d) => args[Number(d) - 1] ?? "");
      this.src = this.src.slice(0, start) + body + this.src.slice(this.pos);
      this.pos = start;
      return [];
    }
    return []; // commande inconnue : ignorée
  }

  /* ----------------------------- définitions ------------------------------ */

  private defineCommand() {
    this.skipStar();
    const rawName = (this.readArg() ?? "").trim();
    const nm = rawName.replace(/^\\/, "");
    const nOpt = this.readOpt();
    const n = nOpt && /^\d$/.test(nOpt.trim()) ? Number(nOpt.trim()) : 0;
    this.readOpt(); // valeur par défaut éventuelle (non supportée)
    const body = this.readArg() ?? "";
    if (!nm) return;
    this.ctx.macros["\\" + nm] = body;
    this.ctx.macroDefs[nm] = { n, body };
  }

  private defineDef() {
    const m = /^\\([a-zA-Z]+)/.exec(this.src.slice(this.pos));
    if (!m) return;
    this.pos += m[0].length;
    let n = 0;
    while (this.src[this.pos] === "#") { n++; this.pos += 2; }
    const body = this.readArg() ?? "";
    this.ctx.macros["\\" + m[1]] = body;
    this.ctx.macroDefs[m[1]] = { n, body };
  }

  private defineTheorem() {
    const star = this.skipStar();
    const nm = (this.readArg() ?? "").trim();
    const shared = this.readOpt()?.trim();
    const title = plainText(this.readArg() ?? "");
    this.readOpt();
    if (!nm) return;
    const counter = shared && this.ctx.theorems[shared] ? this.ctx.theorems[shared].counter : title;
    this.ctx.theorems[nm] = { label: title, kind: guessKind(nm, title), numbered: !star, counter };
  }

  /* ----------------------------- titres ----------------------------------- */

  private heading(name: string): Node[] {
    const ctx = this.ctx;
    const star = this.skipStar();
    this.readOpt();
    const raw = this.readArg() ?? "";
    const title = this.fragment(raw);

    const order = ctx.hasChapter
      ? ["chapter", "section", "subsection", "subsubsection", "paragraph", "subparagraph"]
      : ["section", "subsection", "subsubsection", "paragraph", "subparagraph"];
    let idx = order.indexOf(name);
    if (idx < 0) idx = order.length - 1;
    const level = Math.min(idx + 1, 4) as 1 | 2 | 3 | 4;

    let number = "";
    if (!star && level <= 3 && name !== "paragraph" && name !== "subparagraph") {
      ctx.sec[idx]++;
      for (let i = idx + 1; i < ctx.sec.length; i++) ctx.sec[i] = 0;
      const parts = ctx.sec.slice(0, idx + 1);
      number = parts.join(".");
      ctx.lastNumber = number;
      if (name === "chapter") number = `Chapitre ${number}`;
    }

    let id = slugify(plainOfNodes(title));
    let k = 2;
    const base = id;
    while (ctx.usedIds.has(id)) id = `${base}-${k++}`;
    ctx.usedIds.add(id);

    if (level <= 2) ctx.toc.push({ id, level, number, title });
    return [{ type: "section", level, number, id, title }];
  }

  /* ----------------------------- environnements --------------------------- */

  private findEnvEnd(name: string, from: number): { bodyEnd: number; after: number } {
    const re = /\\(begin|end)\{([^}]*)\}/g;
    re.lastIndex = from;
    let depth = 1;
    let m: RegExpExecArray | null;
    while ((m = re.exec(this.src))) {
      if (m[2] !== name) continue;
      if (m[1] === "begin") depth++;
      else if (--depth === 0) return { bodyEnd: m.index, after: m.index + m[0].length };
    }
    return { bodyEnd: this.src.length, after: this.src.length };
  }

  private rawEnv(name: string): string {
    const { bodyEnd, after } = this.findEnvEnd(name, this.pos);
    const body = this.src.slice(this.pos, bodyEnd);
    this.pos = after;
    return body;
  }

  private environment(): Node[] {
    const ctx = this.ctx;
    const name = (this.readArg() ?? "").trim();

    /* ---- mathématiques ---- */
    if (name in MATH_DISPLAY_ENVS) {
      let body = this.rawEnv(name);
      const mapped = MATH_DISPLAY_ENVS[name];
      if (name.startsWith("eqnarray")) body = body.replace(/&\s*=\s*&/g, "&=");
      return [{ type: "math", value: `\\begin{${mapped}}${body}\\end{${mapped}}`, display: true }];
    }
    if (name === "displaymath") return [{ type: "math", value: this.rawEnv(name), display: true }];
    if (name === "math") return [{ type: "math", value: this.rawEnv(name), display: false }];

    /* ---- code ---- */
    if (RAW_CODE_ENVS.has(name)) {
      if (name === "lstlisting") this.readOpt();
      if (name === "minted") this.readArg();
      const body = this.rawEnv(name).replace(/^\n/, "").replace(/\s+$/, "");
      return [{ type: "code", value: body, inline: false }];
    }

    /* ---- figures TikZ ---- */
    if (PICTURE_ENVS.has(name)) {
      this.rawEnv(name);
      return [{
        type: "placeholder",
        message:
          "Figure TikZ non affichée sur le site. Exportez-la en image (PNG/SVG), placez-la dans public/enseignement/figures/ puis utilisez \\includegraphics{nom.png}.",
      }];
    }

    /* ---- tableaux ---- */
    if (name === "tabular" || name === "tabular*" || name === "longtable" || name === "tabularx" || name === "array") {
      if (name === "tabular*" || name === "tabularx") this.readArg();
      this.readOpt();
      const spec = this.readArg() ?? "";
      const body = this.rawEnv(name);
      return [this.buildTable(spec, body)];
    }

    /* ---- listes ---- */
    if (name === "enumerate" || name === "itemize" || name === "description") return this.list(name);

    /* ---- QCM ---- */
    if (name === "reponses" || name === "choix" || name === "answers") {
      this.readOpt();
      return [this.answersEnv(name)];
    }
    if (name === "explication" || name === "explanation") {
      return [{ type: "explanation", children: this.parseNodes({ env: name }) }];
    }
    if ((name === "question" || name === "qcm") && !ctx.theorems[name]) {
      this.readOpt();
      return this.questionEnv(name);
    }

    /* ---- preuves ---- */
    if (PROOF_ENVS.has(name)) {
      const opt = this.readOpt();
      const kids = this.parseNodes({ env: name });
      return [{ type: "proof", label: opt ? plainText(opt) : "Preuve", children: kids }];
    }

    /* ---- corrections ---- */
    if (name in CORRECTION_LABELS) {
      this.readOpt();
      const kids = this.parseNodes({ env: name });
      ctx.hasCorrections = true;
      return [{ type: "correction", label: CORRECTION_LABELS[name], children: kids }];
    }

    /* ---- théorèmes, définitions, exercices… ---- */
    const bare = name.replace(/\*$/, "");
    const spec = ctx.theorems[bare] ?? THEOREM_BUILTINS[bare];
    if (spec) {
      const opt = this.readOpt();
      let number: string | undefined;
      if (spec.numbered && !name.endsWith("*")) {
        ctx.counters[spec.counter] = (ctx.counters[spec.counter] ?? 0) + 1;
        number = String(ctx.counters[spec.counter]);
        ctx.lastNumber = number;
      }
      const optTitle = opt ? this.fragment(opt) : undefined;
      const kids = this.parseNodes({ env: name });
      return [{ type: "block", kind: spec.kind, env: bare, label: spec.label, number, optTitle, children: kids }];
    }

    /* ---- mise en forme ---- */
    switch (name) {
      case "center": case "centering":
        return [{ type: "align", align: "center", children: this.parseNodes({ env: name }) }];
      case "flushleft":
        return [{ type: "align", align: "left", children: this.parseNodes({ env: name }) }];
      case "flushright":
        return [{ type: "align", align: "right", children: this.parseNodes({ env: name }) }];
      case "quote": case "quotation":
        return [{ type: "quote", children: this.parseNodes({ env: name }) }];
      case "abstract":
        return [{ type: "block", kind: "box", env: name, label: "Résumé", children: this.parseNodes({ env: name }) }];
      case "tcolorbox": case "mdframed": case "framed": {
        this.readOpt();
        return [{ type: "block", kind: "box", env: name, label: "", children: this.parseNodes({ env: name }) }];
      }
      case "table": case "figure": case "table*": case "figure*": {
        this.readOpt();
        const kind = name.startsWith("table") ? "table" : "figure";
        ctx.counters["__" + kind] = (ctx.counters["__" + kind] ?? 0) + 1;
        const kids = this.parseNodes({ env: name });
        const cap = kids.find((k) => k.type === "caption") as Extract<Node, { type: "caption" }> | undefined;
        return [{
          type: "figure",
          kind,
          number: ctx.counters["__" + kind],
          children: kids.filter((k) => k.type !== "caption"),
          caption: cap?.children,
        }];
      }
      case "minipage": case "multicols": case "adjustbox": case "spacing": {
        this.readOpt();
        this.readArg();
        return this.parseNodes({ env: name });
      }
      case "document":
      default:
        return this.parseNodes({ env: name });
    }
  }

  /* ----------------------------- QCM -------------------------------------- */

  private answersEnv(name: string): Node {
    const choices: Choice[] = [];
    this.parseNodes({ env: name, item: true }); // texte avant la première réponse (ignoré)
    let reason = this.lastStop;
    while (reason === "item") {
      let correct = false;
      let adv = "\\item".length;
      if (this.src.startsWith("\\bonne", this.pos)) { correct = true; adv = "\\bonne".length; }
      else if (this.src.startsWith("\\mauvaise", this.pos)) adv = "\\mauvaise".length;
      this.pos += adv;
      const children = this.parseNodes({ env: name, item: true });
      reason = this.lastStop;
      choices.push({ correct, children });
    }
    return { type: "choices", choices };
  }

  private questionEnv(name: string): Node[] {
    const ctx = this.ctx;
    const kids = this.parseNodes({ env: name });
    const ch = kids.find((k) => k.type === "choices") as Extract<Node, { type: "choices" }> | undefined;
    const ex = kids.find((k) => k.type === "explanation") as Extract<Node, { type: "explanation" }> | undefined;
    const statement = kids.filter((k) => k.type !== "choices" && k.type !== "explanation");
    if (!ch || ch.choices.length === 0) {
      return [{ type: "block", kind: "box", env: name, label: "Question", children: statement }];
    }
    ctx.counters["__question"] = (ctx.counters["__question"] ?? 0) + 1;
    const id = ctx.counters["__question"];
    ctx.lastNumber = String(id);
    ctx.questions.push({
      id,
      correct: ch.choices.flatMap((c, i) => (c.correct ? [i] : [])),
    });
    return [{ type: "question", id, statement, choices: ch.choices, explanation: ex?.children }];
  }

  /* ----------------------------- listes ----------------------------------- */

  private list(kind: "enumerate" | "itemize" | "description"): Node[] {
    const ctx = this.ctx;
    const opt = this.readOpt();
    const isEnum = kind === "enumerate";
    const depth = isEnum ? ++ctx.enumDepth : kind === "itemize" ? ++ctx.itemDepth : 0;

    let labelSpec: string | null = null;
    let start = 1;
    if (opt && kind !== "description") {
      const parts = splitTopComma(opt);
      if (!opt.includes("=")) {
        labelSpec = opt.trim();
      } else {
        for (const p of parts) {
          const eq = p.indexOf("=");
          if (eq < 0) continue;
          const key = p.slice(0, eq).trim();
          let val = p.slice(eq + 1).trim();
          if (key === "label" || key === "label*") {
            if (val.startsWith("{") && val.endsWith("}")) val = val.slice(1, -1);
            labelSpec = val;
          } else if (key === "start") {
            start = Number(val) || 1;
          }
        }
      }
    }

    const items: ListItem[] = [];
    this.parseNodes({ env: kind, item: true }); // contenu avant le premier \item (ignoré)
    let reason = this.lastStop;
    let n = start - 1;
    while (reason === "item") {
      this.pos += "\\item".length;
      const termRaw = this.readOpt();
      let label: Node[];
      if (termRaw !== null) {
        label = this.fragment(termRaw);
      } else if (kind === "description") {
        label = [];
      } else {
        n++;
        label = this.fragment(isEnum ? this.enumLabel(labelSpec, depth, n) : this.bullet(labelSpec, depth));
      }
      const children = this.parseNodes({ env: kind, item: true });
      reason = this.lastStop;
      items.push({ label, children });
    }

    if (isEnum) ctx.enumDepth--;
    else if (kind === "itemize") ctx.itemDepth--;
    return [{ type: "list", kind, items }];
  }

  private bullet(spec: string | null, depth: number): string {
    if (spec) return spec;
    return ["•", "–", "∗", "·"][Math.min(depth, 4) - 1] ?? "•";
  }

  private enumLabel(spec: string | null, depth: number, n: number): string {
    const defaults = ["\\arabic*.", "(\\alph*)", "\\roman*.", "\\Alph*."];
    let s = spec ?? defaults[Math.min(depth, 4) - 1];
    let replaced = false;
    s = s.replace(/\\(arabic|alph|Alph|roman|Roman)\*/g, (_, k) => {
      replaced = true;
      return counterValue(k, n);
    });
    if (!replaced && spec) {
      // syntaxe du paquet `enumerate` : [a)], [(i)], [1°)] …
      let d = 0;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === "{") d++;
        else if (c === "}") d--;
        else if (d === 0 && s[i - 1] !== "\\") {
          const kind = { "1": "arabic", a: "alph", A: "Alph", i: "roman", I: "Roman" }[c] as
            | "arabic" | "alph" | "Alph" | "roman" | "Roman" | undefined;
          if (kind) {
            s = s.slice(0, i) + counterValue(kind, n) + s.slice(i + 1);
            break;
          }
        }
      }
    }
    return s;
  }

  /* ----------------------------- tableaux --------------------------------- */

  private buildTable(spec: string, body: string): Node {
    const { aligns, vlines } = parseColSpec(spec);
    const rowStrs = splitTop(body, "rows");
    const rows: TableRow[] = [];
    for (const raw of rowStrs) {
      let r = raw;
      let borderTop = false;
      for (;;) {
        const m = /^\s*\\(hline|toprule|midrule|bottomrule|cline\{[^}]*\})/.exec(r);
        if (!m) break;
        borderTop = true;
        r = r.slice(m[0].length);
      }
      // \hline en fin de ligne (avant le \\ suivant) : appartient à la ligne suivante, déjà géré.
      const trailing = /\\(hline|bottomrule)\s*$/.exec(r);
      let borderBottom = false;
      if (trailing) {
        borderBottom = true;
        r = r.slice(0, trailing.index);
      }
      if (r.trim() === "") {
        if (borderTop && rows.length) rows[rows.length - 1].borderBottom = true;
        continue;
      }
      const cells: TableCell[] = [];
      let col = 0;
      for (const cellRaw of splitTop(r, "cells")) {
        const t = cellRaw.trim();
        if (t.startsWith("\\multicolumn")) {
          const p = new Parser(t, this.ctx, this.depth + 1);
          p.pos = "\\multicolumn".length;
          const n = Number((p.readArg() ?? "1").trim()) || 1;
          const sp = p.readArg() ?? "";
          const content = p.readArg() ?? "";
          const a = parseColSpec(sp).aligns[0];
          cells.push({ children: this.fragment(content), colSpan: n, align: a });
          col += n;
        } else {
          cells.push({ children: this.fragment(t), colSpan: 1, align: aligns[col] });
          col++;
        }
      }
      rows.push({ cells, borderTop, borderBottom });
    }
    return { type: "table", rows, vlines };
  }
}

function s0(s: string, i: number): string {
  return s[i] ?? "|";
}

function splitTopComma(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  let d = 0;
  for (const c of s) {
    if (c === "{") d++;
    else if (c === "}") d--;
    if (c === "," && d === 0) { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur);
  return out;
}

/* -------------------------------------------------------------------------- */
/*  API publique                                                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_KATEX_MACROS: Record<string, string> = {
  "\\bm": "\\boldsymbol{#1}",
  "\\mathbbm": "\\mathbb{#1}",
  "\\mathds": "\\mathbb{#1}",
  "\\dsum": "\\displaystyle\\sum",
};

function newCtx(): Ctx {
  return {
    macros: { ...DEFAULT_KATEX_MACROS },
    macroDefs: {},
    theorems: {},
    counters: {},
    sec: [0, 0, 0, 0, 0, 0],
    labels: {},
    lastNumber: "",
    footnotes: [],
    meta: {},
    toc: [],
    usedIds: new Set(),
    hasChapter: false,
    hasCorrections: false,
    questions: [],
    expansions: 0,
    enumDepth: 0,
    itemDepth: 0,
  };
}

/** Lit l'en-tête `%% cle: valeur` placé en tête de fichier. */
export function parseMeta(source: string): DocMeta {
  const meta: DocMeta = {};
  const aliases: Record<string, keyof DocMeta> = {
    titre: "titre", title: "titre",
    niveau: "niveau", level: "niveau",
    annee: "annee", année: "annee", year: "annee",
    matiere: "matiere", matière: "matiere", module: "matiere",
    description: "description", resume: "description", résumé: "description",
    pdf: "pdf",
    ordre: "ordre", order: "ordre",
    auteur: "auteur", date: "date",
  };
  for (const line of source.split("\n")) {
    const t = line.trim();
    if (t === "") continue;
    if (!t.startsWith("%")) break;
    const m = /^%+\s*([A-Za-zéèÉ_]+)\s*:\s*(.*)$/.exec(t);
    if (!m) continue;
    const key = aliases[m[1].toLowerCase()];
    if (!key) continue;
    const val = m[2].trim();
    if (key === "ordre") meta.ordre = Number(val) || 0;
    else (meta as Record<string, string>)[key] = val;
  }
  return meta;
}

/** Convertit un source LaTeX en arbre prêt à être affiché. */
export function parseLatex(source: string, opts: { sharedMacros?: string } = {}): LatexDoc {
  const ctx = newCtx();
  const header = parseMeta(source);

  if (opts.sharedMacros) {
    new Parser(stripComments(opts.sharedMacros), ctx).parseNodes({});
  }

  const text = stripComments(source);
  ctx.hasChapter = /\\chapter\b/.test(text);

  let body = text;
  const docStart = text.indexOf("\\begin{document}");
  if (docStart >= 0) {
    new Parser(text.slice(0, docStart), ctx).parseNodes({}); // préambule : macros, théorèmes…
    body = text.slice(docStart + "\\begin{document}".length);
    const docEnd = body.lastIndexOf("\\end{document}");
    if (docEnd >= 0) body = body.slice(0, docEnd);
  }

  const nodes = new Parser(body, ctx).parseNodes({});
  return {
    nodes,
    toc: ctx.toc,
    labels: ctx.labels,
    footnotes: ctx.footnotes,
    macros: ctx.macros,
    meta: { ...ctx.meta, ...header },
    hasCorrections: ctx.hasCorrections,
    questions: ctx.questions,
  };
}
