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

const SAMPLE_ESSAY = `Recent developments in artificial intelligence have precipitated profound paradigm shifts across contemporary higher education. Large language models exhibit remarkable capabilities in synthesizing multi-disciplinary domain knowledge, structuring expository essays, and generating syntactically cohesive academic discourse. Consequently, post-secondary institutions are confronted with substantial methodological dilemmas regarding authentic assessment protocols, scholarly attribution, and academic integrity. Furthermore, it is essential to recognize that heuristic evaluation metrics must be calibrated against empirical human academic controls to prevent the disproportionate penalization of non-native English writers or technical derivations containing symbolic mathematical notation.`;

export default function App() {
  const [activeSubmission, setActiveSubmission] =
    useState<ForensicSubmissionCase | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(true);
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
      <TopNav
        hasActiveSubmission={activeSubmission !== null}
        isPreviewActive={isPreviewActive}
        detectedSpanCount={activeSubmission?.report.highlighted_spans.length ?? 0}
        onTogglePreview={handleTogglePreview}
        onTriggerUpload={handleTriggerUpload}
        onReset={handleReset}
        onOpenDossier={() => setIsDossierOpen(true)}
      />

      {/* Unified 16:9 Operable Studio Workbench */}
      <main className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
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

      {/* Institutional Hearing Dossier Modal */}
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
