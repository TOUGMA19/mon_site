import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import TimelineSection from "@/components/TimelineSection";
import PublicationsSection from "@/components/PublicationsSection";
import SkillsSection from "@/components/SkillsSection";
import CVSection from "@/components/CVSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import ParallaxSection from "@/components/ParallaxSection";

const educationItems = [
  {
    date: "2020 - 2024",
    title: "Doctorat en Mathématiques",
    institution: "Université Norbert Zongo, Koudougou",
    description: "Domaine : Sciences appliquées — Spécialité : Mathématiques Appliquées",
  },
  {
    date: "2017 - 2019",
    title: "Master en Mathématiques",
    institution: "Université Norbert Zongo, Koudougou",
    description: "Domaine : Mathématiques et Applications — Option : Modélisation et aide à la décision",
  },
];

const experienceItems = [
  {
    date: "2024 - 2025",
    title: "Chargé de cours",
    institution: "Université Lédéa Bernard Ouédraogo, Ouahigouya",
    description: "Mathématiques Appliquées",
  },
  {
    date: "2023 - 2024",
    title: "Chargé de cours",
    institution: "Institut Supérieur Polytechnique Saint Augustin, Dédougou",
    description: "Initiation aux calculs MATLAB et initiation à LaTeX en licence mathématiques",
  },
  {
    date: "2023 - 2024",
    title: "Tuteur",
    institution: "Département de Mathématiques, UFR/ST, Université Norbert Zongo",
    description: "Dans le cadre du contrat de performance de l'université",
  },
  {
    date: "Réviseur",
    title: "Elsevier — Revues scientifiques",
    institution: "Engineering Applications of Artificial Intelligence, Applied Mathematical Modelling",
    description: "Révision par les pairs pour des revues internationales de premier plan",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <ParallaxSection speed={0.08}>
          <AboutSection />
        </ParallaxSection>
        <TimelineSection id="education" title="Formation Académique" items={educationItems} alternate />
        <ParallaxSection speed={0.06}>
          <TimelineSection id="experience" title="Expérience Professionnelle" items={experienceItems} />
        </ParallaxSection>
        <PublicationsSection />
        <ParallaxSection speed={0.08}>
          <SkillsSection />
        </ParallaxSection>
        <CVSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
