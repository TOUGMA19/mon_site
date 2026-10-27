import { BookOpen, ClipboardList, ListChecks, PenLine, type LucideIcon } from "lucide-react";
import { parseMeta } from "@/lib/latex/parser";
import type { DocMeta } from "@/lib/latex/types";

export type CategoryId = "cours" | "td" | "devoirs" | "quiz";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const CATEGORIES: Category[] = [
  { id: "cours", label: "Cours", description: "Polycopiés et notes de cours", icon: BookOpen },
  { id: "td", label: "TD", description: "Feuilles d'exercices de travaux dirigés", icon: PenLine },
  { id: "devoirs", label: "Anciens devoirs", description: "Sujets de devoirs et d'examens des années précédentes", icon: ClipboardList },
  { id: "quiz", label: "Quiz", description: "QCM d'entraînement corrigés automatiquement", icon: ListChecks },
];

export interface TeachingDoc {
  category: CategoryId;
  slug: string;
  source: string;
  meta: DocMeta & { titre: string };
}

const files = import.meta.glob("/src/content/enseignement/*/*.tex", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const shared = import.meta.glob("/src/content/enseignement/macros.tex", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const sharedMacros: string = Object.values(shared)[0] ?? "";

const prettify = (slug: string) =>
  slug.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const documents: TeachingDoc[] = Object.entries(files)
  .map(([path, source]) => {
    const m = /\/enseignement\/([^/]+)\/([^/]+)\.tex$/.exec(path);
    if (!m) return null;
    const category = m[1] as CategoryId;
    if (!CATEGORIES.some((c) => c.id === category)) return null;
    const meta = parseMeta(source);
    return { category, slug: m[2], source, meta: { ...meta, titre: meta.titre ?? prettify(m[2]) } };
  })
  .filter((d): d is TeachingDoc => d !== null)
  .sort((a, b) => {
    if (a.category === "devoirs" && b.category === "devoirs") {
      const y = (b.meta.annee ?? "").localeCompare(a.meta.annee ?? "");
      if (y) return y;
    }
    const o = (a.meta.ordre ?? 999) - (b.meta.ordre ?? 999);
    return o || a.meta.titre.localeCompare(b.meta.titre, "fr", { numeric: true });
  });

export const docsOf = (c: CategoryId) => documents.filter((d) => d.category === c);
export const findDoc = (c?: string, slug?: string) =>
  documents.find((d) => d.category === c && d.slug === slug);
