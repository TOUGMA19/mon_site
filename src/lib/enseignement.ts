import { BookOpen, ClipboardList, Lightbulb, ListChecks, PenLine, type LucideIcon } from "lucide-react";
import { parseMeta } from "@/lib/latex/parser";
import type { DocMeta } from "@/lib/latex/types";

export type CategoryId = "cours" | "methodes" | "td" | "devoirs" | "quiz";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const CATEGORIES: Category[] = [
  { id: "cours", label: "Cours", description: "Polycopiés et notes de cours", icon: BookOpen },
  { id: "methodes", label: "Méthodes", description: "Fiches méthodes : comment résoudre un type d'exercice", icon: Lightbulb },
  { id: "td", label: "TD", description: "Feuilles d'exercices de travaux dirigés", icon: PenLine },
  { id: "devoirs", label: "Anciens devoirs", description: "Sujets de devoirs et d'examens des années précédentes", icon: ClipboardList },
  { id: "quiz", label: "Quiz", description: "QCM d'entraînement corrigés automatiquement", icon: ListChecks },
];

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const NO_COURSE_SLUG = "autres";

export interface TeachingDoc {
  /** Identifiant du cours auquel appartient le document (déduit de `%% matiere:`). */
  course: string;
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
    const course = meta.matiere ? slugify(meta.matiere) || NO_COURSE_SLUG : NO_COURSE_SLUG;
    return { course, category, slug: m[2], source, meta: { ...meta, titre: meta.titre ?? prettify(m[2]) } };
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

/* ----------------------------- Cours (regroupement) ----------------------------- */

export interface Course {
  slug: string;
  name: string;
  niveau?: string;
  docs: TeachingDoc[];
  counts: Record<CategoryId, number>;
}

const emptyCounts = (): Record<CategoryId, number> => ({ cours: 0, methodes: 0, td: 0, devoirs: 0, quiz: 0 });

const buildCourses = (): Course[] => {
  const map = new Map<string, Course>();
  for (const d of documents) {
    let c = map.get(d.course);
    if (!c) {
      c = {
        slug: d.course,
        name: d.course === NO_COURSE_SLUG ? "Autres documents" : (d.meta.matiere as string),
        docs: [],
        counts: emptyCounts(),
      };
      map.set(d.course, c);
    }
    c.docs.push(d);
    c.counts[d.category]++;
  }
  for (const c of map.values()) {
    // niveau le plus fréquent parmi les documents du cours
    const freq: Record<string, number> = {};
    for (const d of c.docs) if (d.meta.niveau) freq[d.meta.niveau] = (freq[d.meta.niveau] ?? 0) + 1;
    c.niveau = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.slug === NO_COURSE_SLUG) return 1;
    if (b.slug === NO_COURSE_SLUG) return -1;
    const n = (a.niveau ?? "~").localeCompare(b.niveau ?? "~", "fr", { numeric: true });
    return n || a.name.localeCompare(b.name, "fr", { numeric: true });
  });
};

export const courses: Course[] = buildCourses();
export const findCourse = (slug?: string) => courses.find((c) => c.slug === slug);
export const courseOfDoc = (d: TeachingDoc) => findCourse(d.course);
export const courseDocs = (c: Course, cat: CategoryId) => c.docs.filter((d) => d.category === cat);
