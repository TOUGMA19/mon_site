import { motion } from "framer-motion";

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle = ({ children }: SectionTitleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6 }}
    className="mb-16 text-center"
  >
    <h2 className="inline-block font-serif text-3xl font-bold text-primary sm:text-4xl">
      {children}
    </h2>
    <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-accent" />
  </motion.div>
);

export default SectionTitle;
