import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import SectionTitle from "./SectionTitle";

interface Publication {
  title: string;
  authors: string;
  journal: string;
  volume: string;
  doiUrl: string;
  pdfUrl: string;
}

const publications: Publication[] = [
  {
    title: "Multobjective Belugas Whale Optimizer for Pareto Optimal Solution Search",
    authors: "Zoungrana, A., Tougma, A., & Somé, K. (2025)",
    journal: "Communications in Computer and Information Science",
    volume: "Volume 2536, Pages 155-179",
    doiUrl: "https://link.springer.com/chapter/10.1007/978-3-031-98327-6_12",
    pdfUrl: "https://link.springer.com/chapter/10.1007/978-3-031-98327-6_12",
  },
  {
    title: "Operator Preserving Optimum Method for Solving Multiobjective Optimization Problems",
    authors: "Zoungrana, A., Tougma, A., & Somé, K. (2025)",
    journal: "IAENG International Journal of Applied Mathematics",
    volume: "Volume 55(9), Pages 3062-3070",
    doiUrl: "https://ijesworld.com/index.php/IEANG/article/view/70",
    pdfUrl: "https://ijesworld.com/index.php/IEANG/article/view/70/31",
  },
  {
    title: "Solving Multiobjective Optimization Problems with Inequality Constraint Using An Augmented Lagrangian Function",
    authors: "Tougma, A., & Somé, K. (2024)",
    journal: "Statistics, Optimization & Information Computing",
    volume: "Volume 12(5), Pages 1364-1381",
    doiUrl: "https://doi.org/10.19139/soic-2310-5070-1875",
    pdfUrl: "http://www.iapress.org/index.php/soic/article/view/1875/1118",
  },
  {
    title: "Hyperbolic Augmented Lagrangian algorithm for multiobjective optimization problems",
    authors: "Tougma, A., Kaboré, A., & Somé, K. (2024)",
    journal: "Gulf Journal of Mathematics",
    volume: "Volume 16(2), Pages 151-170",
    doiUrl: "https://doi.org/10.56947/gjom.v16i2.1876",
    pdfUrl: "https://www.gjom.org/index.php/gjom/article/view/1876/471",
  },
  {
    title: "Inexact Exponential Penalty Function with the Augmented Lagrangian for Multiobjective Optimization Algorithms",
    authors: "Tougma, A., Somé, K. (2024)",
    journal: "Journal of Applied Mathematics",
    volume: "Volume 2024, Article ID 9615743, 19 pages",
    doiUrl: "https://doi.org/10.1155/2024/9615743",
    pdfUrl: "https://onlinelibrary.wiley.com/doi/epdf/10.1155/2024/9615743",
  },
  {
    title: "Extension of the Projected Gradient and Armijo's Rule Concepts for Solving Convex Nonlinear Multiobjective Optimization Problems",
    authors: "Tougma, A., Somé, K., Compaoré, A. (2023)",
    journal: "Applied Analysis and Optimization",
    volume: "Volume 7(3), Pages 263-278",
    doiUrl: "#",
    pdfUrl: "http://yokohamapublishers.jp/online-p/AAO/vol7/aaov7n3p263.pdf",
  },
  {
    title: "Performance Analysis of Higher Education Institutions Using AHP and PROMETHEE",
    authors: "Tougma, A., Yougharé, W. J., & Zongo, M. (2021)",
    journal: "Advances and Applications in Discrete Mathematics",
    volume: "Volume 27(2), Pages 265-284",
    doiUrl: "http://dx.doi.org/10.17654/DM027020265",
    pdfUrl: "http://www.pphmj.com/abstract/13920.htm",
  },
  {
    title: "Global optimization algorithm based on Augmented Lagrangian for multiobjective optimization problems",
    authors: "Tougma, A., Somé, K.",
    journal: "Romanian Journal of Mathematics and Computer Science",
    volume: "Volume 15(1), Pages 40-58",
    doiUrl: "#",
    pdfUrl: "https://rjm-cs.utcb.ro/wp-content/uploads/2025/03/2025v15i1_5.pdf",
  },
  {
    title: "Improving of MOMA-Plus Hybrid approach by using some new penalty functions",
    authors: "Zoungrana, A., Tougma, A., Somé, K.",
    journal: "Journal of Contemporary Applied Mathematics",
    volume: "Volume 15(2), Pages 20-56",
    doiUrl: "https://doi.org/10.62476/jcam.151.14",
    pdfUrl: "https://journalcam.com/wp-content/uploads/2025/05/Tougma.pdf",
  },
];

const PublicationsSection = () => (
  <section id="publications" className="bg-muted py-24">
    <div className="container mx-auto px-6">
      <SectionTitle>Publications Scientifiques</SectionTitle>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publications.map((pub, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="bg-primary px-5 py-4">
              <h3 className="line-clamp-3 font-serif text-sm font-bold leading-snug text-primary-foreground">
                {pub.title}
              </h3>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="mb-2 text-xs italic text-muted-foreground">
                {pub.authors}
              </p>
              <p className="mb-1 text-sm font-semibold text-foreground">
                {pub.journal}
              </p>
              <p className="mb-4 text-xs text-muted-foreground">{pub.volume}</p>

              <div className="mt-auto flex gap-3">
                <a
                  href={pub.doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-secondary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  DOI
                </a>
                <a
                  href={pub.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/80"
                >
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default PublicationsSection;
