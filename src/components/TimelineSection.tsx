import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";

interface TimelineItem {
  date: string;
  title: string;
  institution: string;
  description: string;
}

interface TimelineSectionProps {
  id: string;
  title: string;
  items: TimelineItem[];
  alternate?: boolean;
}

const TimelineSection = ({ id, title, items, alternate = false }: TimelineSectionProps) => (
  <section id={id} className={alternate ? "bg-muted py-24" : "bg-background py-24"}>
    <div className="container mx-auto px-6">
      <SectionTitle>{title}</SectionTitle>

      <div className="relative mx-auto max-w-3xl">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-border md:left-1/2 md:-translate-x-px" />

        {items.map((item, i) => {
          const isRight = i % 2 === 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative mb-10 pl-12 md:w-1/2 md:pl-0 ${
                isRight ? "md:ml-auto md:pl-10" : "md:pr-10"
              }`}
            >
              {/* Dot */}
              <div
                className={`absolute left-[11px] top-2 h-4 w-4 rounded-full border-4 border-muted bg-accent md:top-3 ${
                  isRight ? "md:-left-2 md:right-auto" : "md:left-auto md:-right-2"
                }`}
              />

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <span className="mb-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {item.date}
                </span>
                <h3 className="mb-1 font-serif text-lg font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mb-2 text-sm font-semibold text-secondary">
                  {item.institution}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TimelineSection;
