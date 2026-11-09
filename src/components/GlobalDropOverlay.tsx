import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, FileText, Sparkles } from "lucide-react";

interface GlobalDropOverlayProps {
  isVisible: boolean;
  hasActiveSubmission: boolean;
}

export const GlobalDropOverlay: React.FC<GlobalDropOverlayProps> = ({
  isVisible,
  hasActiveSubmission,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-8 sm:p-14 bg-[#090d16]/75 backdrop-blur-md"
          role="region"
          aria-label="Drag and Drop Submission Target"
        >
          {/* Outer glowing target card */}
          <div className="relative w-full max-w-2xl rounded-3xl border-2 border-dashed border-sky-400/80 bg-[#0e1626]/90 p-10 sm:p-12 text-center shadow-2xl shadow-sky-950/60 overflow-hidden flex flex-col items-center">
            {/* Subtle background ambient radial gradient */}
            <div className="absolute inset-0 bg-radial from-sky-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Glowing forensic pulse ring */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping opacity-75" />
              <div className="absolute -inset-2 rounded-full border border-dashed border-sky-400/60 animate-[spin_10s_linear_infinite]" />
              <div className="relative w-18 h-18 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <UploadCloud className="w-9 h-9 text-white animate-bounce" />
              </div>
            </div>

            {/* Main Action Callout */}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              {hasActiveSubmission
                ? "Drop new student manuscript to swap"
                : "Drop student manuscript here to analyze"}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-lg mb-6 leading-relaxed">
              {hasActiveSubmission
                ? "Instantly swaps active paper and resets workbench with complete forensic adjudication pipeline."
                : "Instant client-side forensic extraction with complete privacy and zero data leakage."}
            </p>

            {/* Badges of supported academic container formats */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-mono text-sky-200">
              {[
                "PDF (.pdf)",
                "Word (.docx)",
                "LaTeX (.tex)",
                "Plain Text (.txt, .md)",
                "Student Artwork / Poster",
              ].map((fmt) => (
                <span
                  key={fmt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-sky-500/30 shadow-inner backdrop-blur-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  {fmt}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-sky-400/80 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline Ready · Conformal P-Values · Token Perplexity Analysis</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
