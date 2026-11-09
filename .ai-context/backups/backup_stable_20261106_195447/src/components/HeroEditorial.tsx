import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Sparkles,
  ArrowDown,
  Layers,
  Scale,
  Cpu,
  Fingerprint,
  Lock,
  Binary,
  CheckCircle,
} from "lucide-react";

interface HeroEditorialProps {
  onScrollToWorkbench: () => void;
  onTriggerUpload: () => void;
}

export const HeroEditorial: React.FC<HeroEditorialProps> = ({
  onScrollToWorkbench,
  onTriggerUpload,
}) => {
  return (
    <section
      id="hero"
      className="relative w-full py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-slate-200/80 bg-white"
    >
      {/* 16:9 Aspect Proportional Container */}
      <div className="widescreen-frame grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Title & Evidentiary Claim */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Defensible Multi-Modal Academic Forensics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Evidence before accusation.{" "}
            <span className="text-sky-600">
              Zero probabilistic guesswork.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[56ch]">
            Veritas eliminates black-box AI percentage claims. Combining local CPU ONNX
            neural inference, OpenXML editing duration, and conformal error-rate bounds
            guaranteed against 200 empirical human academic controls.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onScrollToWorkbench}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Explore Interactive Lab</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </button>

            <button
              type="button"
              onClick={onTriggerUpload}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-sky-600" />
              <span>Analyze File Directly</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              ESL Demographic Fairness Shield
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
              LaTeX / KaTeX Derivation Guard
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              OpenXML Revision RSID Logs
            </span>
          </div>
        </div>

        {/* Right Column: 16:9 Showcase Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-7 shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Institutional Evidentiary Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Peer-Reviewed Baseline
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200">
                <div className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Local CPU ONNX Sequence Classifier
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Runs quantized RoBERTa sequence classification in local memory without exposing student essays to third-party APIs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    OpenXML Session & Monolithic Paste Audit
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Validates total editing time, word share per revision, and flags bulk clipboard dumps into Word documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Conformal Prediction Error Bound
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Binds statistical p-values to an allowable false positive rate ceiling (FPR &le; 5%) for defensible disciplinary hearings.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Localhost Private
              </span>
              <span>16:9 Precision Stage</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
