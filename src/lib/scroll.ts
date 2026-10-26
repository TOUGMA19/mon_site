import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const scrollToSelector = (selector: string) => {
  const el = document.querySelector(selector);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

/** Défile vers une section de l'accueil, même depuis une autre page. */
export const useSectionNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (href: string) => {
      if (pathname === "/") scrollToSelector(href);
      else navigate("/", { state: { scrollTo: href } });
    },
    [pathname, navigate],
  );
};
