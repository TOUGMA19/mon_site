export type StyleName =
  | "bold"
  | "italic"
  | "underline"
  | "mono"
  | "smallcaps"
  | "sans"
  | "serif"
  | "large"
  | "small"
  | "sup"
  | "sub"
  | "boxed"
  | "color"
  | "plain";

export type BlockKind = "theorem" | "definition" | "remark" | "exercise" | "box";

export interface ListItem {
  /** Étiquette affichée (numéro, puce, ou terme pour `description`). */
  label: Node[];
  children: Node[];
}

export interface TableCell {
  children: Node[];
  colSpan: number;
  align?: "left" | "center" | "right";
}

export interface TableRow {
  cells: TableCell[];
  borderTop: boolean;
  borderBottom: boolean;
}

export type Node =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean }
  | { type: "style"; style: StyleName; color?: string; children: Node[] }
  | { type: "decl"; style: StyleName | "center" | "left" | "right"; color?: string }
  | { type: "br" }
  | { type: "par" }
  | { type: "vspace"; size: "small" | "med" | "big" }
  | { type: "section"; level: 1 | 2 | 3 | 4; number: string; id: string; title: Node[] }
  | { type: "list"; kind: "enumerate" | "itemize" | "description"; items: ListItem[] }
  | {
      type: "block";
      kind: BlockKind;
      env: string;
      label: string;
      number?: string;
      optTitle?: Node[];
      children: Node[];
    }
  | { type: "correction"; label: string; children: Node[] }
  | { type: "proof"; label: string; children: Node[] }
  | { type: "align"; align: "center" | "left" | "right"; children: Node[] }
  | { type: "quote"; children: Node[] }
  | { type: "code"; value: string; inline: boolean }
  | { type: "table"; rows: TableRow[]; vlines: boolean }
  | {
      type: "figure";
      kind: "figure" | "table";
      number: number;
      children: Node[];
      caption?: Node[];
    }
  | { type: "caption"; children: Node[] }
  | { type: "link"; href: string; children: Node[] }
  | { type: "footnote"; index: number }
  | { type: "ref"; key: string; paren: boolean }
  | { type: "image"; src: string; width?: string }
  | { type: "placeholder"; message: string }
  | { type: "rule" };

export interface TocEntry {
  id: string;
  level: number;
  number: string;
  title: Node[];
}

export interface DocMeta {
  titre?: string;
  niveau?: string;
  annee?: string;
  matiere?: string;
  description?: string;
  pdf?: string;
  ordre?: number;
  auteur?: string;
  date?: string;
}

export interface LatexDoc {
  nodes: Node[];
  toc: TocEntry[];
  labels: Record<string, string>;
  footnotes: Node[][];
  /** Macros au format KaTeX (clé avec antislash). */
  macros: Record<string, string>;
  meta: DocMeta;
  hasCorrections: boolean;
}
