import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Enseignement = lazy(() => import("./pages/Enseignement"));
const EnseignementDocument = lazy(() => import("./pages/EnseignementDocument"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (!(state as { scrollTo?: string } | null)?.scrollTo) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, state]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/enseignement" element={<Enseignement />} />
          <Route path="/enseignement/:categorie" element={<Enseignement />} />
          <Route path="/enseignement/:categorie/:slug" element={<EnseignementDocument />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
