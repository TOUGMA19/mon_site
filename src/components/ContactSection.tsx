import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import SectionTitle from "./SectionTitle";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:appolinaire.tougma19@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`De: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
    window.open(mailtoLink);
  };

  return (
    <section id="contact" className="bg-muted py-24">
      <div className="container mx-auto px-6">
        <SectionTitle>Contact</SectionTitle>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="space-y-8">
              {[
                { icon: Mail, title: "Email", lines: ["appolinaire.tougma19@gmail.com", "appolinaire.tougma94@gmail.com", "appolinaire.tougma@uohg.gov.bf"] },
                { icon: Phone, title: "Téléphone", lines: ["75200793 / 73957776 (WhatsApp)"] },
                { icon: MapPin, title: "Adresse", lines: ["Université Lédéa Bernard Ouédraogo", "Ouahigouya, Burkina Faso"] },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-serif text-lg font-semibold text-primary">{item.title}</h3>
                    {item.lines.map((line) => (
                      <p key={line} className="text-sm text-muted-foreground">{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Social links */}
              <div className="flex gap-3 pt-4">
                {[
                  { href: "https://www.researchgate.net/profile/Appolinaire-Tougma", label: "RG" },
                  { href: "https://orcid.org/0000-0001-9007-9944", label: "ID" },
                  { href: "https://scholar.google.com/citations?user=YOUR_PROFILE_ID", label: "GS" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-all hover:-translate-y-1 hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="mb-6 font-serif text-xl font-semibold text-primary">
              Envoyez un message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { id: "name", label: "Nom complet", type: "text" },
                { id: "email", label: "Adresse email", type: "email" },
                { id: "subject", label: "Sujet", type: "text" },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="mb-2 block text-sm font-medium text-foreground">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    required
                    value={formData[field.id as keyof typeof formData]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-secondary"
              >
                Envoyer le message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
