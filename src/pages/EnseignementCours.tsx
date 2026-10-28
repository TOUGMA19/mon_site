import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, courseDocs, findCourse, type CategoryId } from "@/lib/enseignement";

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

  const requested = params.get("onglet") as CategoryId | null;
  const first = CATEGORIES.find((c) => course.counts[c.id] > 0)?.id ?? "cours";
  const current: CategoryId = CATEGORIES.some((c) => c.id === requested) ? (requested as CategoryId) : first;

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
          <Tabs value={current} onValueChange={(v) => setParams({ onglet: v }, { replace: true })}>
            <TabsList className="mx-auto mb-8 grid h-auto w-full max-w-3xl grid-cols-2 sm:grid-cols-5">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="gap-2 py-2.5">
                  <c.icon className="h-4 w-4" />
                  {c.label}
                  <span className="text-xs text-muted-foreground">({course.counts[c.id]})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => {
              const docs = courseDocs(course, cat.id);
              return (
                <TabsContent key={cat.id} value={cat.id}>
                  <p className="mb-6 text-center text-muted-foreground">{cat.description}</p>
                  {docs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                      Aucun document dans cette rubrique pour le moment.
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {docs.map((d, i) => (
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
                            {d.meta.annee && (
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
