import React, { useState } from "react";
import { X, Copy, Check, Download, FileText } from "lucide-react";
import { ForensicSubmissionCase } from "../types/forensics";
import { generateHearingProtocolSteps } from "../utils/forensicEngine";

interface HearingDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  forensicCase: ForensicSubmissionCase;
}

export const HearingDossierModal: React.FC<HearingDossierModalProps> = ({
  isOpen,
  onClose,
  forensicCase,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);

  if (!isOpen) return null;

  const report = forensicCase.report;
  const steps = generateHearingProtocolSteps(report);

  const conformalP =
    report.overall_verdict.conformal_p_value ??
    forensicCase.fusion.conformalPValue ??
    0.05;
  const fprCeiling =
    report.overall_verdict.allowable_fpr_ceiling ??
    forensicCase.fusion.allowableFprCeiling ??
    0.05;
  const defensibleOutcome =
    report.overall_verdict.defensible_outcome ??
    forensicCase.fusion.defensibleOutcome ??
    "Consistent with Human Baseline";

  const plainTextDossier = [
    `DEFENSIBLE ACADEMIC INTEGRITY FORENSIC DOSSIER`,
    `Submission ID: ${report.submission_id}`,
    `Title: ${forensicCase.title}`,
    `Candidate: ${forensicCase.studentAlias} (${forensicCase.courseCode})`,
    `Timestamp: ${report.timestamp}`,
    `Defensible Outcome: ${defensibleOutcome}`,
    `Overall Verdict: Tier ${report.overall_verdict.tier} — ${report.overall_verdict.tier_label} (P_aggregate = ${report.overall_verdict.aggregate_score.toFixed(3)})`,
    `Conformal Calibration: p = ${conformalP.toFixed(4)} (Allowable FPR Ceiling: <= ${(fprCeiling * 100).toFixed(0)}%)`,
    `Disciplinary Hearing Eligible: ${report.overall_verdict.disciplinary_action_eligible ? "YES (Multi-Signal Corroborated)" : "NO (Protected / Insufficient Corroboration)"}`,
    ``,
    `EXECUTIVE JUSTIFICATION:`,
    report.overall_verdict.summary_justification,
    ``,
    `EVIDENCE PRESENTATION CHAIN:`,
    ...steps.map((s) => `${s.stepNumber}. ${s.title} [${s.status.toUpperCase()}]\n   ${s.finding}`),
  ].join("\n");

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainTextDossier);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 1800);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.submission_id}_forensic_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono text-slate-500">
              Protocol for Academic Misconduct Hearings · {report.submission_id}
            </div>
            <h2 id="dossier-modal-title" className="text-base font-bold text-slate-900">
              Defensive Multi-Signal Forensic Evidence Dossier
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Hearing Dossier Modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Verdict Summary */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className="font-bold text-slate-900">
                Outcome: {defensibleOutcome}
              </span>
              <span className="font-semibold text-slate-800">
                Conformal p = {conformalP.toFixed(3)} · Score: {(report.overall_verdict.aggregate_score * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {report.overall_verdict.summary_justification}
            </p>
          </div>

          {/* 4-Step Chain of Evidence */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-900">
              Verifiable Chain of Evidence (Hearing Presentation Protocol)
            </div>
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-900">
                    Step 0{step.stepNumber}: {step.title}
                  </span>
                  <span className="text-slate-500 uppercase">{step.status}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{step.finding}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <a
            href="/assets/aistudio/ai_generated_content_detection_school_research_436126af.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reference Architecture PDF</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied Hearing Brief</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hearing Brief</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Payload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
