import { useState } from "react";
import { Menu, X, Sigma } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSectionNav } from "@/lib/scroll";

const navItems: { label: string; href?: string; to?: string }[] = [
  { label: "À propos", href: "#about" },
  { label: "Formation", href: "#education" },
  { label: "Expérience", href: "#experience" },
  { label: "Enseignement", to: "/enseignement" },
  { label: "Publications", href: "#publications" },
  { label: "Compétences", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const goSection = useSectionNav();
  const { pathname } = useLocation();

  const scrollTo = (href: string) => {
    setIsOpen(false);
    goSection(href);
  };

  const isActive = (item: { to?: string }) => !!item.to && pathname.startsWith(item.to);

  const renderItem = (item: (typeof navItems)[number], mobile: boolean) => {
    const cls = mobile
      ? "block w-full py-3 text-left text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
      : "block rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground";
    const active = isActive(item) ? " !text-primary-foreground bg-primary-foreground/10" : "";
    return item.to ? (
      <Link to={item.to} onClick={() => setIsOpen(false)} className={cls + active}>
        {item.label}
      </Link>
    ) : (
      <button onClick={() => scrollTo(item.href!)} className={cls}>
        {item.label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" onClick={() => window.scrollTo({ top: 0 })} className="flex items-center gap-3 font-serif text-xl font-bold tracking-wide">
          <Sigma className="h-6 w-6 text-accent" />
          Dr. Tougma
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex gap-1">
            {navItems.map((item) => (
              <li key={item.label}>{renderItem(item, false)}</li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-primary-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary-foreground/10 md:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {navItems.map((item) => (
                <li key={item.label}>{renderItem(item, true)}</li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
