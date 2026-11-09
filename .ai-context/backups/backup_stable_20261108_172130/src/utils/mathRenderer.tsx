import React from "react";
import katex from "katex";
import { isMathOrDiagramSegment } from "./forensicEngine";

/**
 * Safely renders a LaTeX math string to HTML using KaTeX.
 */
function renderKatexHtml(latex: string, displayMode: boolean): string | null {
  try {
    // Strip surrounding math delimiters if present
    const cleaned = latex
      .trim()
      .replace(/^\$\$|\$\$$/g, "")
      .replace(/^\$|\$$/g, "")
      .replace(/^\\\[|\\\]$/g, "")
      .replace(/^\\\(|\\\)$/g, "")
      .trim();

    if (!cleaned) return null;

    return katex.renderToString(cleaned, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch {
    return null;
  }
}

/**
 * Normalizes Unicode mathematical alphanumeric variables (𝑓, 𝑥, 𝑦) and common symbols
 * in a standalone equation segment into clean LaTeX so KaTeX renders a publication-grade equation.
 */
function normalizeEquationForKatex(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/≈/g, "\\approx ")
    .replace(/±/g, "\\pm ")
    .replace(/×/g, "\\times ")
    .replace(/÷/g, "\\div ")
    .replace(/∑/g, "\\sum ")
    .replace(/∏/g, "\\prod ")
    .replace(/∫/g, "\\int ")
    .replace(/∂/g, "\\partial ")
    .replace(/∇/g, "\\nabla ")
    .replace(/√/g, "\\sqrt ")
    .replace(/∞/g, "\\infty ")
    .replace(/∈/g, "\\in ")
    .replace(/∉/g, "\\notin ")
    .replace(/⊂/g, "\\subset ")
    .replace(/⊆/g, "\\subseteq ")
    .replace(/∪/g, "\\cup ")
    .replace(/∩/g, "\\cap ")
    .replace(/→/g, "\\to ")
    .replace(/⇒/g, "\\Rightarrow ")
    .replace(/⇔/g, "\\Leftrightarrow ");
}

/**
 * Renders a text segment while automatically typesetting any inline/display LaTeX
 * ($...$, $$...$$, \[...\], \(...\), \begin{equation}...\end{equation}, or naked LaTeX
 * formulas like \frac{a}{b}, x^{2}, x_{i}) into crisp KaTeX equations.
 */
export const FormattedMathText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // 1. Check if the entire segment is a TikZ diagram block
  if (/\\begin\{tikzpicture\}|\\tikzpicture\b/i.test(text)) {
    return (
      <span className="my-2 block rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 font-mono text-xs text-slate-700">
        <span className="mb-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/70 text-[10px] font-sans font-semibold uppercase tracking-wider">
          LaTeX / TikZ Diagram Block (Excluded from AI Prose Score)
        </span>
        <span className="block whitespace-pre-wrap leading-relaxed">{text}</span>
      </span>
    );
  }

  // 2. Check if the entire segment is a short standalone naked mathematical equation block
  // (Segments that already have explicit $...$ or $$...$$ delimiters are handled by step 3)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (
    !text.includes("$") &&
    !text.includes("\\[") &&
    !text.includes("\\begin{") &&
    wordCount <= 28 &&
    isMathOrDiagramSegment(text) &&
    !/[a-zA-Z]{5,}\s+[a-zA-Z]{5,}\s+[a-zA-Z]{5,}/.test(text)
  ) {
    const normalizedEq = normalizeEquationForKatex(text);
    const html = renderKatexHtml(normalizedEq, true);
    if (html) {
      return (
        <span
          className="my-1.5 py-1.5 px-3.5 block rounded-xl bg-slate-50/80 border border-slate-200/70 overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }

  // 3. Tokenize mixed prose + inline/display math expressions:
  // Matches $$...$$, \[...\], \begin{equation}...\end{equation} (consuming redundant adjacent newlines
  // so block-level equations inside whitespace-pre-wrap do not create double/triple vertical gaps),
  // plus $...$ (excluding currency like $0.00), \(...\), naked LaTeX commands, and single-letter variable subscripts/superscripts.
  const mathRegex =
    /(?:\n[ \t]*)*(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\begin\{(?:equation\*?|align\*?|gather\*?)\}[\s\S]+?\\end\{(?:equation\*?|align\*?|gather\*?)\})(?:[ \t]*\n)*|(\$(?![0-9])[^$\n]+?(?<![0-9\s])\$|\\\([\s\S]+?\\\)|\\(?:frac|sqrt|sum|prod|int)\{(?:[^{}]|\{[^{}]*\})*\}(?:\{(?:[^{}]|\{[^{}]*\})*\})?|\b[a-zA-Zα-ωΑ-Ω](?:\^\{[^{}]+\}|_\{[^{}]+\}|\^[0-9a-zA-Z]|_[0-9a-zA-Z]{1,2})+\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={`txt-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
    }

    const token = (match[1] ?? match[2] ?? match[0]).trim();
    const isDisplay = Boolean(match[1]);

    const html = renderKatexHtml(normalizeEquationForKatex(token), isDisplay);
    if (html) {
      parts.push(
        <span
          key={`math-${match.index}`}
          className={
            isDisplay
              ? "my-2.5 py-2.5 px-4 block rounded-xl bg-slate-50/85 border border-slate-200/70 overflow-x-auto text-center shadow-2xs"
              : "inline-block align-middle mx-0.5"
          }
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else {
      parts.push(
        <React.Fragment key={`raw-${match.index}`}>{match[0]}</React.Fragment>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key={`txt-tail`}>{text.slice(lastIndex)}</React.Fragment>
    );
  }

  return <>{parts}</>;
};
