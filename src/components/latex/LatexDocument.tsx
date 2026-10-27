import { createContext, memo, useContext, useMemo, useState, type ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, ChevronDown, Eye, EyeOff, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LatexDoc, Node } from "@/lib/latex/types";

interface RenderCtx {
  macros: Record<string, string>;
  labels: Record<string, string>;
  showAll: boolean;
}
interface QuizState {
  answers: Record<number, number[]>;
  submitted: boolean;
  toggle: (qid: number, index: number, multiple: boolean) => void;
}
const QuizCtx = createContext<QuizState>({ answers: {}, submitted: false, toggle: () => {} });

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

const Ctx = createContext<RenderCtx>({ macros: {}, labels: {}, showAll: false });

/* ------------------------------------------------------------------------ */
/*  Mathématiques                                                           */
/* ------------------------------------------------------------------------ */

const prepMath = (tex: string) =>
  tex
    .replace(/\\label\{[^}]*\}/g, "")
    .replace(/\\intertext\{([^}]*)\}/g, "\\text{$1}\\\\")
    ;

const MathView = memo(({ tex, display }: { tex: string; display: boolean }) => {
  const { macros } = useContext(Ctx);
  const html = useMemo(
    () =>
      katex.renderToString(prepMath(tex), {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        macros: { ...macros },
        errorColor: "#cc0000",
      }),
    [tex, display, macros],
  );
  return display ? (
    <div className="latex-display my-4 overflow-x-auto overflow-y-hidden text-center" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
});
MathView.displayName = "MathView";

/* ------------------------------------------------------------------------ */
/*  Aides                                                                   */
/* ------------------------------------------------------------------------ */

function isBlock(n: Node): boolean {
  switch (n.type) {
    case "text": case "br": case "link": case "footnote": case "ref": case "decl": case "caption":
      return false;
    case "math": return n.display;
    case "code": return !n.inline;
    case "style": return n.children.some(isBlock);
    case "par": return false;
    default: return true;
  }
}

const blank = (n: Node) => n.type === "text" && n.value.trim() === "";

function trimInline(nodes: Node[]): Node[] {
  let a = 0;
  let b = nodes.length;
  while (a < b && (blank(nodes[a]) || nodes[a].type === "br")) a++;
  while (b > a && (blank(nodes[b - 1]) || nodes[b - 1].type === "br")) b--;
  const out = nodes.slice(a, b);
  if (out[0]?.type === "text") out[0] = { type: "text", value: out[0].value.replace(/^\s+/, "") };
  const last = out.length - 1;
  if (last >= 0 && out[last].type === "text")
    out[last] = { type: "text", value: (out[last] as { value: string }).value.replace(/\s+$/, "") };
  return out;
}

const COLORS: Record<string, string> = {
  red: "#dc2626", blue: "#2563eb", green: "#16a34a", orange: "#ea580c", purple: "#9333ea",
  gray: "#6b7280", grey: "#6b7280", black: "#000", white: "#fff", cyan: "#0891b2", magenta: "#c026d3",
  yellow: "#ca8a04", brown: "#92400e",
};

/* ------------------------------------------------------------------------ */
/*  Inline                                                                  */
/* ------------------------------------------------------------------------ */

function Inline({ node }: { node: Node }): ReactNode {
  const { labels } = useContext(Ctx);
  switch (node.type) {
    case "text": return <>{node.value}</>;
    case "math": return <MathView tex={node.value} display={false} />;
    case "br": return <br />;
    case "style": {
      const kids = <InlineList nodes={node.children} />;
      switch (node.style) {
        case "bold": return <strong>{kids}</strong>;
        case "italic": return <em>{kids}</em>;
        case "underline": return <u>{kids}</u>;
        case "mono": return <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{kids}</code>;
        case "smallcaps": return <span style={{ fontVariant: "small-caps" }}>{kids}</span>;
        case "sans": return <span className="font-sans">{kids}</span>;
        case "serif": return <span className="font-serif">{kids}</span>;
        case "large": return <span className="text-[1.25em]">{kids}</span>;
        case "small": return <span className="text-[0.85em]">{kids}</span>;
        case "sup": return <sup>{kids}</sup>;
        case "sub": return <sub>{kids}</sub>;
        case "boxed": return <span className="rounded border border-foreground/60 px-1.5">{kids}</span>;
        case "color": return <span style={{ color: COLORS[node.color ?? ""] ?? node.color }}>{kids}</span>;
        default: return <>{kids}</>;
      }
    }
    case "link":
      return (
        <a href={node.href} target="_blank" rel="noreferrer" className="text-secondary underline underline-offset-2 hover:text-accent">
          <InlineList nodes={node.children} />
        </a>
      );
    case "footnote":
      return (
        <sup>
          <a href={`#fn-${node.index}`} id={`fnref-${node.index}`} className="text-secondary no-underline hover:underline">
            {node.index}
          </a>
        </sup>
      );
    case "ref": {
      const v = labels[node.key] ?? "?";
      return <>{node.paren ? `(${v})` : v}</>;
    }
    case "code":
      return <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{node.value}</code>;
    default: return null;
  }
}

function InlineList({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((n, i) => (
        <Inline key={i} node={n} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------------ */
/*  Blocs                                                                   */
/* ------------------------------------------------------------------------ */

function Correction({ label, children }: { label: string; children: Node[] }) {
  const { showAll } = useContext(Ctx);
  const [open, setOpen] = useState(false);
  const visible = open || showAll;
  return (
    <div className="my-4 rounded-lg border border-dashed border-secondary/40 print:border-solid">
      <button
        type="button"
        onClick={() => setOpen(!visible)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-secondary hover:bg-muted/60 print:hidden"
        aria-expanded={visible}
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", visible && "rotate-180")} />
        {visible ? `Masquer · ${label}` : `Voir · ${label}`}
      </button>
      <div className={cn("border-t border-dashed border-secondary/30 px-4 py-3", !visible && "hidden")}>
        <div className="mb-2 hidden text-sm font-semibold italic text-secondary print:block">{label}</div>
        <Blocks nodes={children} />
      </div>
    </div>
  );
}

const BLOCK_STYLES: Record<string, string> = {
  theorem: "border-l-4 border-primary bg-primary/5",
  definition: "border-l-4 border-secondary bg-secondary/5",
  remark: "border-l-4 border-muted-foreground/40 bg-muted/50",
  exercise: "border border-border border-l-4 border-l-accent bg-card shadow-sm",
  box: "border border-border bg-muted/40",
};

function BlockNode({ node }: { node: Extract<Node, { type: "block" }> }) {
  const heading = node.label
    ? `${node.label}${node.number ? ` ${node.number}` : ""}`
    : "";
  return (
    <section className={cn("my-6 rounded-md px-5 py-4 break-inside-avoid-page", BLOCK_STYLES[node.kind])}>
      {(heading || node.optTitle) && (
        <div className="mb-2 flex flex-wrap items-baseline gap-2">
          {heading && (
            <span
              className={cn(
                "font-serif font-bold",
                node.kind === "exercise" ? "text-lg text-accent" : "text-primary",
                node.kind === "remark" && "italic",
              )}
            >
              {heading}
            </span>
          )}
          {node.optTitle && (
            <span className="text-muted-foreground">
              (<InlineList nodes={node.optTitle} />)
            </span>
          )}
        </div>
      )}
      <Blocks nodes={node.children} />
    </section>
  );
}

function ListNode({ node }: { node: Extract<Node, { type: "list" }> }) {
  return (
    <div className="my-3 space-y-1.5 pl-2 sm:pl-4">
      {node.items.map((it, i) =>
        node.kind === "description" ? (
          <div key={i}>
            <span className="font-semibold">
              <InlineList nodes={it.label} />
            </span>{" "}
            <div className="inline">
              <Blocks nodes={it.children} tight />
            </div>
          </div>
        ) : (
          <div key={i} className="flex gap-2.5">
            <div className="min-w-[1.6rem] shrink-0 text-right">
              <InlineList nodes={it.label} />
            </div>
            <div className="min-w-0 flex-1">
              <Blocks nodes={it.children} tight />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function TableNode({ node }: { node: Extract<Node, { type: "table" }> }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="mx-auto border-collapse">
        <tbody>
          {node.rows.map((row, i) => (
            <tr key={i} className={cn(row.borderTop && "border-t border-foreground/70", row.borderBottom && "border-b border-foreground/70")}>
              {row.cells.map((c, j) => (
                <td
                  key={j}
                  colSpan={c.colSpan}
                  className={cn("px-3 py-1.5 align-middle", node.vlines && "border-x border-foreground/40")}
                  style={{ textAlign: c.align ?? "left" }}
                >
                  <Blocks nodes={c.children} tight />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestionNode({ node }: { node: Extract<Node, { type: "question" }> }) {
  const { answers, submitted, toggle } = useContext(QuizCtx);
  const selected = answers[node.id] ?? [];
  const correctIdx = node.choices.flatMap((c, i) => (c.correct ? [i] : []));
  const multiple = correctIdx.length > 1;
  const ok = sameSet(selected, correctIdx);

  return (
    <section className="my-6 rounded-lg border border-border bg-card px-5 py-4 shadow-sm break-inside-avoid-page">
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <span className="font-serif text-lg font-bold text-accent">Question {node.id}</span>
        {multiple && <span className="text-xs text-muted-foreground">plusieurs réponses possibles</span>}
      </div>
      <Blocks nodes={node.statement} tight />
      <div className="mt-3 space-y-2" role={multiple ? "group" : "radiogroup"}>
        {node.choices.map((c, i) => {
          const isSel = selected.includes(i);
          const state = !submitted
            ? isSel ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
            : c.correct
              ? "border-emerald-500 bg-emerald-50 text-emerald-950"
              : isSel ? "border-red-500 bg-red-50 text-red-950" : "border-border opacity-70";
          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              role={multiple ? "checkbox" : "radio"}
              aria-checked={isSel}
              onClick={() => toggle(node.id, i, multiple)}
              className={cn("flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors", state)}
            >
              <span
                className={cn(
                  "mt-1 flex h-4 w-4 shrink-0 items-center justify-center border text-[10px]",
                  multiple ? "rounded-sm" : "rounded-full",
                  isSel ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60",
                )}
              >
                {isSel && "✓"}
              </span>
              <span className="min-w-0 flex-1"><Blocks nodes={c.children} tight /></span>
              {submitted && c.correct && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
              {submitted && !c.correct && isSel && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
            </button>
          );
        })}
      </div>
      {submitted && (
        <div className="mt-3 text-sm">
          <p className={cn("font-semibold", ok ? "text-emerald-700" : "text-red-700")}>
            {ok ? "Bonne réponse." : selected.length === 0 ? "Pas de réponse." : "Réponse incorrecte."}
          </p>
          {node.explanation && (
            <div className="mt-2 rounded-md bg-muted/60 px-3 py-2">
              <Blocks nodes={node.explanation} tight />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function QuizBar({ doc, state, onSubmit, onReset }: {
  doc: LatexDoc; state: QuizState; onSubmit: () => void; onReset: () => void;
}) {
  const total = doc.questions.length;
  const answered = doc.questions.filter((q) => (state.answers[q.id] ?? []).length > 0).length;
  const score = doc.questions.filter((q) => sameSet(state.answers[q.id] ?? [], q.correct)).length;
  return (
    <div className="sticky bottom-4 z-10 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur print:hidden">
      {state.submitted ? (
        <>
          <p className="font-serif text-lg font-bold text-primary">Score : {score} / {total}</p>
          <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> Recommencer
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{answered} / {total} question{total > 1 ? "s" : ""} répondue{answered > 1 ? "s" : ""}</p>
          <button type="button" onClick={onSubmit} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90">
            Valider mes réponses
          </button>
        </>
      )}
    </div>
  );
}

function BlockOne({ node }: { node: Node }): ReactNode {
  switch (node.type) {
    case "math": return <MathView tex={node.value} display />;
    case "section": {
      const num = node.number ? <span className="mr-2 text-accent">{node.number}</span> : null;
      const inner = (
        <>
          {num}
          <InlineList nodes={node.title} />
        </>
      );
      if (node.level === 1)
        return <h2 id={node.id} className="mb-4 mt-10 scroll-mt-24 border-b border-border pb-2 font-serif text-2xl font-bold text-primary">{inner}</h2>;
      if (node.level === 2)
        return <h3 id={node.id} className="mb-3 mt-8 scroll-mt-24 font-serif text-xl font-bold text-primary">{inner}</h3>;
      if (node.level === 3)
        return <h4 id={node.id} className="mb-2 mt-6 scroll-mt-24 font-serif text-lg font-semibold text-primary">{inner}</h4>;
      return <h5 id={node.id} className="mb-1 mt-4 scroll-mt-24 font-semibold text-primary">{inner}</h5>;
    }
    case "question": return <QuestionNode node={node} />;
    case "list": return <ListNode node={node} />;
    case "block": return <BlockNode node={node} />;
    case "correction": return <Correction label={node.label} children={node.children} />;
    case "proof":
      return (
        <div className="my-4">
          <span className="italic font-semibold">{node.label}.</span>{" "}
          <div className="inline"><Blocks nodes={node.children} tight /></div>
          <div className="text-right text-lg leading-none">∎</div>
        </div>
      );
    case "align":
      return (
        <div style={{ textAlign: node.align }}>
          <Blocks nodes={node.children} />
        </div>
      );
    case "quote":
      return (
        <blockquote className="my-4 border-l-2 border-muted-foreground/40 pl-4 italic text-foreground/80">
          <Blocks nodes={node.children} />
        </blockquote>
      );
    case "code":
      return (
        <pre className="my-4 overflow-x-auto rounded-md border border-border bg-muted p-4 font-mono text-sm leading-relaxed">
          {node.value}
        </pre>
      );
    case "table": return <TableNode node={node} />;
    case "figure":
      return (
        <figure className="my-6 text-center">
          <Blocks nodes={node.children} />
          {node.caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              <strong>{node.kind === "table" ? "Tableau" : "Figure"} {node.number}.</strong>{" "}
              <InlineList nodes={node.caption} />
            </figcaption>
          )}
        </figure>
      );
    case "image":
      return (
        <div className="my-4 text-center">
          <img src={node.src} alt="" style={{ maxWidth: node.width ?? "100%" }} className="mx-auto h-auto max-w-full" />
        </div>
      );
    case "placeholder":
      return (
        <div className="my-4 rounded-md border border-dashed border-muted-foreground/50 bg-muted/40 p-4 text-sm text-muted-foreground print:hidden">
          {node.message}
        </div>
      );
    case "rule": return <hr className="my-4 border-border" />;
    case "vspace":
      return <div style={{ height: node.size === "big" ? 24 : node.size === "med" ? 12 : 6 }} />;
    case "style":
      return (
        <div
          className={cn(node.style === "bold" && "font-bold", node.style === "italic" && "italic", node.style === "large" && "text-xl", node.style === "small" && "text-sm")}
          style={node.style === "color" ? { color: COLORS[node.color ?? ""] ?? node.color } : undefined}
        >
          <Blocks nodes={node.children} />
        </div>
      );
    default: return null;
  }
}

/** Regroupe les éléments « en ligne » en paragraphes et affiche les blocs tels quels. */
function Blocks({ nodes, tight = false }: { nodes: Node[]; tight?: boolean }) {
  const out: ReactNode[] = [];
  let buf: Node[] = [];
  let key = 0;
  const flush = () => {
    const t = trimInline(buf);
    buf = [];
    if (t.length === 0) return;
    out.push(
      <p key={key++} className={cn("leading-[1.8]", tight ? "mb-2 last:mb-0" : "mb-4")}>
        <InlineList nodes={t} />
      </p>,
    );
  };
  for (const n of nodes) {
    if (n.type === "par") flush();
    else if (isBlock(n)) {
      flush();
      out.push(<BlockOne key={key++} node={n} />);
    } else buf.push(n);
  }
  flush();
  return <>{out}</>;
}

/* ------------------------------------------------------------------------ */
/*  Composants publics                                                      */
/* ------------------------------------------------------------------------ */

export function LatexToc({ doc, className }: { doc: LatexDoc; className?: string }) {
  if (doc.toc.length < 2) return null;
  return (
    <nav className={className} aria-label="Sommaire">
      <p className="mb-3 font-serif text-sm font-bold uppercase tracking-wider text-primary">Sommaire</p>
      <ul className="space-y-1.5 border-l border-border text-sm">
        {doc.toc.map((t) => (
          <li key={t.id} style={{ paddingLeft: t.level === 1 ? 12 : 26 }}>
            <a href={`#${t.id}`} className="text-muted-foreground transition-colors hover:text-accent">
              {t.number && <span className="mr-1.5">{t.number}</span>}
              <Ctx.Provider value={{ macros: doc.macros, labels: doc.labels, showAll: false }}>
                <InlineList nodes={t.title} />
              </Ctx.Provider>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CorrectionsToggle({ showAll, onChange }: { showAll: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!showAll)}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted print:hidden"
    >
      {showAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      {showAll ? "Masquer les corrections" : "Afficher les corrections"}
    </button>
  );
}

const LatexDocument = ({ doc, showAll = false }: { doc: LatexDoc; showAll?: boolean }) => {
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const quiz: QuizState = {
    answers,
    submitted,
    toggle: (qid, index, multiple) =>
      setAnswers((prev) => {
        const cur = prev[qid] ?? [];
        const next = multiple
          ? cur.includes(index) ? cur.filter((x) => x !== index) : [...cur, index]
          : [index];
        return { ...prev, [qid]: next };
      }),
  };

  return (
    <Ctx.Provider value={{ macros: doc.macros, labels: doc.labels, showAll }}>
      <QuizCtx.Provider value={quiz}>
        <div className="latex-doc text-[1.05rem] text-foreground">
          <Blocks nodes={doc.nodes} />
          {doc.questions.length > 0 && (
            <QuizBar
              doc={doc}
              state={quiz}
              onSubmit={() => setSubmitted(true)}
              onReset={() => { setAnswers({}); setSubmitted(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          )}
          {doc.footnotes.length > 0 && (
            <footer className="mt-12 border-t border-border pt-4 text-sm text-muted-foreground">
              <ol className="space-y-1">
                {doc.footnotes.map((f, i) => (
                  <li key={i} id={`fn-${i + 1}`}>
                    <sup>{i + 1}</sup> <InlineList nodes={f.filter((n) => !isBlock(n))} />{" "}
                    <a href={`#fnref-${i + 1}`} className="no-underline hover:underline">↩</a>
                  </li>
                ))}
              </ol>
            </footer>
          )}
        </div>
      </QuizCtx.Provider>
    </Ctx.Provider>
  );
};

export default LatexDocument;
