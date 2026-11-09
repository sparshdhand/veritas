import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Cpu,
  Layers,
  Sparkles,
  Upload,
  Lock,
  ChevronRight,
  Fingerprint,
  CheckCircle2,
} from "lucide-react";

interface LandingPageProps {
  onEnterWorkbench: () => void;
  onQuickUpload: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkbench,
  onQuickUpload,
}) => {
  return (
    <div className="cinema-16-9-viewport justify-between px-6 sm:px-12 lg:px-20 py-8 lg:py-12 max-w-[1720px] mx-auto w-full">
      {/* Top Folio Strip */}
      <header className="w-full flex items-center justify-between pb-6 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F3B5F] text-white flex items-center justify-center font-bold shadow-md shadow-[#0F3B5F]/20">
            <Fingerprint className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#1C1917]">
                Veritas Forensic
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EBF3FA] text-[#0F3B5F] font-bold border border-[#0F3B5F]/20">
                16:9 Cinema Edition
              </span>
            </div>
            <p className="text-xs text-[#78716C] font-medium">
              Multi-Modal Academic Evidentiary Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onEnterWorkbench}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#1C1917] bg-white hover:bg-[#F1ECE4] border border-[#E5DFD5] shadow-xs tactile-press cursor-pointer"
          >
            <span>Launch Forensic Workbench</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0F3B5F] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Showcase (Cinema 16:9 Proportional Split) */}
      <div className="my-auto py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Editorial Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF3FA] border border-[#0F3B5F]/20 text-[#0F3B5F] text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-[#0F3B5F]" />
            <span>Defensible Hearing Standards · FERPA Compliant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] leading-[1.08]">
            Evidence before accusation.{" "}
            <span className="text-[#0F3B5F]">
              Defensible academic forensics.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#44403C] leading-relaxed max-w-[55ch]">
            Veritas eliminates arbitrary percentage scores. Combining local CPU ONNX
            neural inference, OpenXML editing logs, and conformal error bounds
            calibrated against 200 empirical peer-reviewed human academic controls.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onEnterWorkbench}
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-xl font-bold text-sm text-white bg-[#0F3B5F] hover:bg-[#0c2f4d] shadow-lg shadow-[#0F3B5F]/25 tactile-press cursor-pointer"
            >
              <span>Open Forensic Workbench</span>
              <ChevronRight className="w-4 h-4 text-sky-300 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onQuickUpload}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm text-[#1C1917] bg-white hover:bg-[#F1ECE4] border border-[#E5DFD5] shadow-sm tactile-press cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#0F3B5F]" />
              <span>Drop Submission File</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-mono text-[#78716C]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#047857]" />
              ESL Demographic Fairness Shield
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F3B5F]" />
              LaTeX / KaTeX Formula Guard
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B45309]" />
              OpenXML Revision RSID Logs
            </span>
          </div>
        </div>

        {/* Right High-Impact Evidentiary Card */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-2xl bg-white border border-[#E5DFD5] p-7 editorial-paper-shadow space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE6DC]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#78716C] font-semibold">
                Multi-Signal Evidentiary Ledger
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EBF3FA] text-[#0F3B5F]">
                4-Tier Review
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#F7F5F0] border border-[#ECE6DC]">
                <div className="p-2.5 rounded-lg bg-white border border-[#E5DFD5] text-[#0F3B5F] shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    Local CPU ONNX Sequence Classification
                  </h3>
                  <p className="text-xs text-[#44403C] mt-0.5 leading-relaxed">
                    Quantized transformer sequence evaluation runs inside your host without transmitting student texts over the web.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#F7F5F0] border border-[#ECE6DC]">
                <div className="p-2.5 rounded-lg bg-white border border-[#E5DFD5] text-[#B45309] shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    OpenXML Session & Monolithic Paste Audit
                  </h3>
                  <p className="text-xs text-[#44403C] mt-0.5 leading-relaxed">
                    Disassembles DOCX packages to verify actual editing minutes and detect bulk clipboard dumps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#F7F5F0] border border-[#ECE6DC]">
                <div className="p-2.5 rounded-lg bg-white border border-[#E5DFD5] text-[#047857] shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    Conformal Baseline P-Value Calibration
                  </h3>
                  <p className="text-xs text-[#44403C] mt-0.5 leading-relaxed">
                    Statistical bounds tied to an empirical false-positive ceiling (FPR &le; 5%) for defensible review committee hearings.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#78716C] font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#78716C]" />
                Zero-Leak Host Storage
              </span>
              <span className="font-semibold text-[#0F3B5F]">
                Click Launch to begin &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Colophon */}
      <footer className="w-full pt-6 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#78716C]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1C1917]">Veritas Forensic</span>
          <span>·</span>
          <span>Academic Integrity Standard</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span>Page 1 of 2: Executive Briefing</span>
          <span>Local ONNX Runtime</span>
        </div>
      </footer>
    </div>
  );
};
