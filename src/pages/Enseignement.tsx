import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, courses } from "@/lib/enseignement";

const Enseignement = () => {
  const { categorie } = useParams();
  const [query, setQuery] = useState("");

  // Anciennes adresses (/enseignement/td, /enseignement/quiz…) : retour à l'accueil de l'enseignement.
  if (categorie) return <Navigate to="/enseignement" replace />;

  const shown = courses.filter((c) =>
    `${c.name} ${c.niveau ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  // regroupement par niveau (Licence 1, Licence 2…)
  const groupMap = new Map<string, typeof courses>();
  for (const c of shown) {
    const k = c.niveau ?? "Autres";
    groupMap.set(k, [...(groupMap.get(k) ?? []), c]);
  }
  const groups = Array.from(groupMap.entries());

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl font-bold sm:text-5xl">Enseignement</h1>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-accent" />
            <p className="mx-auto mt-5 max-w-2xl text-primary-foreground/80">
              Choisissez un cours pour accéder à son cours, ses méthodes, ses TD, ses quiz et ses anciens devoirs.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12">
          {courses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              Aucun document pour le moment.
              <p className="mt-2 text-sm">
                Ajoutez un fichier <code className="rounded bg-muted px-1">.tex</code> dans{" "}
                <code className="rounded bg-muted px-1">src/content/enseignement/</code> avec la ligne{" "}
                <code className="rounded bg-muted px-1">%% matiere: Nom du cours</code>.
              </p>
            </div>
          ) : (
            <>
              <div className="relative mb-10 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un cours…" className="pl-9" />
              </div>

              {groups.length === 0 && <p className="text-center text-muted-foreground">Aucun résultat.</p>}

              {groups.map(([niveau, list]) => (
                <div key={niveau} className="mb-12">
                  <h2 className="mb-5 flex items-center gap-2 font-serif text-2xl font-bold text-primary">
                    <GraduationCap className="h-6 w-6 text-accent" /> {niveau}
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((c, i) => (
                      <motion.div
                        key={c.slug}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05 }}
                      >
                        <Link
                          to={`/enseignement/matiere/${c.slug}`}
                          className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md"
                        >
                          <h3 className="mb-4 font-serif text-xl font-bold text-primary">{c.name}</h3>
                          <ul className="mb-5 grid grid-cols-1 gap-1.5 text-sm text-muted-foreground">
                            {CATEGORIES.filter((cat) => c.counts[cat.id] > 0).map((cat) => (
                              <li key={cat.id} className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4 text-secondary" />
                                <span>{cat.label}</span>
                                <Badge variant="outline" className="ml-auto">{c.counts[cat.id]}</Badge>
                              </li>
                            ))}
                          </ul>
                          <span className="mt-auto flex items-center gap-2 pt-2 text-sm font-medium text-accent">
                            Ouvrir le cours
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Enseignement;
