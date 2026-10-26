import { Sigma } from "lucide-react";
import { Link } from "react-router-dom";
import { useSectionNav } from "@/lib/scroll";

const SiteFooter = () => {
  const scrollTo = useSectionNav();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 pb-8 pt-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2 font-serif text-xl font-bold">
              <Sigma className="h-5 w-5 text-accent" />
              Dr. Appolinaire Tougma
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Chercheur en Mathématiques Appliquées spécialisé en optimisation, modélisation et recherche opérationnelle. Chargé de cours à l'Université Lédéa Bernard Ouédraogo.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Liens rapides</h3>
            <div className="h-0.5 w-12 bg-accent mb-4" />
            <ul className="space-y-2">
              {["about", "education", "experience", "publications", "contact"].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(`#${id}`)}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    {id === "about" ? "À propos" : id === "education" ? "Formation" : id === "experience" ? "Expérience" : id === "publications" ? "Publications" : "Contact"}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/enseignement" className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                  Enseignement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Contact</h3>
            <div className="h-0.5 w-12 bg-accent mb-4" />
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>✉ appolinaire.tougma19@gmail.com</li>
              <li>✆ 75200793 / 73957776</li>
              <li>📍 Ouahigouya, Burkina Faso</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          © 2025 Dr. Appolinaire Tougma. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
