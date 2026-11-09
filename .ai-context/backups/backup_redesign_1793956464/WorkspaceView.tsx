import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ForensicSubmissionCase,
  TextHighlightSpan,
  TierLevel,
} from "../types/forensics";
import {
  evaluateDocxExportGuard,
  resolveSequentialSpanOffsets,
} from "../utils/forensicEngine";
import { FormattedMathText } from "../utils/mathRenderer";

interface WorkspaceViewProps {
  submission: ForensicSubmissionCase | null;
  isPreviewActive: boolean;
  isDragging: boolean;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onTogglePreview: () => void;
  onTriggerUpload: () => void;
  onDropFile: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStateChange: (dragging: boolean) => void;
  onEvaluateText: (rawText: string) => void;
  onOpenDossier: () => void;
}

const TIER_STYLES: Record<
  TierLevel,
  {
    label: string;
    barColor: string;
    badgeClass: string;
    scoreColor: string;
  }
> = {
  0: {
    label: "Human-Consistent",
    barColor: "bg-emerald-500",
    badgeClass: "bg-emerald-500/12 text-emerald-800",
    scoreColor: "text-emerald-700",
  },
  1: {
    label: "Inconclusive",
    barColor: "bg-amber-500",
    badgeClass: "bg-amber-500/12 text-amber-800",
    scoreColor: "text-amber-700",
  },
  2: {
    label: "Likely Synthetic",
    barColor: "bg-orange-500",
    badgeClass: "bg-orange-500/12 text-orange-800",
    scoreColor: "text-orange-600",
  },
  3: {
    label: "Proven Synthetic",
    barColor: "bg-rose-600",
    badgeClass: "bg-rose-500/12 text-rose-800",
    scoreColor: "text-rose-600",
  },
};

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  submission,
  isPreviewActive,
  isDragging,
  isAnalyzing,
  errorMessage,
  onTogglePreview,
  onTriggerUpload,
  onDropFile,
  onDragStateChange,
  onEvaluateText,
  onOpenDossier,
}) => {
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [showPdfPages, setShowPdfPages] = useState(false);

  const resolvedSpans = submission
    ? resolveSequentialSpanOffsets(
        submission.documentText,
        submission.report.highlighted_spans
      )
    : [];

  const activeSpanIndex = Math.max(
    0,
    resolvedSpans.findIndex((s) => s.id === selectedSpanId)
  );

  const activeSpan:
    | (TextHighlightSpan & { resolved_start?: number; resolved_end?: number })
    | undefined = resolvedSpans[activeSpanIndex] ?? resolvedSpans[0];

  const handleStepSpan = (delta: number) => {
    if (resolvedSpans.length === 0) return;
    const nextIdx =
      (activeSpanIndex + delta + resolvedSpans.length) % resolvedSpans.length;
    const nextSpan = resolvedSpans[nextIdx];
    if (nextSpan) {
      setSelectedSpanId(nextSpan.id);
      const el = document.getElementById(`forensic-span-${nextSpan.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const docxGuard =
    submission &&
    submission.report.document_metadata_forensics.file_type === "docx"
      ? evaluateDocxExportGuard({
          authorToolSignature:
            submission.report.document_metadata_forensics.author_tool_signature,
          totalDistinctRsids: submission.rsidSessionLog?.length ?? 0,
          wordCount: submission.stylometrics.wordCount,
          dominantRsid: submission.rsidSessionLog?.[0]?.rsid ?? "NONE",
          dominantRsidShare:
            submission.rsidSessionLog?.[0]?.wordSharePercentage ?? 0,
          editingDurationMinutes:
            submission.report.document_metadata_forensics
              .editing_duration_minutes,
        })
      : null;

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    onEvaluateText(pastedText);
  };

  const renderDocumentContent = () => {
    if (!submission) return null;
    const text = submission.documentText;

    if (!isPreviewActive || resolvedSpans.length === 0) {
      return (
        <div className="text-sm sm:text-base leading-[1.9] text-slate-800 whitespace-pre-wrap font-normal max-w-[70ch] mx-auto">
          <FormattedMathText text={text} />
        </div>
      );
    }

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    resolvedSpans.forEach((span, idx) => {
      const start = span.resolved_start;
      const end = span.resolved_end;

      if (start > cursor) {
        nodes.push(
          <span key={`plain-${idx}`}>
            <FormattedMathText text={text.slice(cursor, start)} />
          </span>
        );
      }

      const isSelected = activeSpan?.id === span.id;
      const highlightTone =
        span.severity_tier === 3
          ? isSelected
            ? "bg-rose-200/90 text-rose-950 ring-2 ring-rose-500/60"
            : "bg-rose-100/80 text-rose-950 hover:bg-rose-200/70"
          : span.severity_tier === 2
          ? isSelected
            ? "bg-orange-200/90 text-orange-950 ring-2 ring-orange-500/60"
            : "bg-orange-100/80 text-orange-950 hover:bg-orange-200/70"
          : isSelected
          ? "bg-amber-200/90 text-amber-950 ring-2 ring-amber-500/60"
          : "bg-amber-100/75 text-amber-950 hover:bg-amber-200/65";

      nodes.push(
        <motion.button
          key={span.id}
          id={`forensic-span-${span.id}`}
          type="button"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.2) }}
          onClick={() => setSelectedSpanId(span.id)}
          className={`inline text-left rounded-md px-1.5 py-0.5 mx-0.5 transition-all cursor-pointer ${highlightTone}`}
          aria-label={`AI detected passage ${idx + 1} (${Math.round(
            span.confidence * 100
          )}% AI probability)`}
        >
          <FormattedMathText text={text.slice(start, end)} />
          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-mono font-semibold bg-white/75 text-slate-800 align-baseline tabular-nums">
            {Math.round(span.confidence * 100)}%
          </span>
        </motion.button>
      );

      cursor = end;
    });

    if (cursor < text.length) {
      nodes.push(
        <span key="plain-tail">
          <FormattedMathText text={text.slice(cursor)} />
        </span>
      );
    }

    return (
      <div className="text-sm sm:text-base leading-[1.9] text-slate-800 whitespace-pre-wrap font-normal max-w-[70ch] mx-auto">
        {nodes}
      </div>
    );
  };

  const verdict = submission?.report.overall_verdict;
  const tierMeta = verdict ? TIER_STYLES[verdict.tier] : null;
  const aiPercent = verdict ? Math.round(verdict.aggregate_score * 100) : 0;

  const provenanceValue = !submission
    ? "—"
    : /latex|pdftex|xetex|luatex|tikz/i.test(
        submission.report.document_metadata_forensics.author_tool_signature
      )
    ? "LaTeX / Math Guard"
    : submission.report.document_metadata_forensics.file_type === "docx" &&
      docxGuard?.rsidTestStatus === "NOT_APPLICABLE"
    ? "Exporter Guard (N/A)"
    : docxGuard?.flags.some((f) => f.flag_code === "EXTERNAL_PASTE_DETECTED")
    ? "External Paste (Info)"
    : submission.report.document_metadata_forensics.editing_duration_minutes !==
      null
    ? `${submission.report.document_metadata_forensics.editing_duration_minutes}m edit`
    : submission.fusion.activeVetoes.metadataAbsentDowngrade
    ? `${submission.report.document_metadata_forensics.file_type.toUpperCase()} (Tier 2 Cap)`
    : submission.report.document_metadata_forensics.file_type.toUpperCase();

  const conformalVal = submission
    ? verdict?.conformal_p_value ?? submission.fusion.conformalPValue ?? 0.05
    : null;
  const pplVal = submission ? submission.stylometrics.meanSentencePPL : null;
  const burstVal = submission
    ? submission.stylometrics.sentenceBurstiness
    : null;
  const posVal = submission
    ? submission.stylometrics.posTransitionEntropy ?? 1.85
    : null;
  const top10Pct = submission ? Math.round(submission.gltr.top10 * 100) : null;

  const statRows = [
    {
      label: "Conformal p-value",
      value: conformalVal !== null ? `p = ${conformalVal.toFixed(3)}` : "—",
      fillPct:
        conformalVal !== null
          ? Math.max(8, Math.min(100, Math.round((1 - conformalVal) * 100)))
          : 0,
    },
    {
      label: "Perplexity (PPL)",
      value: pplVal !== null ? pplVal.toFixed(1) : "—",
      fillPct:
        pplVal !== null
          ? Math.max(8, Math.min(100, Math.round((pplVal / 80) * 100)))
          : 0,
    },
    {
      label: "Burstiness (B)",
      value: burstVal !== null ? burstVal.toFixed(2) : "—",
      fillPct:
        burstVal !== null
          ? Math.max(
              8,
              Math.min(100, Math.round(((burstVal + 0.6) / 1.4) * 100))
            )
          : 0,
    },
    {
      label: "POS Entropy H(POS)",
      value: posVal !== null ? `${posVal.toFixed(2)} bits` : "—",
      fillPct:
        posVal !== null
          ? Math.max(8, Math.min(100, Math.round((posVal / 3.2) * 100)))
          : 0,
    },
    {
      label: "Top-10 Tokens",
      value: top10Pct !== null ? `${top10Pct}%` : "—",
      fillPct: top10Pct !== null ? Math.max(8, Math.min(100, top10Pct)) : 0,
    },
    {
      label: "Provenance",
      value: provenanceValue,
      fillPct: submission ? 100 : 0,
    },
  ];

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
      {/* LEFT MAIN STAGE: Edge-to-Edge Optical Light-Table & Isolated Scroll Manuscript Viewer */}
      <section
        aria-label="Document & AI Highlighting Workspace"
        className="md:col-span-8 lg:col-span-9 flex flex-col overflow-hidden h-full min-h-0 relative"
      >
        <AnimatePresence mode="wait">
          {!submission ? (
            /* INITIAL STATE: Seamless Full-Stage Immersive Optical Drop Canvas */
            <motion.div
              key="empty-upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              onDragOver={(e) => {
                e.preventDefault();
                onDragStateChange(true);
              }}
              onDragLeave={() => onDragStateChange(false)}
              onDrop={onDropFile}
              className={`flex-1 forensic-light-table flex flex-col px-6 sm:px-10 py-6 text-center overflow-y-auto min-h-0 relative transition-colors duration-300 ${
                isDragging ? "bg-sky-50/80" : ""
              }`}
            >
              <div className="m-auto w-full max-w-lg py-4 space-y-5 relative z-10">
                <motion.div
                  onClick={onTriggerUpload}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload PDF, DOCX, or image file"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTriggerUpload();
                    }
                  }}
                  whileHover="hover"
                  whileTap="tap"
                  className="group cursor-pointer flex flex-col items-center justify-center py-4 px-4"
                >
                  {/* Animated Concentric Optical Lens Aperture */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <motion.div
                      variants={{
                        hover: { scale: 1.18, opacity: 1 },
                        tap: { scale: 0.95 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                        isDragging
                          ? "bg-sky-400/25 scale-125"
                          : "bg-sky-500/[0.07] group-hover:bg-sky-500/14"
                      }`}
                    />
                    <motion.div
                      variants={{
                        hover: { scale: 1.08 },
                        tap: { scale: 0.94 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 22,
                      }}
                      className="relative w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-6 h-6 animate-spin text-sky-300" />
                      ) : (
                        <Upload className="w-6 h-6 text-sky-300 transition-transform duration-300 group-hover:-translate-y-0.5" />
                      )}
                    </motion.div>
                  </div>

                  <h1 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {isAnalyzing
                      ? "Inspecting manuscript..."
                      : "Drop PDF, DOCX, or manuscript"}
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
                    Click anywhere on the stage or drag a file to run calibrated
                    transformer, LaTeX math, and container forensics.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-600">
                    {[
                      ".PDF + KaTeX",
                      ".DOCX RSID",
                      ".TXT / .MD",
                      "C2PA / FFT",
                    ].map((badge, i) => (
                      <motion.span
                        key={badge}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: 0.05 * i,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        whileHover={{ y: -2 }}
                        className="px-2.5 py-1 rounded-md bg-white/90 shadow-2xs transition-colors group-hover:text-slate-900"
                      >
                        {badge}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Direct Text Input Drawer */}
                <div className="space-y-3">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPasteBox((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>
                      {showPasteBox
                        ? "Close text editor"
                        : "Or paste manuscript text directly"}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {showPasteBox && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        onSubmit={handlePasteSubmit}
                        className="overflow-hidden text-left space-y-2.5 pt-1"
                      >
                        <textarea
                          rows={5}
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                          placeholder="Paste essay, LaTeX section, or research passage here..."
                          aria-label="Paste text to evaluate"
                          className="w-full p-4 text-xs sm:text-sm leading-relaxed text-slate-900 bg-white/95 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                        />
                        <div className="flex justify-end">
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <span>Evaluate Passage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {errorMessage && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-rose-600"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* LOADED STATE: Stationary Toolbar + Isolated Scrollable PDF/Manuscript Light-Table + Stationary Span Bar */
            <motion.div
              key="loaded-document"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col h-full min-h-0 overflow-hidden"
            >
              {/* Stationary Top Document Bar (div:nth-of-type(1)) */}
              <div className="shrink-0 px-5 sm:px-7 py-2.5 border-b border-slate-200/75 flex flex-wrap items-center justify-between gap-3 bg-white/75 backdrop-blur-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {submission.title}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                    · {submission.stylometrics.wordCount.toLocaleString()} words
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Segmented View Switcher when PDF pages exist */}
                  {submission.pdfPagePreviews &&
                    submission.pdfPagePreviews.length > 0 && (
                      <div className="inline-flex items-center p-0.5 rounded-full bg-slate-200/70 text-xs">
                        <button
                          type="button"
                          onClick={() => setShowPdfPages(false)}
                          className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            !showPdfPages
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Interactive Text & Math
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPdfPages(true)}
                          className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            showPdfPages
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Original PDF ({submission.pdfPagePreviews.length})
                        </button>
                      </div>
                    )}

                  {/* Quick Highlight Toggle & Stepper */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPdfPages(false);
                      onTogglePreview();
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isPreviewActive
                        ? "bg-rose-500/12 text-rose-800"
                        : "bg-slate-200/70 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {isPreviewActive
                        ? resolvedSpans.length > 0
                          ? `${resolvedSpans.length} AI span${
                              resolvedSpans.length === 1 ? "" : "s"
                            }`
                          : "0 synthetic spans"
                        : "Highlights Off"}
                    </span>
                  </button>

                  {isPreviewActive &&
                    resolvedSpans.length > 1 &&
                    !showPdfPages && (
                      <div className="inline-flex items-center gap-0.5 bg-slate-200/60 rounded-full p-0.5">
                        <button
                          type="button"
                          onClick={() => handleStepSpan(-1)}
                          title="Previous flagged span"
                          aria-label="Previous flagged span"
                          className="p-1 rounded-full text-slate-700 hover:bg-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-1.5 text-[11px] font-mono tabular-nums text-slate-700">
                          {activeSpanIndex + 1}/{resolvedSpans.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepSpan(1)}
                          title="Next flagged span"
                          aria-label="Next flagged span"
                          className="p-1 rounded-full text-slate-700 hover:bg-white transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                </div>
              </div>

              {/* Isolated Scrollable PDF / Manuscript Sheet Container (div:nth-of-type(2)) */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain forensic-light-table px-4 sm:px-8 py-6 sm:py-8">
                {showPdfPages &&
                submission.pdfPagePreviews &&
                submission.pdfPagePreviews.length > 0 ? (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {submission.pdfPagePreviews.map((dataUrl, pageIdx) => (
                      <motion.div
                        key={`pdf-page-${pageIdx + 1}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: Math.min(pageIdx * 0.05, 0.25),
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="liquid-glass-card rounded-[20px] p-4 overflow-hidden"
                      >
                        <div className="mb-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>Page {pageIdx + 1}</span>
                          <span>Original PDF Render</span>
                        </div>
                        <img
                          src={dataUrl}
                          alt={`Rendered PDF Page ${pageIdx + 1}`}
                          className="w-full h-auto rounded-lg"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.article
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-3xl mx-auto liquid-glass-card rounded-[20px] px-6 sm:px-12 py-8 sm:py-10"
                  >
                    {isPreviewActive && resolvedSpans.length === 0 && (
                      <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 flex items-center gap-2.5 text-xs text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          No synthetic passages detected. Sentence rhythm and
                          lexical diversity are consistent with human authorship.
                        </span>
                      </div>
                    )}

                    {renderDocumentContent()}
                  </motion.article>
                )}
              </div>

              {/* Stationary Bottom Span Lens Bar */}
              <AnimatePresence>
                {isPreviewActive && activeSpan && !showPdfPages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="shrink-0 px-5 sm:px-7 py-2.5 border-t border-slate-200/75 bg-white/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-semibold text-slate-900 shrink-0">
                        Span {activeSpanIndex + 1} of {resolvedSpans.length}:
                      </span>
                      <span className="truncate">
                        {activeSpan.reason_code === "HOMOGLYPH_EVASION"
                          ? "Hidden character / homoglyph substitution detected"
                          : activeSpan.reason_code === "MONOLITHIC_INSERTION"
                          ? "Single-session insertion with uniform token predictability"
                          : "Low burstiness & predictable token sequence"}
                      </span>
                    </div>
                    <div className="font-mono font-semibold text-rose-700 tabular-nums shrink-0">
                      {Math.round(activeSpan.confidence * 100)}% local AI
                      confidence
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* RIGHT STATIONARY FORENSIC RAIL: Seamless Architectural Ledger */}
      <aside
        aria-label="Overall AI Score & Statistical Numbers"
        className="md:col-span-4 lg:col-span-3 border-t md:border-t-0 md:border-l border-slate-200/80 bg-white/80 backdrop-blur-xl px-5 sm:px-6 py-5 flex flex-col justify-between gap-5 h-full min-h-0 overflow-y-auto"
      >
        <div className="space-y-5">
          {/* Primary Verdict & 4-Tier Optical Spectrum */}
          <div className="pb-5 border-b border-slate-200/75">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Overall AI Score
              </h2>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {submission ? `Tier ${verdict?.tier ?? 0} / 3` : "Standby"}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-3">
              <motion.span
                key={submission ? `score-${aiPercent}` : "score-empty"}
                initial={{ opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight ${
                  submission && tierMeta
                    ? tierMeta.scoreColor
                    : "text-slate-300"
                }`}
              >
                {submission ? `${aiPercent}%` : "—%"}
              </motion.span>

              {submission && tierMeta ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tierMeta.badgeClass}`}
                >
                  {tierMeta.label}
                </motion.span>
              ) : (
                <span className="text-xs text-slate-400">
                  Awaiting submission
                </span>
              )}
            </div>

            {/* 4-Tier Segmented Spectrum Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="h-2 w-full rounded-full bg-slate-200/75 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: submission ? `${Math.max(4, aiPercent)}%` : "0%",
                  }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${
                    tierMeta ? tierMeta.barColor : "bg-slate-400"
                  }`}
                />
              </div>
              {submission && verdict?.defensible_outcome && (
                <p className="text-[11px] font-medium text-slate-600">
                  {verdict.defensible_outcome}
                </p>
              )}
            </div>
          </div>

          {/* 6 Core Statistical Metrics Ledger with Micro-Animation Progress Lines */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Statistical Metrics
            </h3>

            <dl className="divide-y divide-slate-200/60 text-xs">
              {statRows.map((row, idx) => (
                <motion.div
                  key={row.label}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className="py-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-600">{row.label}</dt>
                    <dd className="font-mono font-semibold text-slate-900 tabular-nums text-right truncate">
                      {row.value}
                    </dd>
                  </div>
                  {submission && (
                    <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.fillPct}%` }}
                        transition={{
                          duration: 0.45,
                          delay: idx * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-full rounded-full bg-sky-500/55"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </dl>

            {/* Protection or Override Status Callout */}
            {submission &&
              (/latex|pdftex|xetex|luatex|tikz/i.test(
                submission.report.document_metadata_forensics
                  .author_tool_signature
              ) ||
                submission.fusion.activeVetoes.minimumLengthVeto ||
                submission.fusion.activeVetoes.eslProtectionVeto ||
                submission.fusion.activeVetoes.metadataAbsentDowngrade ||
                docxGuard?.rsidTestStatus === "NOT_APPLICABLE") && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl bg-emerald-500/10 px-3.5 py-2.5 flex items-center gap-2 text-[11px] font-medium text-emerald-900"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {/latex|pdftex|xetex|luatex|tikz/i.test(
                      submission.report.document_metadata_forensics
                        .author_tool_signature
                    )
                      ? "LaTeX / Math & Diagram guard active"
                      : submission.fusion.activeVetoes.minimumLengthVeto
                      ? "Short-text protection (<150 words)"
                      : submission.fusion.activeVetoes.eslProtectionVeto
                      ? "ESL fairness protection active"
                      : submission.fusion.activeVetoes.metadataAbsentDowngrade
                      ? "Metadata-Absent Cap (Tier 2 max)"
                      : "Google Docs / Pages export guard"}
                  </span>
                </motion.div>
              )}

            {submission && submission.sanitization.evasionFlagTriggered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 flex items-center gap-2 text-[11px] font-medium text-rose-900"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {submission.sanitization.anomalies.length} hidden evasion
                  char(s) stripped
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom: Verification Report Trigger */}
        {submission && (
          <motion.button
            type="button"
            onClick={onOpenDossier}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="w-full bg-slate-900 text-white rounded-xl py-2.5 px-4 text-xs font-semibold hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-sky-300" />
            <span>Verification Report</span>
          </motion.button>
        )}
      </aside>
    </div>
  );
};

