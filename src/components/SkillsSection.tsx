import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";

interface Skill {
  name: string;
  level: number;
  label?: string;
}

interface SkillCategory {
  title: string;
  skills: Skill[];
}

const categories: SkillCategory[] = [
  {
    title: "Informatique",
    skills: [
      { name: "MATLAB", level: 95 },
      { name: "Python", level: 85 },
      { name: "R Studio", level: 80 },
      { name: "LaTeX", level: 90 },
      { name: "Scilab", level: 75 },
    ],
  },
  {
    title: "Langues",
    skills: [
      { name: "Français", level: 100, label: "Natif" },
      { name: "Anglais", level: 80, label: "Avancé" },
    ],
  },
  {
    title: "Expertise Scientifique",
    skills: [
      { name: "Optimisation mathématique", level: 95 },
      { name: "Modélisation", level: 90 },
      { name: "Méthodes numériques", level: 85 },
      { name: "Recherche opérationnelle", level: 88 },
    ],
  },
];

const SkillsSection = () => (
  <section id="skills" className="bg-background py-24">
    <div className="container mx-auto px-6">
      <SectionTitle>Compétences</SectionTitle>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, ci) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: ci * 0.1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <h3 className="mb-6 border-b border-border pb-4 font-serif text-xl font-bold text-primary">
              {cat.title}
            </h3>
            <div className="space-y-5">
              {cat.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{skill.name}</span>
                    {skill.label && (
                      <span className="text-xs text-muted-foreground">{skill.label}</span>
                    )}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SkillsSection;
