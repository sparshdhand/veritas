/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { TopNav } from "./components/TopNav";
import { WorkspaceView } from "./components/WorkspaceView";
import { HearingDossierModal } from "./components/HearingDossierModal";
import { ForensicSubmissionCase } from "./types/forensics";
import {
  enrichSubmissionWithLiveNeuralClassifier,
  evaluateFileSubmission,
  evaluateTextSubmission,
} from "./utils/submissionEvaluator";

export default function App() {
  const [activeSubmission, setActiveSubmission] =
    useState<ForensicSubmissionCase | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const evaluated = await evaluateFileSubmission(file);
      setActiveSubmission(evaluated);
      setIsPreviewActive(true);
      const enriched = await enrichSubmissionWithLiveNeuralClassifier(evaluated);
      setActiveSubmission(enriched);
    } catch (err) {
      setErrorMessage(
        `Could not read file: ${(err as Error).message || "Unsupported format"}`
      );
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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
    const result = evaluateTextSubmission(rawText);
    setActiveSubmission(result);
    setIsPreviewActive(true);
    void enrichSubmissionWithLiveNeuralClassifier(result).then((enriched) => {
      setActiveSubmission(enriched);
    });
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
    <div className="h-screen w-screen bg-[#F4F6FA] text-slate-900 flex flex-col relative overflow-hidden select-none sm:select-auto">
      {/* Ambient Optical Refraction Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-32 left-1/4 w-[560px] h-[560px] rounded-full bg-sky-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-36 right-1/5 w-[560px] h-[560px] rounded-full bg-indigo-200/25 blur-3xl"
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload file for AI detection"
      />

      {/* Full-Viewport Seamless Immersive Workbench */}
      <main className="relative z-10 flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden bg-white/60 backdrop-blur-2xl">
        {/* Stationary Full-Width Top Command Header */}
        <TopNav
          hasActiveSubmission={activeSubmission !== null}
          isPreviewActive={isPreviewActive}
          detectedSpanCount={
            activeSubmission?.report.highlighted_spans.length ?? 0
          }
          onTogglePreview={handleTogglePreview}
          onTriggerUpload={handleTriggerUpload}
          onReset={handleReset}
        />

        {/* Seamless Edge-to-Edge Split Workspace */}
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
        />
      </main>

      {activeSubmission && (
        <HearingDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          forensicCase={activeSubmission}
        />
      )}
    </div>
  );
}
