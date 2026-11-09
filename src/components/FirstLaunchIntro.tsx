import React, { useState, useEffect } from "react";
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
import { playInstitutionalChime } from "../utils/audioChime";

interface FirstLaunchIntroProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const FirstLaunchIntro: React.FC<FirstLaunchIntroProps> = ({
  isOpen,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // 4.5 seconds per feature before automatically transitioning
  const STEP_DURATION_MS = 4500;

  const handleTriggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete();
      setIsClosing(false);
    }, 550);
  };

  // Play chime upon opening
  useEffect(() => {
    if (!isOpen) return;
    const chimeTimer = setTimeout(() => {
      playInstitutionalChime();
    }, 300);
    return () => clearTimeout(chimeTimer);
  }, [isOpen]);

  // Automatic advance timer: Steps through 0 -> 1 -> dismiss
  useEffect(() => {
    if (!isOpen || isClosing) return;

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
          handleTriggerClose();
          return prev;
        }
      });
    }, STEP_DURATION_MS);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(advanceTimer);
    };
  }, [isOpen, activeStep, isClosing]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleTriggerClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setActiveStep((prev) => (prev < 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Streamlined 2-Card Showcase
  const steps = [
    {
      badge: "Private & Local",
      title: "Drop any paper or exam to inspect",
      description:
        "Drag PDF essays, Word documents, or student artwork. Everything runs right here on your computer—private, instant, and never uploaded to any cloud server.",
      illustration: (
        <div className="relative w-full h-48 sm:h-56 rounded-3xl bg-white/40 border border-white/60 p-6 flex items-center justify-around overflow-hidden shadow-inner">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-white/85 border border-[#DCD4C6]/80 text-[#1C1917] shadow-sm hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0F3B5F]/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#0F3B5F]" />
            </div>
            <span className="text-xs font-semibold text-[#44403C]">PDF & Papers</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-white/85 border border-[#DCD4C6]/80 text-[#1C1917] shadow-sm hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B45309]/10 flex items-center justify-center">
              <FileCode className="w-7 h-7 text-[#B45309]" />
            </div>
            <span className="text-xs font-semibold text-[#44403C]">Word Documents</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-white/85 border border-[#DCD4C6]/80 text-[#1C1917] shadow-sm hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-[#047857]/10 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-[#047857]" />
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
        <div className="relative w-full h-48 sm:h-56 rounded-3xl bg-white/40 border border-white/60 p-6 flex items-center justify-center gap-6 overflow-hidden shadow-inner">
          <div className="flex-1 max-w-[280px] flex flex-col items-center justify-center p-5 rounded-2xl bg-white/85 border border-[#DCD4C6]/80 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-[#0F3B5F]/10 flex items-center justify-center mb-2">
              <Scale className="w-7 h-7 text-[#0F3B5F]" />
            </div>
            <span className="text-[11px] font-mono text-[#645D56] uppercase tracking-wider font-semibold">Institutional Standard</span>
            <span className="text-lg font-bold text-[#1C1917] mt-1">Tiered Evidence</span>
          </div>

          <div className="flex-1 max-w-[280px] flex flex-col items-center justify-center p-5 rounded-2xl bg-white/85 border border-[#DCD4C6]/80 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-[#047857]/10 flex items-center justify-center mb-2">
              <ShieldCheck className="w-7 h-7 text-[#047857]" />
            </div>
            <span className="text-[11px] font-mono text-[#645D56] uppercase tracking-wider font-semibold">Student Protection</span>
            <span className="text-lg font-bold text-[#047857] mt-1">False-Positive Safe</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {/* Full-Screen Apple Liquid-Glass Stage with Peripheral Refraction */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Veritas"
        initial={{ opacity: 0 }}
        animate={
          isClosing
            ? { opacity: 0, filter: "blur(16px)" }
            : { opacity: 1, filter: "blur(0px)" }
        }
        exit={{ opacity: 0, filter: "blur(16px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 md:p-12"
        style={{
          // Peripheral liquid-glass ambient wash: lets the underlying studio peek through with subtle refraction
          backgroundColor: "rgba(244, 241, 234, 0.45)",
          backdropFilter: "blur(14px) saturate(160%) contrast(102%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%) contrast(102%)",
        }}
      >
        {/* The Near-Full-Screen Liquid Glass Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={
            isClosing
              ? { opacity: 0, scale: 1.02, y: -12, filter: "blur(8px)" }
              : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
          }
          exit={{ opacity: 0, scale: 1.02, y: -12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl h-[88vh] max-h-[820px] rounded-[36px] p-8 sm:p-12 flex flex-col justify-between overflow-hidden relative"
          style={{
            // Apple Liquid Glass with refraction: specular rim highlight, internal caustics, and prism borders
            backgroundColor: "rgba(255, 255, 255, 0.78)",
            backdropFilter: "blur(40px) saturate(200%) contrast(108%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%) contrast(108%)",
            boxShadow:
              "0 32px 80px -16px rgba(15, 23, 42, 0.16), 0 0 0 1.5px rgba(255, 255, 255, 0.9) inset, 0 2px 10px 0 rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Specular internal rim lighting with chromatic refraction flare */}
          <div className="absolute inset-0 rounded-[36px] pointer-events-none border border-white/90 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95)]" />
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/25 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-tl from-sky-200/25 to-transparent blur-3xl pointer-events-none" />

          {/* Top Bar with Veritas Brand Emblem & Quick Dismiss */}
          <div className="flex items-center justify-between relative z-10 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#0F3B5F] text-amber-300 flex items-center justify-center shadow-md">
                <Fingerprint className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-[#1C1917] text-lg sm:text-xl leading-none">
                  Veritas
                </span>
                <span className="text-xs text-[#645D56] font-medium mt-1">
                  Institutional Academic Integrity Workbench
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#645D56] hover:text-[#1C1917] hover:bg-black/5 transition-all cursor-pointer border border-[#DCD4C6]/60 bg-white/60"
              title="Close tour (Esc)"
            >
              <span>Skip Tour</span>
              <span className="px-1.5 py-0.5 rounded bg-black/5 text-[10px] text-[#44403C]">Esc</span>
            </button>
          </div>

          {/* Central Feature Showcase Stage */}
          <div className="my-auto py-4 flex flex-col gap-6 relative z-10 max-w-3xl mx-auto w-full">
            {/* Dynamic Illustration Stage with Downward Refraction Animation */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                >
                  {steps[activeStep].illustration}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Copy Description with Downward Motion */}
            <div className="relative overflow-hidden min-h-[110px] flex flex-col justify-start text-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`copy-${activeStep}`}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-2 max-w-xl"
                >
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0F3B5F]/10 text-[#0F3B5F] border border-[#0F3B5F]/15">
                      {steps[activeStep].badge}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917]">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#44403C] leading-relaxed">
                    {steps[activeStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Bar: Timed Progress Indicators & Action Button */}
          <div className="flex items-center justify-between pt-6 border-t border-[#1C1917]/8 relative z-10 shrink-0">
            {/* Segmented Timeline Bars */}
            <div className="flex items-center gap-2.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Jump to step ${idx + 1}`}
                  onClick={() => setActiveStep(idx)}
                  className="relative h-2 w-14 rounded-full bg-[#1C1917]/10 overflow-hidden cursor-pointer"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1C1917] text-white hover:bg-[#292524] shadow-md transition-all cursor-pointer"
              >
                <span>Next Feature</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0F3B5F] text-white hover:brightness-110 shadow-lg shadow-[#0F3B5F]/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Enter Veritas Studio</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
