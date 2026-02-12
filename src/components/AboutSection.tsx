import { motion } from "framer-motion";
import { User, GraduationCap, Mail, Phone, MapPin, Globe, TrendingUp, Cog, Calculator, Network } from "lucide-react";
import SectionTitle from "./SectionTitle";

const expertises = [
  { icon: TrendingUp, title: "Optimisation", desc: "Linéaire, non linéaire, convexe, mono-objectif et multi-objectif" },
  { icon: Cog, title: "Modélisation", desc: "Création de modèles mathématiques pour des problèmes complexes" },
  { icon: Calculator, title: "Méthodes Numériques", desc: "Techniques avancées pour la résolution numérique" },
  { icon: Network, title: "Recherche Opérationnelle", desc: "Applications pratiques pour l'aide à la décision" },
];

const infoItems = [
  { icon: User, label: "Nom complet", value: "Appolinaire Tougma" },
  { icon: GraduationCap, label: "Titre", value: "Docteur en Mathématiques Appliquées" },
  { icon: Mail, label: "Email", value: "appolinaire.tougma19@gmail.com" },
  { icon: Phone, label: "Téléphone", value: "75200793 / 73957776 (WhatsApp)" },
  { icon: MapPin, label: "Localisation", value: "Ouahigouya, Burkina Faso" },
  { icon: Globe, label: "ORCID", value: "0000-0001-9007-9944" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const AboutSection = () => (
  <section id="about" className="bg-background py-24">
    <div className="container mx-auto px-6">
      <SectionTitle>À Propos</SectionTitle>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="mb-4 font-serif text-2xl font-semibold text-secondary">
            Chercheur en Mathématiques Appliquées
          </h3>
          <p className="mb-4 leading-relaxed text-muted-foreground">
            Docteur en Mathématiques Appliquées spécialisé en optimisation linéaire et non linéaire, mono-objectif et multi-objectif, ainsi qu'en modélisation et recherche opérationnelle. Mes recherches se concentrent sur le développement de méthodes numériques innovantes pour résoudre des problèmes complexes sous contraintes dynamiques.
          </p>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            Actuellement chargé de cours à l'Université Lédéa Bernard Ouédraogo de Ouahigouya (ULBO), j'ai également contribué en tant que réviseur pour plusieurs revues scientifiques prestigieuses telles que Engineering Applications of Artificial Intelligence et Applied Mathematical Modelling.
          </p>

          <h3 className="mb-6 font-serif text-2xl font-semibold text-secondary">
            Expertises
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {expertises.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-primary">{item.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-muted p-8 shadow-sm"
        >
          <h3 className="mb-8 font-serif text-xl font-semibold text-primary">
            Informations Personnelles
          </h3>
          <div className="space-y-6">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
