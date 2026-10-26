/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { readFileSync, readdirSync } from "node:fs";
import { parseLatex, stripComments } from "./parser";
import LatexDocument from "@/components/latex/LatexDocument";

const shared = readFileSync("src/content/enseignement/macros.tex", "utf8");
const html = (src: string) =>
  renderToString(createElement(LatexDocument, { doc: parseLatex(src, { sharedMacros: shared }), showAll: true }));

describe("parseur LaTeX", () => {
  it("numérote les exercices et lit le titre optionnel", () => {
    const d = parseLatex("\\begin{exercice}A\\end{exercice}\\begin{exercice}[Suites]B\\end{exercice}");
    const b = d.nodes.filter((n) => n.type === "block") as any[];
    expect(b.map((x) => x.number)).toEqual(["1", "2"]);
    expect(b[1].optTitle[0].value).toBe("Suites");
  });

  it("gère les étiquettes d'enumerate", () => {
    const d = parseLatex("\\begin{enumerate}[label=\\alph*)]\\item x\\item y\\end{enumerate}");
    const l = d.nodes[0] as any;
    expect(l.items.map((i: any) => i.label[0].value)).toEqual(["a)", "b)"]);
    const d2 = parseLatex("\\begin{enumerate}[(i)]\\item x\\item y\\end{enumerate}");
    expect((d2.nodes[0] as any).items[1].label[0].value).toBe("(ii)");
  });

  it("transmet les macros à KaTeX et développe celles du texte", () => {
    const d = parseLatex("\\newcommand{\\ens}[1]{\\{#1\\}}\\newcommand{\\foo}{bar} $\\ens{a}$ \\foo");
    expect(d.macros["\\ens"]).toBe("\\{#1\\}");
    expect(JSON.stringify(d.nodes)).toContain("bar");
  });

  it("convertit accents, tirets et commentaires", () => {
    expect(stripComments("a% x\nb")).toBe("ab");
    const d = parseLatex("Fonction d\\'efinie -- ok \\oe uvre");
    const txt = d.nodes.map((n: any) => n.value ?? "").join("");
    expect(txt).toContain("définie – ok œuvre");
  });

  it("accepte un document complet avec préambule et \\newtheorem", () => {
    const d = parseLatex(
      "\\documentclass{article}\\newtheorem{thm}{Théorème}\\title{Mon titre}\\begin{document}\\begin{thm}x\\end{thm}\\end{document}",
    );
    expect(d.meta.titre).toBe("Mon titre");
    expect((d.nodes.find((n) => n.type === "block") as any).label).toBe("Théorème");
  });

  it("construit un tableau", () => {
    const d = parseLatex("\\begin{tabular}{|c|c|}\\hline a & $b$ \\\\ \\hline c & d \\\\ \\hline\\end{tabular}");
    const t = d.nodes[0] as any;
    expect(t.type).toBe("table");
    expect(t.rows).toHaveLength(2);
    expect(t.rows[0].cells).toHaveLength(2);
  });
});

describe("exemples du site", () => {
  for (const cat of ["cours", "td", "devoirs"]) {
    for (const f of readdirSync(`src/content/enseignement/${cat}`)) {
      it(`${cat}/${f} s'affiche sans erreur KaTeX`, () => {
        const out = html(readFileSync(`src/content/enseignement/${cat}/${f}`, "utf8"));
        expect(out.length).toBeGreaterThan(500);
        expect(out).not.toContain("katex-error");
      });
    }
  }
});
