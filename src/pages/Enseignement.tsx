import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORIES, docsOf, type CategoryId } from "@/lib/enseignement";

const DocList = ({ category }: { category: CategoryId }) => {
  const all = docsOf(category);
  const [query, setQuery] = useState("");
  const [niveau, setNiveau] = useState<string | null>(null);

  const niveaux = useMemo(
    () => Array.from(new Set(all.map((d) => d.meta.niveau).filter(Boolean))) as string[],
    [all],
  );
  const shown = all.filter((d) => {
    if (niveau && d.meta.niveau !== niveau) return false;
    const hay = [d.meta.titre, d.meta.description, d.meta.matiere, d.meta.niveau, d.meta.annee].join(" ").toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  if (all.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        Aucun document pour le moment.
        <p className="mt-2 text-sm">
          Ajoutez un fichier <code className="rounded bg-muted px-1">.tex</code> dans{" "}
          <code className="rounded bg-muted px-1">src/content/enseignement/{category}/</code>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" className="pl-9" />
        </div>
        {niveaux.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {[null, ...niveaux].map((n) => (
              <button
                key={n ?? "all"}
                onClick={() => setNiveau(n)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  niveau === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted",
                )}
              >
                {n ?? "Tous"}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucun résultat.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((d, i) => (
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
                <div className="mb-3 flex flex-wrap gap-2">
                  {d.meta.niveau && <Badge>{d.meta.niveau}</Badge>}
                  {d.meta.annee && <Badge variant="outline">{d.meta.annee}</Badge>}
                </div>
                <h3 className="mb-1 font-serif text-lg font-bold text-primary">{d.meta.titre}</h3>
                {d.meta.matiere && <p className="mb-2 text-sm text-secondary">{d.meta.matiere}</p>}
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
    </div>
  );
};

const Enseignement = () => {
  const { categorie } = useParams();
  const navigate = useNavigate();

  if (!categorie) return <Navigate to="/enseignement/cours" replace />;
  if (!CATEGORIES.some((c) => c.id === categorie)) return <Navigate to="/enseignement/cours" replace />;
  const current = CATEGORIES.find((c) => c.id === categorie)!;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl font-bold sm:text-5xl">Enseignement</h1>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-accent" />
            <p className="mx-auto mt-5 max-w-2xl text-primary-foreground/80">
              Cours, travaux dirigés et anciens devoirs de mathématiques.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12">
          <Tabs value={current.id} onValueChange={(v) => navigate(`/enseignement/${v}`)}>
            <TabsList className="mb-8 mx-auto grid h-auto w-full max-w-3xl grid-cols-2 sm:grid-cols-5">
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="gap-2 py-2.5">
                  <c.icon className="h-4 w-4" />
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((c) => (
              <TabsContent key={c.id} value={c.id}>
                <p className="mb-6 text-center text-muted-foreground">{c.description}</p>
                <DocList category={c.id} />
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Enseignement;
