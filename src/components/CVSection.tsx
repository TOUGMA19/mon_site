import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import SectionTitle from "./SectionTitle";

const CVSection = () => (
  <section className="bg-primary py-20">
    <div className="container mx-auto px-6">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10">
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
            Télécharger mon CV
          </h2>
          <p className="mb-8 text-primary-foreground/70">
            Retrouvez l'ensemble de mon parcours académique, mes publications et mes compétences dans mon curriculum vitae détaillé.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/cv-tougma.pdf"
              download
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
            >
              <Download className="h-4 w-4" />
              Télécharger le CV (PDF)
            </a>
            <button
              onClick={() => {
                const el = document.querySelector("#contact");
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-foreground/30 px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
            >
              Me contacter
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default CVSection;
