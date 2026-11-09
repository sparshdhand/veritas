import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Upload, RotateCcw, Eye } from "lucide-react";

interface TopNavProps {
  hasActiveSubmission: boolean;
  isPreviewActive: boolean;
  detectedSpanCount: number;
  onTogglePreview: () => void;
  onTriggerUpload: () => void;
  onReset: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  hasActiveSubmission,
  isPreviewActive,
  detectedSpanCount,
  onTogglePreview,
  onTriggerUpload,
  onReset,
}) => {
  return (
    <header className="relative w-full px-4 sm:px-6 py-2.5 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl flex items-center justify-between gap-3 sm:gap-6 shrink-0">
      {/* Left: Optical Orb & Brand / Reset */}
      <div className="relative z-10 flex items-center gap-3 shrink-0">
        <motion.button
          type="button"
          onClick={onReset}
          whileHover={{ scale: 1.07, rotate: hasActiveSubmission ? -25 : 0 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          title={
            hasActiveSubmission ? "Clear & start new scan" : "Veritas Forensic"
          }
          aria-label={
            hasActiveSubmission
              ? "Clear and start new scan"
              : "Veritas Forensic Home"
          }
          className="liquid-glass-orb w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {hasActiveSubmission ? (
              <motion.span
                key="reset-icon"
                initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
                transition={{ duration: 0.16 }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="ready-dot"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.16 }}
                className="w-2 h-2 rounded-full bg-white/95"
              />
            )}
          </AnimatePresence>
        </motion.button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight text-slate-900">
            Veritas
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                hasActiveSubmission ? "bg-emerald-500" : "bg-sky-500"
              }`}
            />
            {hasActiveSubmission ? "Active Scan" : "Ready"}
          </span>
        </div>
      </div>

      {/* Centered over PDF Viewer Column (md:col-span-8 = 2/3, lg:col-span-9 = 3/4) */}
      <div className="flex-1 flex items-center justify-center md:absolute md:inset-y-0 md:left-0 md:w-2/3 lg:w-3/4 md:pointer-events-none">
        <motion.button
          type="button"
          onClick={onTogglePreview}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 450, damping: 26 }}
          className={`pointer-events-auto group relative w-full max-w-[340px] md:max-w-[380px] lg:max-w-[420px] py-1.5 sm:py-2 px-4 rounded-full text-xs sm:text-sm font-semibold tracking-tight flex items-center justify-between gap-3 transition-colors duration-200 cursor-pointer ${
            isPreviewActive && hasActiveSubmission
              ? "liquid-glass-pill-active"
              : "liquid-glass-pill text-slate-800 hover:bg-white"
          }`}
        >
          <span className="flex items-center gap-2">
            {isPreviewActive && hasActiveSubmission ? (
              <Eye className="w-3.5 h-3.5 text-sky-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-sky-600 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            )}
            <span>Preview AI Detection</span>
          </span>

          <motion.span
            layout
            className={`px-2.5 py-0.5 text-[11px] font-mono tabular-nums rounded-full transition-colors ${
              isPreviewActive && hasActiveSubmission
                ? "bg-white/15 text-sky-200"
                : hasActiveSubmission && detectedSpanCount > 0
                ? "bg-rose-100/90 text-rose-800"
                : "bg-slate-200/75 text-slate-600"
            }`}
          >
            {hasActiveSubmission
              ? isPreviewActive
                ? `${detectedSpanCount} flagged`
                : `${detectedSpanCount} found · Off`
              : "Inspect"}
          </motion.span>
        </motion.button>
      </div>

      {/* Right: Upload Trigger */}
      <div className="relative z-10 shrink-0">
        <motion.button
          type="button"
          onClick={onTriggerUpload}
          whileHover={{ y: -1, scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="liquid-glass-upload-btn group rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-slate-900/30"
        >
          <Upload className="w-3.5 h-3.5 text-sky-300 transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span>Upload</span>
        </motion.button>
      </div>
    </header>
  );
};


