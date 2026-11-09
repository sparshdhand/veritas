import React, { useState, useEffect } from "react";
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
  Scale,
  Binary,
  Layers,
  Cpu,
  BarChart2,
  Clock,
  Sparkle,
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
  onLoadSampleSubmission: () => void;
}

const TIER_STYLES: Record<
  TierLevel,
  {
    label: string;
    badgeClass: string;
    scoreColor: string;
    barColor: string;
    description: string;
  }
> = {
  0: {
    label: "Tier 0 · Human-Consistent",
    badgeClass: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
    scoreColor: "text-[#047857]",
    barColor: "bg-[#047857]",
    description: "Consistent with peer-reviewed human academic controls.",
  },
  1: {
    label: "Tier 1 · Inconclusive",
    badgeClass: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
    scoreColor: "text-[#B45309]",
    barColor: "bg-[#B45309]",
    description: "Ambiguous markers; protected from disciplinary referral.",
  },
  2: {
    label: "Tier 2 · Anomalous / Likely AI",
    badgeClass: "bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]",
    scoreColor: "text-[#C2410C]",
    barColor: "bg-[#C2410C]",
    description: "Multi-signal corroboration indicates synthetic generation.",
  },
  3: {
    label: "Tier 3 · Proven Synthetic",
    badgeClass: "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]",
    scoreColor: "text-[#BE123C]",
    barColor: "bg-[#BE123C]",
    description: "High-confidence synthetic authorship with container flags.",
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
  onLoadSampleSubmission,
}) => {
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [showPdfPages, setShowPdfPages] = useState(false);

  // Progressive telemetry stage simulation during analysis
  const [analysisStage, setAnalysisStage] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setAnalysisStage(0);
      return;
    }
    const timer1 = setTimeout(() => setAnalysisStage(1), 220);
    const timer2 = setTimeout(() => setAnalysisStage(2), 520);
    const timer3 = setTimeout(() => setAnalysisStage(3), 850);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isAnalyzing]);

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

  const statMetrics = [
    {
      title: "Conformal P-Value",
      baseline: "p ≥ 0.05",
      display: conformalVal !== null ? `p = ${conformalVal.toFixed(3)}` : "—",
      status: conformalVal !== null && conformalVal < 0.05 ? "Significant Alert" : "Calibrated Normal",
      statusClass:
        conformalVal !== null && conformalVal < 0.05
          ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
          : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
      pct: conformalVal !== null ? Math.max(10, Math.min(100, Math.round((1 - conformalVal) * 100))) : 0,
    },
    {
      title: "Mean Perplexity (PPL)",
      baseline: "Human > 35.0",
      display: pplVal !== null ? pplVal.toFixed(1) : "—",
      status: pplVal !== null && pplVal < 25 ? "Uniform (AI)" : "Varied (Human)",
      statusClass:
        pplVal !== null && pplVal < 25
          ? "bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]"
          : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
      pct: pplVal !== null ? Math.max(10, Math.min(100, Math.round((pplVal / 80) * 100))) : 0,
    },
    {
      title: "Burstiness Metric",
      baseline: "Human B > 0.15",
      display: burstVal !== null ? burstVal.toFixed(2) : "—",
      status: burstVal !== null && burstVal < -0.1 ? "Monotonous" : "Natural Rhythm",
      statusClass:
        burstVal !== null && burstVal < -0.1
          ? "bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]"
          : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
      pct: burstVal !== null ? Math.max(10, Math.min(100, Math.round(((burstVal + 0.6) / 1.4) * 100))) : 0,
    },
    {
      title: "POS Transition Entropy",
      baseline: "H(POS) > 2.1 bits",
      display: posVal !== null ? `${posVal.toFixed(2)} bits` : "—",
      status: "Syntax Markov",
      statusClass: "bg-[#FAF8F4] text-[#645D56] border-[#DCD4C6]",
      pct: posVal !== null ? Math.max(10, Math.min(100, Math.round((posVal / 3.2) * 100))) : 0,
    },
    {
      title: "Top-10 Head Tokens",
      baseline: "Human < 45%",
      display: top10Pct !== null ? `${top10Pct}%` : "—",
      status: top10Pct !== null && top10Pct > 60 ? "Concentrated" : "Organic Vocabulary",
      statusClass:
        top10Pct !== null && top10Pct > 60
          ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
          : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
      pct: top10Pct !== null ? Math.max(10, Math.min(100, top10Pct)) : 0,
    },
    {
      title: "Container Provenance",
      baseline: "Verified Logs",
      display: provenanceValue,
      status: "Container Trail",
      statusClass: "bg-[#FAF8F4] text-[#645D56] border-[#DCD4C6]",
      pct: submission ? 100 : 0,
    },
  ];

  const renderDocumentContent = () => {
    if (!submission) return null;
    const text = submission.documentText;

    if (!isPreviewActive || resolvedSpans.length === 0) {
      return (
        <div className="text-base leading-[1.8] text-[#1C1917] whitespace-pre-wrap font-normal max-w-[72ch] mx-auto selection:bg-[#0F3B5F]/15">
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
            ? "bg-[#FFE4E6] text-[#881337] ring-2 ring-[#BE123C] border border-[#FECDD3] shadow-xs"
            : "bg-[#FFF1F2] text-[#9F1239] hover:bg-[#FFE4E6] border border-[#FECDD3]"
          : span.severity_tier === 2
          ? isSelected
            ? "bg-[#FFEDD5] text-[#7C2D12] ring-2 ring-[#C2410C] border border-[#FED7AA] shadow-xs"
            : "bg-[#FFF7ED] text-[#9A3412] hover:bg-[#FFEDD5] border border-[#FED7AA]"
          : isSelected
          ? "bg-[#FEF3C7] text-[#78350F] ring-2 ring-[#B45309] border border-[#FDE68A] shadow-xs"
          : "bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7] border border-[#FDE68A]";

      nodes.push(
        <button
          key={span.id}
          id={`forensic-span-${span.id}`}
          type="button"
          onClick={() => setSelectedSpanId(span.id)}
          className={`inline text-left rounded-md px-2 py-0.5 mx-0.5 transition-all cursor-pointer ${highlightTone}`}
          aria-label={`Flagged passage ${idx + 1}`}
        >
          <FormattedMathText text={text.slice(start, end)} />
          <span className="ml-2 inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-mono font-bold bg-white text-[#1C1917] align-baseline tabular-nums border border-[#DCD4C6] shadow-2xs">
            {Math.round(span.confidence * 100)}%
          </span>
        </button>
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
      <div className="text-base leading-[1.8] text-[#1C1917] whitespace-pre-wrap font-normal max-w-[72ch] mx-auto selection:bg-[#0F3B5F]/15">
        {nodes}
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col px-6 sm:px-10 py-6 max-w-[1780px] mx-auto min-h-0">
      {/* 16:9 Widescreen Studio Workbench Frame */}
      <div className="flex-1 rounded-2xl border border-[#DCD4C6] bg-[#FAF8F4] warm-paper-shadow overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* LEFT 8 COLS: Manuscript Inspection Stage */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 border-b lg:border-b-0 lg:border-r border-[#DCD4C6]">
          {!submission ? (
            /* EMPTY INTAKE FUNNEL WITH SENSORY DOPAMINE FEEDBACK */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                onDragStateChange(true);
              }}
              onDragLeave={() => onDragStateChange(false)}
              onDrop={onDropFile}
              className={`flex-1 flex flex-col items-center justify-center p-8 sm:p-14 text-center transition-all ${
                isDragging
                  ? "bg-[#EBF3FA] ring-4 ring-[#0F3B5F]/20"
                  : "bg-[#FAF8F4]"
              }`}
            >
              <div className="max-w-xl space-y-6">
                <div
                  onClick={onTriggerUpload}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload document file"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTriggerUpload();
                    }
                  }}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  {/* Forensic Target Ring Form */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0F3B5F]/30 animate-[spin_12s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-[#DCD4C6]" />
                    <div className="relative w-20 h-20 rounded-full bg-[#1C1917] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {isAnalyzing ? (
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                      ) : (
                        <Upload className="w-7 h-7 text-[#FAF8F4]" />
                      )}
                    </div>
                  </div>

                  {isAnalyzing ? (
                    <div className="mt-6 space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-[#1C1917]">
                        {analysisStage === 0 && "Disassembling OpenXML & PDF container..."}
                        {analysisStage === 1 && "Running local ONNX transformer sequence attention..."}
                        {analysisStage === 2 && "Computing subword entropy & GLTR predictability..."}
                        {analysisStage >= 3 && "Calibrating empirical conformal baseline p-values..."}
                      </h3>
                      <p className="text-xs font-mono text-[#0F3B5F] font-semibold animate-pulse">
                        Step {analysisStage + 1} of 4: Proof of Work Ingestion Active
                      </p>
                    </div>
                  ) : (
                    <>
                      <h2 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
                        Drop academic manuscript to inspect
                      </h2>
                      <p className="mt-2 text-sm text-[#44403C] leading-relaxed max-w-md">
                        Drag any PDF academic paper, Word .docx container, or text file.
                        Direct client-side ingestion with zero cloud privacy leakage.
                      </p>
                    </>
                  )}
                </div>

                {!isAnalyzing && (
                  <>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono text-[#645D56]">
                      {["PDF + LaTeX Parser", "DOCX RSID Extractor", "TXT / Markdown", "Spectral FFT Image"].map(
                        (badge) => (
                          <span
                            key={badge}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#DCD4C6] shadow-2xs font-semibold"
                          >
                            {badge}
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPasteBox((prev) => !prev)}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-[#44403C] bg-[#FAF8F4] hover:bg-[#EBE5DA] border border-[#DCD4C6] transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>{showPasteBox ? "Hide Paste Field" : "Paste Manuscript Text Directly"}</span>
                      </button>
                    </div>

                    {showPasteBox && (
                      <form
                        onSubmit={handlePasteSubmit}
                        className="mt-4 text-left space-y-3 bg-white p-5 rounded-xl border border-[#DCD4C6]"
                      >
                        <textarea
                          rows={6}
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                          placeholder="Paste academic passage, essay, or derivation here..."
                          className="w-full p-4 text-sm text-[#1C1917] bg-[#FAF8F4] border border-[#DCD4C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B5F]/40"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F3B5F] hover:bg-[#0c2f4d] tactile-press cursor-pointer"
                          >
                            <span>Analyze Passage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    )}

                    {errorMessage && (
                      <p className="mt-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                        {errorMessage}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* LOADED DOCUMENT VIEW */
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
              {/* Document Header Bar */}
              <div className="shrink-0 px-6 py-3.5 border-b border-[#DCD4C6] bg-[#FAF8F4] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-[#645D56] shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#1C1917] truncate">
                      {submission.title}
                    </h3>
                    <span className="text-xs text-[#645D56] font-mono tabular-nums font-semibold">
                      {submission.stylometrics.wordCount.toLocaleString()} words ·{" "}
                      {submission.report.document_metadata_forensics.file_type.toUpperCase()} ·{" "}
                      {submission.report.document_metadata_forensics.author_tool_signature || "Standard Container"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* PDF view switcher if previews exist */}
                  {submission.pdfPagePreviews &&
                    submission.pdfPagePreviews.length > 0 && (
                      <div className="inline-flex items-center p-0.5 rounded-lg bg-[#EBE5DA] text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setShowPdfPages(false)}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            !showPdfPages
                              ? "bg-white text-[#1C1917] shadow-2xs font-bold"
                              : "text-[#645D56] hover:text-[#1C1917]"
                          }`}
                        >
                          Interactive Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPdfPages(true)}
                          className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                            showPdfPages
                              ? "bg-white text-[#1C1917] shadow-2xs font-bold"
                              : "text-[#645D56] hover:text-[#1C1917]"
                          }`}
                        >
                          Original PDF ({submission.pdfPagePreviews.length})
                        </button>
                      </div>
                    )}

                  {/* Span Stepper */}
                  {isPreviewActive && resolvedSpans.length > 1 && !showPdfPages && (
                    <div className="inline-flex items-center gap-1 bg-[#EBE5DA] rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleStepSpan(-1)}
                        title="Previous flagged passage"
                        aria-label="Previous flagged passage"
                        className="p-1 rounded text-[#44403C] hover:bg-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1.5 text-xs font-mono tabular-nums text-[#1C1917] font-bold">
                        {activeSpanIndex + 1}/{resolvedSpans.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStepSpan(1)}
                        title="Next flagged passage"
                        aria-label="Next flagged passage"
                        className="p-1 rounded text-[#44403C] hover:bg-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Manuscript Scroll Canvas with Generous Margin */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 sm:px-16 py-10 bg-[#FAF8F4]">
                {submission.imagePreviewUrl ? (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Clear Teacher Image Forensic Status Banner (Adjudication Tiering Framework) */}
                    {submission.report.image_forensics?.c2pa_manifest_present ||
                    submission.report.document_metadata_forensics.author_tool_signature.includes("Midjourney") ||
                    submission.report.document_metadata_forensics.author_tool_signature.includes("Stable Diffusion") ||
                    submission.report.document_metadata_forensics.author_tool_signature.includes("Adobe Firefly") ? (
                      /* TIER 1: Conclusive Provenance */
                      <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-4 shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 mb-1">
                            Tier 1 · Conclusive Provenance
                          </span>
                          <h4 className="text-base font-bold text-rose-950">
                            Frontier AI Generated Media Verified
                          </h4>
                          <p className="text-sm text-rose-800 mt-1">
                            Cryptographic C2PA / JUMBF manifest verified: <strong className="font-semibold">{submission.report.image_forensics?.c2pa_verified_ai_generator || submission.report.document_metadata_forensics.author_tool_signature}</strong>.
                          </p>
                        </div>
                      </div>
                    ) : submission.fusion.tier >= 2 ||
                      submission.report.document_metadata_forensics.flags.some((f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED") ? (
                      /* TIER 2: Corroborated Physical / Visual Anomaly (Catches Stripped AI Images) */
                      <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-4 shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                            Tier 2 · Corroborated AI Anomaly
                          </span>
                          <h4 className="text-base font-bold text-amber-950">
                            Likely AI Generated Media (Stripped Metadata Corroboration)
                          </h4>
                          <p className="text-sm text-amber-800 mt-1">
                            {submission.report.document_metadata_forensics.flags.find((f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED")?.description ??
                             "Visual AI generator indicators or watermark detected in image."}
                          </p>
                          <p className="text-xs text-amber-700 mt-2 font-medium">
                            Note for teacher: Metadata was stripped (e.g. social download or screenshot), but visual invariants confirm synthetic generation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* TIER 0 / 3: Human-Consistent / Clean */
                      <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-4 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                            Tier 0 · Human-Consistent
                          </span>
                          <h4 className="text-base font-bold text-emerald-950">
                            Clean Image · No AI Markers Detected
                          </h4>
                          <p className="text-sm text-emerald-800 mt-1">
                            Image passes digital provenance checks. No AI generator metadata or synthetic generator markers detected.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Preview Canvas */}
                    <div className="bg-white border border-[#DCD4C6] rounded-2xl p-6 shadow-sm flex flex-col items-center">
                      <img
                        src={submission.imagePreviewUrl}
                        alt="Submitted Student Poster/Artwork"
                        className="max-h-[500px] w-auto object-contain rounded-xl border border-[#E8E2D6] shadow-2xs"
                      />
                      <div className="mt-4 w-full flex items-center justify-between text-xs font-mono text-[#645D56] pt-3 border-t border-[#E8E2D6]">
                        <span>File: {submission.title}</span>
                        <span>Direct Image Provenance Check</span>
                      </div>
                    </div>
                  </div>
                ) : showPdfPages &&
                submission.pdfPagePreviews &&
                submission.pdfPagePreviews.length > 0 ? (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {submission.pdfPagePreviews.map((dataUrl, pageIdx) => (
                      <div
                        key={`pdf-page-${pageIdx + 1}`}
                        className="bg-white border border-[#DCD4C6] rounded-xl p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between text-xs font-mono text-[#645D56]">
                          <span>Page {pageIdx + 1}</span>
                          <span>PDF Render</span>
                        </div>
                        <img
                          src={dataUrl}
                          alt={`Rendered PDF Page ${pageIdx + 1}`}
                          className="w-full h-auto rounded border border-[#E8E2D6]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <article className="max-w-3xl mx-auto bg-white border border-[#DCD4C6] rounded-xl px-10 sm:px-16 py-12 warm-paper-shadow relative">
                    {isPreviewActive && resolvedSpans.length === 0 && (
                      <div className="mb-6 p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-xs text-[#065F46] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                        <span>
                          No synthetic passages detected. Sentence rhythm, Markov entropy, and vocabulary align with peer-reviewed human academic controls.
                        </span>
                      </div>
                    )}
                    {renderDocumentContent()}
                  </article>
                )}
              </div>

              {/* Active Span Contextual Marginalia Bar */}
              {isPreviewActive && activeSpan && !showPdfPages && (
                <div className="shrink-0 px-6 py-3 border-t border-[#DCD4C6] bg-white flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-[#44403C] min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C] shrink-0" />
                    <span className="font-bold text-[#1C1917] shrink-0">
                      Flagged Passage {activeSpanIndex + 1}:
                    </span>
                    <span className="truncate text-[#645D56] font-medium">
                      {activeSpan.reason_code === "HOMOGLYPH_EVASION"
                        ? "Hidden zero-width character or Cyrillic homoglyph substitution detected"
                        : activeSpan.reason_code === "MONOLITHIC_INSERTION"
                        ? "Single-session monolithic paste with uniform subword token predictability"
                        : "Low perplexity variance & uniform subword sequence"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#BE123C] tabular-nums shrink-0">
                    {Math.round(activeSpan.confidence * 100)}% Local AI Confidence
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT 4 COLS: Verified Evidentiary Ledger & Telemetry */}
        <div className="lg:col-span-4 bg-[#FAF8F4] p-6 flex flex-col justify-between gap-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              {/* High-Impact Judicial Certificate Card */}
              <div className="bg-white border-2 border-[#0F3B5F]/20 rounded-2xl p-6 warm-paper-shadow relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#0F3B5F]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#0F3B5F] font-bold">
                      Official Adjudication Certificate
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#DCD4C6] text-[#1C1917]">
                    {submission ? `TIER ${verdict?.tier ?? 0}` : "STANDBY"}
                  </span>
                </div>

                <div className="py-2 flex items-baseline justify-between gap-4">
                  {submission ? (
                    <>
                      <span className={`text-6xl font-extrabold font-mono ${tierMeta?.scoreColor}`}>{aiPercent}%</span>
                      <span className={`text-xs font-bold ${tierMeta?.badgeClass}`}>{tierMeta?.label}</span>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-baseline gap-1.5 opacity-40">
                        <span className="text-6xl font-extrabold font-mono tracking-tighter text-[#645D56]">00</span>
                        <span className="text-2xl font-mono text-[#645D56] font-bold">%</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#F4F1EA] text-[#645D56] border border-[#DCD4C6]">
                          Awaiting Document
                        </span>
                      </div>
                    </div>
                  )}
                </div>


              </div>


            </div>

            {/* Safeguards Veto Indicators */}
            {submission && (
              <div className="space-y-2">
                {(/latex|pdftex|xetex|luatex|tikz/i.test(
                  submission.report.document_metadata_forensics
                    .author_tool_signature
                ) ||
                  submission.fusion.activeVetoes.minimumLengthVeto ||
                  submission.fusion.activeVetoes.eslProtectionVeto ||
                  submission.fusion.activeVetoes.metadataAbsentDowngrade ||
                  docxGuard?.rsidTestStatus === "NOT_APPLICABLE") && (
                  <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3.5 flex items-center gap-2.5 text-xs text-[#065F46] font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>
                      {/latex|pdftex|xetex|luatex|tikz/i.test(
                        submission.report.document_metadata_forensics
                          .author_tool_signature
                      )
                        ? "LaTeX / Math formula protection active"
                        : submission.fusion.activeVetoes.minimumLengthVeto
                        ? "Short-text protection (<150 words)"
                        : submission.fusion.activeVetoes.eslProtectionVeto
                        ? "ESL demographic fairness protection active"
                        : submission.fusion.activeVetoes.metadataAbsentDowngrade
                        ? "Metadata-Absent Cap (Tier 2 max)"
                        : "Google Docs / Pages export guard"}
                    </span>
                  </div>
                )}

                {submission.sanitization.evasionFlagTriggered && (
                  <div className="rounded-xl bg-[#FFF1F2] border border-[#FECDD3] p-3.5 flex items-center gap-2.5 text-xs text-[#9F1239] font-medium">
                    <AlertTriangle className="w-4 h-4 text-[#BE123C] shrink-0" />
                    <span>
                      {submission.sanitization.anomalies.length} zero-width / homoglyph
                      characters neutralized
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
