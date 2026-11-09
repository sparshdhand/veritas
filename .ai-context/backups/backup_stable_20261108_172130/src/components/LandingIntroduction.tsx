import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileSearch,
  Cpu,
  Layers,
  Scale,
  Lock,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

interface LandingIntroductionProps {
  onLaunchWorkbench: () => void;
  onQuickUpload: () => void;
}

export const LandingIntroduction: React.FC<LandingIntroductionProps> = ({
  onLaunchWorkbench,
  onQuickUpload,
}) => {
  return (
    <div className="relative w-full min-h-full flex flex-col justify-between overflow-y-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-14 max-w-7xl mx-auto selection:bg-amber-400/20 selection:text-amber-200">
      {/* Top Brand Bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between gap-4 pb-8 border-b border-zinc-800/80"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
            <Fingerprint className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
              Veritas Forensic
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25">
                v2.4
              </span>
            </span>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Calibrated multi-modal academic integrity intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLaunchWorkbench}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
          >
            <span>Open Workbench</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="my-auto py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Copy Column */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beyond probabilistic black-box scores</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.08]"
          >
            Defensible evidence.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500">
              Not speculation.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-[54ch]"
          >
            Veritas combines local ONNX neural classification, OpenXML session logs,
            conformal error-rate bounds, and mathematical syntax guards into a 4-tier
            institutional hearing dossier.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              type="button"
              onClick={onLaunchWorkbench}
              className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Launch Forensic Workbench</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onQuickUpload}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 transition-colors cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-amber-400" />
              <span>Select File Directly</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-6 pt-4 text-xs font-mono text-zinc-400"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ESL Fairness Guard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              LaTeX / KaTeX Shield
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              OpenXML RSID
            </span>
          </motion.div>
        </div>

        {/* Right Feature Showcase (Kinetic Bento Card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="lg:col-span-5 relative"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-500/20 to-sky-500/10 blur-xl opacity-75" />

          <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Evidentiary Framework
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-zinc-800 text-amber-300">
                4-Tier Review
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200">
                    Local ONNX Transformer
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Quantized RoBERTa/DeBERTa inference running locally without external API leaks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="p-2 rounded-lg bg-sky-400/10 text-sky-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200">
                    OpenXML Session & RSID
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Inspects Word editing session logs, revision IDs, and sudden monolithic pastes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200">
                    Conformal Calibration
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Mathematical p-values bounded against 200 empirical human academic controls.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onLaunchWorkbench}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700/60"
              >
                <span>Enter Workspace</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Local CPU Execution — No student manuscript data leaves your host</span>
        </div>
        <div>
          <span>Institutional Academic Integrity Standard · FERPA Compliant</span>
        </div>
      </motion.div>
    </div>
  );
};
