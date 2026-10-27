import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, FileCode, Printer } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import LatexDocument, { CorrectionsToggle, LatexToc } from "@/components/latex/LatexDocument";
import { parseLatex } from "@/lib/latex/parser";
import { CATEGORIES, findDoc, sharedMacros } from "@/lib/enseignement";

// true  = les boutons « Afficher les corrections », « Imprimer / PDF » et « Source .tex »
//         sont visibles par tout le monde.
// false = cachés au public (ils restent dans le code).
const SHOW_TOOLS_TO_PUBLIC = false;

const EnseignementDocument = () => {
  const { categorie, slug } = useParams();
  const [searchParams] = useSearchParams();
  // Accès privé : ajouter ?outils=1 à l'adresse d'un document fait apparaître les boutons.
  const showTools = SHOW_TOOLS_TO_PUBLIC || searchParams.get("outils") === "1";

  const entry = findDoc(categorie, slug);
  const category = CATEGORIES.find((c) => c.id === categorie);
  const [showAll, setShowAll] = useState(false);

  const doc = useMemo(
    () => (entry ? parseLatex(entry.source, { sharedMacros }) : null),
    [entry],
  );

  useEffect(() => {
    if (entry) document.title = `${entry.meta.titre} — Dr. Tougma`;
  }, [entry]);

  const back = `/enseignement/${categorie ?? "cours"}`;

  if (!entry || !doc) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-6 py-24 text-center">
          <h1 className="mb-4 font-serif text-3xl font-bold text-primary">Document introuvable</h1>
          <Link to={back} className="text-accent hover:underline">← Retour à l'enseignement</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { meta } = entry;
  const hasButtons = (showTools && doc.hasCorrections) || showTools || !!meta.pdf;

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden"><SiteHeader /></div>
      <main className="container mx-auto px-6 py-10">
        <Link to={back} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent print:hidden">
          <ArrowLeft className="h-4 w-4" /> Retour : {category?.label}
        </Link>

        <div className="xl:grid xl:grid-cols-[1fr_16rem] xl:gap-12">
          <article className="mx-auto min-w-0 max-w-3xl xl:mx-0">
            <header className="mb-8 border-b border-border pb-6">
              <div className="mb-3 flex flex-wrap gap-2">
                {meta.niveau && <Badge>{meta.niveau}</Badge>}
                {meta.matiere && <Badge variant="secondary">{meta.matiere}</Badge>}
                {meta.annee && <Badge variant="outline">{meta.annee}</Badge>}
              </div>
              <h1 className="font-serif text-3xl font-bold text-primary sm:text-4xl">{meta.titre}</h1>
              {meta.description && <p className="mt-3 text-muted-foreground">{meta.description}</p>}

              {hasButtons && (
                <div className="mt-5 flex flex-wrap gap-2 print:hidden">
                  {showTools && doc.hasCorrections && (
                    <CorrectionsToggle showAll={showAll} onChange={setShowAll} />
                  )}
                  {showTools && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
                    >
                      <Printer className="h-4 w-4" /> Imprimer / PDF
                    </button>
                  )}
                  {meta.pdf && (
                    <a
                      href={meta.pdf}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                    >
                      <Download className="h-4 w-4" /> Télécharger le PDF
                    </a>
                  )}
                  {showTools && (
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(entry.source)}`}
                      download={`${entry.slug}.tex`}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
                    >
                      <FileCode className="h-4 w-4" /> Source .tex
                    </a>
                  )}
                </div>
              )}
            </header>

            <LatexDocument doc={doc} showAll={showAll} />
          </article>

          <aside className="hidden xl:block print:hidden">
            <LatexToc doc={doc} className="sticky top-24" />
          </aside>
        </div>
      </main>
      <div className="print:hidden"><SiteFooter /></div>
    </div>
  );
};

export default EnseignementDocument;
