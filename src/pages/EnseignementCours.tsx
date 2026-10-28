import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, findCourse, type CategoryId, type TeachingDoc } from "@/lib/enseignement";

const EnseignementCours = () => {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const course = findCourse(slug);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-6 py-24 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-primary">Cours introuvable</h1>
          <Link to="/enseignement" className="text-accent hover:underline">← Retour à l'enseignement</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Années présentes dans le cours (la plus récente d'abord)
  const years = Array.from(new Set(course.docs.map((d) => d.meta.annee).filter(Boolean) as string[])).sort((a, b) =>
    b.localeCompare(a, "fr", { numeric: true }),
  );
  const yearParam = params.get("annee");
  const year = yearParam && years.includes(yearParam) ? yearParam : null;

  // Un document sans année reste visible quel que soit le filtre.
  const visible = (d: TeachingDoc) => !year || !d.meta.annee || d.meta.annee === year;
  const docsOf = (cat: CategoryId) => course.docs.filter((d) => d.category === cat && visible(d));
  const count = (cat: CategoryId) => docsOf(cat).length;

  const requested = params.get("onglet") as CategoryId | null;
  const first = CATEGORIES.find((c) => count(c.id) > 0)?.id ?? "cours";
  const current: CategoryId = CATEGORIES.some((c) => c.id === requested) ? (requested as CategoryId) : first;

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const groupByYear = !year && years.length > 1;
  const sections = (docs: TeachingDoc[]): { title: string | null; docs: TeachingDoc[] }[] => {
    if (!groupByYear) return [{ title: null, docs }];
    const out = years
      .map((y) => ({ title: y, docs: docs.filter((d) => d.meta.annee === y) }))
      .filter((g) => g.docs.length > 0);
    const none = docs.filter((d) => !d.meta.annee);
    if (none.length) out.push({ title: "Sans année", docs: none });
    return out;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-primary py-14 text-primary-foreground">
          <div className="container mx-auto px-6">
            <Link to="/enseignement" className="mb-5 inline-flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-accent">
              <ArrowLeft className="h-4 w-4" /> Tous les cours
            </Link>
            <h1 className="font-serif text-4xl font-bold sm:text-5xl">{course.name}</h1>
            <div className="mt-4 h-1 w-20 rounded-full bg-accent" />
            {course.niveau && <p className="mt-4 text-primary-foreground/80">{course.niveau}</p>}
          </div>
        </section>

        <section className="container mx-auto px-6 py-12">
          {years.length > 1 && (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Année :</span>
              {[null, ...years].map((y) => (
                <button
                  key={y ?? "all"}
                  onClick={() => update({ annee: y })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    year === y ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
                  )}
                >
                  {y ?? "Toutes"}
                </button>
              ))}
            </div>
          )}

          <Tabs value={current} onValueChange={(v) => update({ onglet: v })}>
            <TabsList className="mx-auto mb-8 grid h-auto w-full max-w-3xl grid-cols-2 sm:grid-cols-5">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="gap-2 py-2.5">
                  <c.icon className="h-4 w-4" />
                  {c.label}
                  <span className="text-xs text-muted-foreground">({count(c.id)})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => {
              const docs = docsOf(cat.id);
              return (
                <TabsContent key={cat.id} value={cat.id}>
                  <p className="mb-6 text-center text-muted-foreground">{cat.description}</p>
                  {docs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                      Aucun document dans cette rubrique pour le moment.
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {sections(docs).map((g) => (
                        <div key={g.title ?? "all"}>
                          {g.title && (
                            <h2 className="mb-4 border-b border-border pb-2 font-serif text-xl font-bold text-primary">
                              {g.title}
                            </h2>
                          )}
                          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {g.docs.map((d, i) => (
                              <motion.div
                                key={d.slug}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
                              >
                                <Link
                                  to={`/enseignement/${d.category}/${d.slug}`}
                                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md"
                                >
                                  {d.meta.annee && !groupByYear && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                      <Badge variant="outline">{d.meta.annee}</Badge>
                                    </div>
                                  )}
                                  <h3 className="mb-2 font-serif text-lg font-bold text-primary">{d.meta.titre}</h3>
                                  {d.meta.description && <p className="mb-4 text-sm text-muted-foreground">{d.meta.description}</p>}
                                  <span className="mt-auto flex items-center gap-2 pt-2 text-sm font-medium text-accent">
                                    <FileText className="h-4 w-4" /> Consulter
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                  </span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default EnseignementCours;
