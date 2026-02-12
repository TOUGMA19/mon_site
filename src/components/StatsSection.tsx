import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, GraduationCap, Award } from "lucide-react";

interface Stat {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  label: string;
}

const stats: Stat[] = [
  { icon: BookOpen, value: 9, label: "Publications", suffix: "+" },
  { icon: Briefcase, value: 5, label: "Années d'expérience", suffix: "+" },
  { icon: GraduationCap, value: 2, label: "Diplômes universitaires" },
  { icon: Award, value: 3, label: "Revues révisées", suffix: "+" },
];

function useCountUp(target: number, isVisible: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, isVisible]);

  return count;
}

const StatItem = ({ stat, isVisible }: { stat: Stat; isVisible: boolean }) => {
  const count = useCountUp(stat.value, isVisible);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
        <stat.icon className="h-7 w-7 text-accent" />
      </div>
      <div className="font-serif text-4xl font-bold text-primary">
        {count}
        {stat.suffix && <span className="text-accent">{stat.suffix}</span>}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
    </motion.div>
  );
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-border bg-card py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
