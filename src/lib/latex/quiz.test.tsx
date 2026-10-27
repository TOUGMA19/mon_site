import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { parseLatex } from "./parser";
import LatexDocument from "@/components/latex/LatexDocument";

describe("interaction du quiz", () => {
  it("note correctement après validation", () => {
    const doc = parseLatex(readFileSync("src/content/enseignement/quiz/exemple-quiz-algebre.tex", "utf8"), {
      sharedMacros: readFileSync("src/content/enseignement/macros.tex", "utf8"),
    });
    render(<LatexDocument doc={doc} />);
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]); // Q1 : bonne réponse
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[0]); // Q2 : 1re et 3e attendues
    fireEvent.click(boxes[2]);
    fireEvent.click(radios[4]); // Q3 : 2e choix = bonne (radios[3] est le 1er choix de Q3)
    fireEvent.click(screen.getByText("Valider mes réponses"));
    expect(screen.getByText("Score : 3 / 3")).toBeTruthy();
  });
});
