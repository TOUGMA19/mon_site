import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import profilePhoto from "@/assets/profile-photo.jpg";

const tags = [
  "Optimisation",
  "Recherche Opérationnelle",
  "Modélisation Mathématique",
  "Intelligence Artificielle",
];

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${heroBg})`, y: bgY, scale: 1.1 }}
      />
      <div className="absolute inset-0 bg-primary/80" />

      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-24 md:flex-row md:gap-16"
      >
        {/* Profile photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0"
        >
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-accent to-gold opacity-70 blur-sm" />
            <img
              src={profilePhoto}
              alt="Dr. Appolinaire Tougma"
              className="relative h-40 w-40 rounded-full border-4 border-primary-foreground/20 object-cover shadow-2xl sm:h-52 sm:w-52"
            />
          </div>
        </motion.div>

        {/* Text content */}
        <div className="text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl"
          >
            Dr. Appolinaire Tougma
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 max-w-xl text-lg text-primary-foreground/85 sm:text-xl"
          >
            Chercheur en Mathématiques Appliquées & Optimisation
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start"
          >
            <button
              onClick={() => {
                const el = document.querySelector("#publications");
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
              className="rounded-lg border-2 border-primary-foreground/30 px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
            >
              Voir mes publications
            </button>
            <a
              href="/cv-tougma.pdf"
              download
              className="rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/80"
            >
              Télécharger CV
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
