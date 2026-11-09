import React, { useState } from "react";
import { X, Copy, Check, Download, Scale, ShieldCheck } from "lucide-react";
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
    `FOUR-STAGE INSTITUTIONAL HEARING PROTOCOL:`,
    ...steps.map(
      (s) =>
        `[Phase ${s.stepNumber}: ${s.title}] - Status: ${s.status.toUpperCase()}\n` +
        `Finding: ${s.finding}\n`
    ),
  ].join("\n");

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextDossier);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([plainTextDossier], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Veritas_Hearing_Dossier_${report.submission_id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="dossier-title" className="text-base font-bold text-slate-900">
                Institutional Hearing Dossier
              </h2>
              <p className="text-xs text-slate-500">
                Evidentiary summary & hearing protocol · Case #{report.submission_id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export TXT</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed bg-white">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Executive Finding
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                  report.overall_verdict.tier === 0
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : report.overall_verdict.tier === 1
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}
              >
                Tier {report.overall_verdict.tier}: {report.overall_verdict.tier_label}
              </span>
            </div>
            <p className="text-slate-800 font-medium">
              {report.overall_verdict.summary_justification}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600">
              <span>Conformal p = {conformalP.toFixed(4)}</span>
              <span>Allowable FPR Ceiling &le; {(fprCeiling * 100).toFixed(0)}%</span>
              <span>Disciplinary Action Eligible: {report.overall_verdict.disciplinary_action_eligible ? "YES" : "NO"}</span>
            </div>
          </div>

          {/* 4-Stage Protocol */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Structured Administrative Review Phases
            </h3>

            <div className="space-y-3">
              {steps.map((phase) => (
                <div
                  key={phase.stepNumber}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Phase {phase.stepNumber}: {phase.title}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        phase.status === "verified_anomaly"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : phase.status === "protected_clear"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {phase.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {phase.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
