# Onglet « Enseignement » — mode d'emploi

Un document = **un fichier `.tex`** placé dans le bon dossier :

| Dossier   | Onglet           |
|-----------|------------------|
| `cours/`  | Cours            |
| `td/`     | TD               |
| `devoirs/`| Anciens devoirs  |
| `quiz/`   | Quiz (QCM corrigés automatiquement) |

Le nom du fichier devient l'adresse (`td/td2-matrices.tex` → `/enseignement/td/td2-matrices`).
Supprimez les fichiers `exemple-*.tex` quand vous avez ajouté les vôtres.

## En-tête (optionnel) — première lignes du fichier
```
%% titre: TD 2 — Matrices
%% niveau: Licence 1
%% matiere: Algèbre linéaire
%% annee: 2025-2026
%% ordre: 2
%% description: Calcul matriciel, rang, inverse.
%% pdf: /enseignement/pdf/td2.pdf      (bouton « Télécharger le PDF »)
```

## Ce qui est géré
- Maths : `$…$`, `$$…$$`, `\[…\]`, `equation`, `align`, `gather`, `cases`, matrices… (KaTeX)
- `\section`, `\subsection`, `\textbf`, `\emph`, `\underline`, accents `\'e`, `\oe`, guillemets…
- `enumerate` (avec `[label=\alph*)]`, `[a)]`, `[(i)]`), `itemize`, `description`
- Environnements : `exercice` (numérotation auto, titre `[...]`), `theoreme`, `lemme`, `proposition`,
  `corollaire`, `definition`, `remarque`, `exemple`, `proof`/`preuve`, `\newtheorem`
- `correction` / `solution` / `indication` : **repliés** avec un bouton « Voir la correction »
- `tabular`, `figure`, `\includegraphics{x.png}` (image dans `public/enseignement/figures/`)
- `lstlisting` / `verbatim` (code MATLAB, etc.)
- `\newcommand`, `\DeclareMathOperator`, `\def`
- Un document LaTeX complet (`\documentclass … \begin{document}`) est accepté tel quel.

## Macros communes
`macros.tex` (dans ce dossier) est chargé pour **tous** les documents : mettez-y vos `\newcommand` une fois.

## Limites
- `tikzpicture` n'est pas dessiné : exportez la figure en PNG/SVG et utilisez `\includegraphics`.
- Les numéros d'équations (`\eqref`) ne sont pas calculés ; `\ref` fonctionne pour exercices, théorèmes, sections.

## Quiz (QCM)
Fichier `.tex` dans `quiz/` (ou une `question` n'importe où dans un cours/TD) :
```
\begin{question}
Énoncé avec $formules$.
\begin{reponses}
  \bonne  une bonne réponse
  \mauvaise une mauvaise réponse
  \bonne  une autre bonne réponse
\end{reponses}
\begin{explication}  % facultatif, affiché après validation
Pourquoi c'est la bonne réponse.
\end{explication}
\end{question}
```
- Une seule `\bonne` : choix unique (boutons ronds). Plusieurs : cases à cocher (toutes les bonnes doivent être cochées).
- Le visiteur clique « Valider mes réponses » : correction en couleur, explications et score.
- Attention : les bonnes réponses sont dans le code de la page (visibles par un curieux) ; ce n'est pas adapté à un examen noté.
