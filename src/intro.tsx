import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "motion/react";
import {
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileText,
  FileCode,
  Image as ImageIcon,
  Scale,
  X,
} from "lucide-react";
import { playInstitutionalChime } from "./utils/audioChime";
import { revealMainWindow } from "./utils/tauriBridge";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./index.css";

function IntroApp() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const STEP_DURATION_MS = 4500;

  const handleFinish = async () => {
    if (isClosing) return;
    setIsClosing(true);

    try {
      // 1. Reveal main workbench window natively
      await revealMainWindow();

      // 2. Close this transparent intro window
      const appWindow = getCurrentWebviewWindow();
      if (appWindow) {
        setTimeout(async () => {
          await appWindow.close();
        }, 300);
      }
    } catch (err) {
      console.warn("Failed to swap windows:", err);
    }
  };

  useEffect(() => {
    playInstitutionalChime();
  }, []);

  // Timed progression
  useEffect(() => {
    if (isClosing) return;

    setProgress(0);
    const intervalMs = 40;
    const increment = (intervalMs / STEP_DURATION_MS) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + increment;
      });
    }, intervalMs);

    const advanceTimer = setTimeout(() => {
      setActiveStep((prev) => {
        if (prev < 1) {
          return prev + 1;
        } else {
          void handleFinish();
          return prev;
        }
      });
    }, STEP_DURATION_MS);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(advanceTimer);
    };
  }, [activeStep, isClosing]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void handleFinish();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setActiveStep((prev) => (prev < 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const steps = [
    {
      badge: "Private & Local",
      title: "Drop any paper or exam to inspect",
      description:
        "Drag PDF essays, Word documents, or student artwork. Everything runs right here on your computer—private, instant, and never uploaded to any cloud server.",
      illustration: (
        <div className="relative w-full h-44 rounded-3xl bg-white/50 border border-white/70 p-5 flex items-center justify-around overflow-hidden shadow-inner">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white/90 border border-[#DCD4C6]/80 text-[#1C1917] shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F3B5F]/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#0F3B5F]" />
            </div>
            <span className="text-xs font-semibold text-[#44403C]">PDF & Papers</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white/90 border border-[#DCD4C6]/80 text-[#1C1917] shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-[#B45309]/10 flex items-center justify-center">
              <FileCode className="w-6 h-6 text-[#B45309]" />
            </div>
            <span className="text-xs font-semibold text-[#44403C]">Word Documents</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white/90 border border-[#DCD4C6]/80 text-[#1C1917] shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-[#047857]/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#047857]" />
            </div>
            <span className="text-xs font-semibold text-[#44403C]">Images & Posters</span>
          </motion.div>
        </div>
      ),
    },
    {
      badge: "Defensible Adjudication",
      title: "Fair reports you can trust",
      description:
        "Fair, evidence-based results that protect honest human writing, mathematical equations, and non-native English students—ready for academic integrity hearings.",
      illustration: (
        <div className="relative w-full h-44 rounded-3xl bg-white/50 border border-white/70 p-5 flex items-center justify-center gap-6 overflow-hidden shadow-inner">
          <div className="flex-1 max-w-[240px] flex flex-col items-center justify-center p-4 rounded-2xl bg-white/90 border border-[#DCD4C6]/80 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-[#0F3B5F]/10 flex items-center justify-center mb-1.5">
              <Scale className="w-6 h-6 text-[#0F3B5F]" />
            </div>
            <span className="text-[10px] font-mono text-[#645D56] uppercase tracking-wider font-semibold">Institutional Standard</span>
            <span className="text-base font-bold text-[#1C1917] mt-0.5">Tiered Evidence</span>
          </div>

          <div className="flex-1 max-w-[240px] flex flex-col items-center justify-center p-4 rounded-2xl bg-white/90 border border-[#DCD4C6]/80 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-[#047857]/10 flex items-center justify-center mb-1.5">
              <ShieldCheck className="w-6 h-6 text-[#047857]" />
            </div>
            <span className="text-[10px] font-mono text-[#645D56] uppercase tracking-wider font-semibold">Student Protection</span>
            <span className="text-base font-bold text-[#047857] mt-0.5">False-Positive Safe</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center p-6 bg-black/45 backdrop-blur-[2px] transition-colors duration-500 select-none overflow-hidden">
      {/* Floating Borderless Transparent Card (Floating over dimmed HazeOver desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={
          isClosing
            ? { opacity: 0, scale: 1.04, filter: "blur(12px)" }
            : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-[32px] p-8 flex flex-col justify-between overflow-hidden relative shadow-2xl"
        style={{
          backgroundColor: "#FAF8F4",
          boxShadow:
            "0 30px 90px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px #DCD4C6",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between relative z-10 shrink-0 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F3B5F] text-amber-300 flex items-center justify-center shadow-md">
              <Fingerprint className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-[#1C1917] text-lg leading-none">
                Veritas
              </span>
              <span className="text-[11px] text-[#645D56] font-medium mt-1">
                Academic Integrity Workbench
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#645D56] hover:text-[#1C1917] hover:bg-black/5 transition-all cursor-pointer border border-[#DCD4C6]/80 bg-white/70"
          >
            <span>Skip Tour</span>
            <span className="px-1.5 py-0.5 rounded bg-black/5 text-[10px] text-[#44403C]">Esc</span>
          </button>
        </div>

        {/* Illustration Stage */}
        <div className="relative overflow-hidden mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              {steps[activeStep].illustration}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Copy Stage */}
        <div className="relative overflow-hidden min-h-[96px] flex flex-col justify-start mb-6 text-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${activeStep}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="space-y-1.5 max-w-lg"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0F3B5F]/10 text-[#0F3B5F] border border-[#0F3B5F]/15">
                  {steps[activeStep].badge}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
                {steps[activeStep].title}
              </h3>
              <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
                {steps[activeStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1C1917]/8 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Jump to step ${idx + 1}`}
                onClick={() => setActiveStep(idx)}
                className="relative h-1.5 w-10 rounded-full bg-[#1C1917]/10 overflow-hidden cursor-pointer"
              >
                <div
                  className={`h-full transition-all duration-75 ${
                    activeStep === idx
                      ? "bg-[#0F3B5F]"
                      : idx < activeStep
                      ? "bg-[#0F3B5F]/60 w-full"
                      : "w-0"
                  }`}
                  style={{
                    width: activeStep === idx ? `${progress}%` : undefined,
                  }}
                />
              </button>
            ))}
          </div>

          {activeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => prev + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1917] text-white hover:bg-[#292524] shadow-md transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#0F3B5F] text-white hover:brightness-110 shadow-md shadow-[#0F3B5F]/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Studio</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const rootEl = document.getElementById("intro-root");
if (rootEl) {
  createRoot(rootEl).render(<IntroApp />);
}
