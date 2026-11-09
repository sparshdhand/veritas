/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { TopNav } from "./components/TopNav";
import { WorkspaceView } from "./components/WorkspaceView";
import { HearingDossierModal } from "./components/HearingDossierModal";
import { GlobalDropOverlay } from "./components/GlobalDropOverlay";
import { FirstLaunchIntro } from "./components/FirstLaunchIntro";
import { ForensicSubmissionCase } from "./types/forensics";
import {
  enrichSubmissionWithLiveNeuralClassifier,
  evaluateFileSubmission,
  evaluateTextSubmission,
} from "./utils/submissionEvaluator";
import { isDesktopApp, revealMainWindow } from "./utils/tauriBridge";

const SAMPLE_ESSAY = `Recent developments in artificial intelligence have precipitated profound paradigm shifts across contemporary higher education. Large language models exhibit remarkable capabilities in synthesizing multi-disciplinary domain knowledge, structuring expository essays, and generating syntactically cohesive academic discourse. Consequently, post-secondary institutions are confronted with substantial methodological dilemmas regarding authentic assessment protocols, scholarly attribution, and academic integrity. Furthermore, it is essential to recognize that heuristic evaluation metrics must be calibrated against empirical human academic controls to prevent the disproportionate penalization of non-native English writers or technical derivations containing symbolic mathematical notation.`;

export default function App() {
  const [activeSubmission, setActiveSubmission] =
    useState<ForensicSubmissionCase | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // In native desktop app, the intro is handled by the dedicated native 'intro' window!
    if (typeof window === "undefined" || isDesktopApp()) return false;
    return localStorage.getItem("veritas_intro_seen") !== "true";
  });

  const handleCompleteIntro = () => {
    setShowIntro(false);
    try {
      localStorage.setItem("veritas_intro_seen", "true");
    } catch {
      // ignore
    }
    // In native Tauri desktop, reveal and bring the main workbench window forward
    void revealMainWindow();
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef<number>(0);

  // In browser mode (non-desktop), reveal immediately if intro not showing
  useEffect(() => {
    if (!isDesktopApp() && !showIntro) {
      void revealMainWindow();
    }
  }, [showIntro]);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProcessFile = useCallback(async (file: File) => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const evaluated = await evaluateFileSubmission(file);
      setActiveSubmission(evaluated);
      setIsPreviewActive(true);
      // Immediately clear the blocking analyze spinner so the workbench renders without delay
      setIsAnalyzing(false);

      // Run transformer neural enrichment in the background without blocking the UI
      void enrichSubmissionWithLiveNeuralClassifier(evaluated)
        .then((enriched) => {
          setActiveSubmission(enriched);
        })
        .catch((err) => {
          console.warn("Background neural classifier enrichment skipped:", err);
        });
    } catch (err) {
      setErrorMessage(
        `Could not read file: ${(err as Error).message || "Unsupported format"}`
      );
      setIsAnalyzing(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, []);

  // Global window drag & drop event handling to allow swapping active documents anywhere
  useEffect(() => {
    const isEventWithFiles = (e: DragEvent): boolean => {
      if (!e.dataTransfer) return false;
      const types = Array.from(e.dataTransfer.types || []);
      if (types.length === 0) return true; // Some browsers do not populate types until drop
      return types.some((t) => {
        const lower = t.toLowerCase();
        return lower === "files" || lower === "application/x-moz-file" || lower.includes("file");
      });
    };

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isEventWithFiles(e)) {
        dragCounterRef.current += 1;
        setIsDragging(true);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
      if (!isDragging && isEventWithFiles(e)) {
        setIsDragging(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const file = e.dataTransfer?.files?.[0];
      if (file) {
        await handleProcessFile(file);
      }
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [handleProcessFile, isDragging]);

  const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleEvaluateText = (rawText: string) => {
    if (!rawText.trim()) {
      setErrorMessage("Please enter or paste text to evaluate.");
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const result = evaluateTextSubmission(rawText);
      setActiveSubmission(result);
      setIsPreviewActive(true);
      void enrichSubmissionWithLiveNeuralClassifier(result).then((enriched) => {
        setActiveSubmission(enriched);
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    handleEvaluateText(SAMPLE_ESSAY);
  };

  const handleTogglePreview = () => {
    if (!activeSubmission) {
      handleTriggerUpload();
      return;
    }
    setIsPreviewActive((prev) => !prev);
  };

  const handleReset = () => {
    setActiveSubmission(null);
    setIsPreviewActive(false);
    setErrorMessage(null);
  };

  return (
    <div className="h-screen w-screen bg-[#F4F1EA] text-[#1C1917] flex flex-col relative overflow-hidden selection:bg-[#0F3B5F]/15 selection:text-[#0F3B5F]">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload file for forensic analysis"
      />

      {/* Unified Persistent 16:9 Studio Header */}
      <div
        className={`transition-all duration-700 ease-out ${
          showIntro
            ? "filter blur-[12px] brightness-90 saturate-150 pointer-events-none select-none"
            : "filter blur-0 brightness-100 saturate-100"
        }`}
      >
        <TopNav
          hasActiveSubmission={activeSubmission !== null}
          isPreviewActive={isPreviewActive}
          detectedSpanCount={activeSubmission?.report.highlighted_spans.length ?? 0}
          onTogglePreview={handleTogglePreview}
          onTriggerUpload={handleTriggerUpload}
          onReset={handleReset}
          onOpenDossier={() => setIsDossierOpen(true)}
          onReplayIntro={handleReplayIntro}
        />
      </div>

      {/* Unified 16:9 Operable Studio Workbench */}
      <main
        className={`flex-1 w-full min-h-0 flex flex-col overflow-hidden transition-all duration-700 ease-out ${
          showIntro
            ? "filter blur-[18px] brightness-90 saturate-150 scale-[0.98] pointer-events-none select-none"
            : "filter blur-0 brightness-100 saturate-100 scale-100"
        }`}
      >
        <WorkspaceView
          submission={activeSubmission}
          isPreviewActive={isPreviewActive}
          isDragging={isDragging}
          isAnalyzing={isAnalyzing}
          errorMessage={errorMessage}
          onTogglePreview={() => setIsPreviewActive((prev) => !prev)}
          onTriggerUpload={handleTriggerUpload}
          onDropFile={handleDropFile}
          onDragStateChange={setIsDragging}
          onEvaluateText={handleEvaluateText}
          onOpenDossier={() => setIsDossierOpen(true)}
          onLoadSampleSubmission={handleLoadSample}
        />
      </main>

      {/* Dia-Style First Launch Cinematic Intro & Showcase */}
      <FirstLaunchIntro
        isOpen={showIntro}
        onComplete={handleCompleteIntro}
      />

      {/* Institutional Hearing Dossier Modal */}
      {activeSubmission && (
        <HearingDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          forensicCase={activeSubmission}
        />
      )}

      {/* Global Drag-and-Drop Replacement Overlay */}
      <GlobalDropOverlay
        isVisible={isDragging}
        hasActiveSubmission={activeSubmission !== null}
      />
    </div>
  );
}
