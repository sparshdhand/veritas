import {
  ForensicFlag,
  ForensicSubmissionCase,
  TextHighlightSpan,
  TierLabel,
  TierLevel,
} from "../types/forensics";
import {
  computeGLTRDistribution,
  computeLogOddsFusion,
  computeSlidingWindowGaussianCurve,
  computeStylometricMetrics,
  computeSyntacticFeatureClassifierScore,
  detectAcademicPeerReviewProtection,
  detectESLSyntacticPatterns,
  detectLatexAndMathProtection,
  detectTextbookAndFormalReferenceProtection,
  estimateSentencePerplexity,
  isMathOrDiagramSegment,
  sanitizeAndTrapAdversarial,
} from "./forensicEngine";
import {
  analyzeUploadedImageForensics,
  parseDocxContainer,
  parsePdfContainer,
} from "./containerForensics";
import { isDesktopApp } from "./tauriBridge";
import {
  getLocalOfflineNeuralClassifier,
  extractAiProbability,
} from "./localNeuralClassifier";

function splitIntoLogicalPassages(text: string): string[] {
  // First isolate standalone display math ($$...$$, \[...\]) and LaTeX math/diagram environments
  // so they are evaluated as separate segments and never merged into prose paragraphs.
  const displayMathRegex =
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{(?:equation|align|gather|multline|tikzpicture|eqnarray|displaymath|math)\*?\}[\s\S]*?\\end\{(?:equation|align|gather|multline|tikzpicture|eqnarray|displaymath|math)\*?\})/g;

  const blocks = text
    .split(displayMathRegex)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const passages: string[] = [];
  for (const block of blocks) {
    if (displayMathRegex.test(block)) {
      displayMathRegex.lastIndex = 0;
      passages.push(block);
      continue;
    }
    displayMathRegex.lastIndex = 0;

    const rawParas = block
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    for (const para of rawParas) {
      const words = para.split(/\s+/).filter(Boolean);
      if (words.length <= 110) {
        passages.push(para);
      } else {
        // Split long single-block PDF pages into 2-3 sentence passages for precise highlighting
        const sentences = para
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
        let buffer = "";
        for (const s of sentences) {
          const next = buffer ? `${buffer} ${s}` : s;
          if (next.split(/\s+/).length >= 45) {
            passages.push(next);
            buffer = "";
          } else {
            buffer = next;
          }
        }
        if (buffer) passages.push(buffer);
      }
    }
  }
  return passages;
}

interface EvaluatedPassage {
  startChar: number;
  endChar: number;
  text: string;
  wordCount: number;
  intrinsicAiProb: number;
  sentenceBurstiness: number;
  binocularsRatio: number;
  gltrTop10: number;
  isMathOrDiagram: boolean;
}

/**
 * Computes intrinsic AI probability for each logical passage (excluding LaTeX equations,
 * mathematical symbol blocks, data tables, and TikZ diagram labels) and returns both the passage
 * evaluations and the word-weighted prose neural signal.
 */
function analyzePassages(
  sanitizedText: string,
  evasionTriggered: boolean,
  docBurstiness = -0.35,
  docGltrTop10 = 0.78
): {
  passages: EvaluatedPassage[];
  weightedNeuralSignal: number;
  prosePassageWordCount: number;
} {
  const rawPassages = splitIntoLogicalPassages(sanitizedText);
  const passages: EvaluatedPassage[] = [];
  let searchCursor = 0;
  let weightedSum = 0;
  let totalProseWords = 0;

  for (const para of rawPassages) {
    const trimmed = para.trim();
    const startIdx = sanitizedText.indexOf(trimmed, searchCursor);
    const actualStart = startIdx !== -1 ? startIdx : searchCursor;
    const actualEnd = actualStart + trimmed.length;
    searchCursor = actualEnd;

    const words = trimmed.split(/\s+/).filter(Boolean);
    const numericOrSymbolTokens = words.filter((w) =>
      /^[0-9$€£¥%≈≤≥±×÷+\-.,:;/()[\]]+$|^\d+(ms|mb|gb|kb|px|s|m|hz)$/i.test(w)
    );
    const isTableOrDataBlock =
      words.length > 0 && numericOrSymbolTokens.length / words.length >= 0.24;
    const mathOrDiagram = isMathOrDiagramSegment(trimmed) || isTableOrDataBlock;

    // Mathematical equations, LaTeX macros, data tables, and TikZ diagram labels are NOT prose
    // and must never be scored or highlighted as AI-generated text.
    if (mathOrDiagram) {
      passages.push({
        startChar: actualStart,
        endChar: actualEnd,
        text: trimmed,
        wordCount: words.length,
        intrinsicAiProb: 0.08,
        sentenceBurstiness: 0.35,
        binocularsRatio: 1.05,
        gltrTop10: 0.25,
        isMathOrDiagram: true,
      });
      continue;
    }

    if (words.length < 8) continue;

    const pMetrics = computeStylometricMetrics(trimmed);
    const pGltr = computeGLTRDistribution(trimmed);
    const pPpl = estimateSentencePerplexity(trimmed);
    const syntacticClassifier = computeSyntacticFeatureClassifierScore(trimmed);

    // 1. Independent Syntactic & Discourse Structure Classifier (Clause CV, Yule's K, POS transition entropy)
    const syntacticSignal = syntacticClassifier.classifierScore;

    // 2. Contextual N-gram Surprisal / Perplexity Signal
    const pplSignal = Math.max(
      0.06,
      Math.min(0.96, 1 / (1 + Math.exp((pPpl - 27.5) / 4.0)))
    );

    // 3. Sentence-level Burstiness Dispersion
    const effectiveBurst =
      pMetrics.sentenceCount >= 3
        ? pMetrics.sentenceBurstiness * 0.55 + docBurstiness * 0.45
        : docBurstiness;
    const effectiveGltr = pGltr.top10 * 0.65 + docGltrTop10 * 0.35;

    const intrinsicAiProb = evasionTriggered
      ? 0.96
      : Number(
          (0.58 * syntacticSignal + 0.42 * pplSignal).toFixed(3)
        );

    passages.push({
      startChar: actualStart,
      endChar: actualEnd,
      text: trimmed,
      wordCount: words.length,
      intrinsicAiProb,
      sentenceBurstiness: Number(effectiveBurst.toFixed(3)),
      binocularsRatio: pMetrics.binocularsRatio,
      gltrTop10: Number(effectiveGltr.toFixed(3)),
      isMathOrDiagram: false,
    });

    weightedSum += intrinsicAiProb * words.length;
    totalProseWords += words.length;
  }

  const weightedNeuralSignal =
    totalProseWords > 0
      ? Number((weightedSum / totalProseWords).toFixed(3))
      : 0.12;

  return {
    passages,
    weightedNeuralSignal,
    prosePassageWordCount: totalProseWords,
  };
}

/**
 * Builds highlighted AI spans ONLY for non-math prose passages that genuinely exceed
 * the synthetic confidence threshold (>= 0.55) and are not suppressed by a veto.
 */
function buildSynchronizedSpans(
  passages: EvaluatedPassage[],
  finalDocumentScore: number,
  eslProtected: boolean,
  minimumLengthVeto: boolean,
  latexDominantVeto: boolean,
  evasionTriggered: boolean,
  dominantRsid?: string
): TextHighlightSpan[] {
  if ((minimumLengthVeto || latexDominantVeto) && !evasionTriggered) {
    return [];
  }

  const spans: TextHighlightSpan[] = [];

  passages.forEach((p, idx) => {
    // Never highlight LaTeX formulas, mathematical derivations, or diagram labels
    if (p.isMathOrDiagram) return;

    const spanConf = Number(
      (p.intrinsicAiProb * 0.7 + finalDocumentScore * 0.3).toFixed(3)
    );

    if ((spanConf >= 0.55 && p.intrinsicAiProb >= 0.52) || evasionTriggered) {
      spans.push({
        id: `span_${idx + 1}`,
        start_char: p.startChar,
        end_char: p.endChar,
        text_segment: p.text,
        severity_tier: spanConf >= 0.82 ? 3 : spanConf >= 0.65 ? 2 : 1,
        confidence: spanConf,
        reason_code: evasionTriggered
          ? "HOMOGLYPH_EVASION"
          : dominantRsid
          ? "MONOLITHIC_INSERTION"
          : "LOW_BURSTINESS_UNIFORM_PPL",
        forensic_metrics: {
          sentence_burstiness: p.sentenceBurstiness,
          binoculars_score: p.binocularsRatio,
          gltr_top10_percentage: p.gltrTop10,
          associated_rsid: dominantRsid,
          stripped_adversarial_chars: 0,
        },
        esl_protective_override_applied: eslProtected,
      });
    }
  });

  return spans;
}

/**
 * Synchronizes the final aggregate score with the log-odds fusion engine and word-weighted
 * neural span coverage while strictly enforcing the Hard-Veto & Override Rules:
 * - LaTeX / Math Guard: Caps at 0.12 (Tier 0).
 * - Academic Research Guard: Caps at 0.32 (Tier 0).
 * - ESL Demographic Protection: Caps at 0.58 (Tier 1).
 * - Metadata-Absent Downgrade: Caps plain text / PDFs lacking container session logs at Tier 2 (0.91 max).
 */
function synchronizeAggregateScore(
  fusionScore: number,
  weightedPassageSignal: number,
  latexDominantVeto: boolean,
  activeVetoes: {
    minimumLengthVeto: boolean;
    eslProtectionVeto: boolean;
    academicProtectionVeto?: boolean;
    metadataAbsentDowngrade: boolean;
  }
): {
  calibratedScore: number;
  calibratedTier: TierLevel;
  calibratedLabel: TierLabel;
} {
  let score = fusionScore;

  if (latexDominantVeto) {
    score = Math.min(score, 0.12);
  } else if (activeVetoes.academicProtectionVeto) {
    score = Math.min(score, 0.32);
  } else if (
    !activeVetoes.minimumLengthVeto &&
    !activeVetoes.eslProtectionVeto
  ) {
    score = fusionScore * 0.7 + weightedPassageSignal * 0.3;
    if (activeVetoes.metadataAbsentDowngrade) {
      // Under the Metadata-Absent Downgrade rule, pure text/PDF without container tracking
      // cannot exceed Tier 2 (0.91 cap). No artificial lower clamp is applied.
      score = Math.min(0.91, score);
    }
  }

  const calibratedScore = Number(
    Math.max(0.02, Math.min(0.99, score)).toFixed(3)
  );
  let calibratedTier: TierLevel = 0;
  let calibratedLabel: TierLabel = "Human-Consistent";

  if (calibratedScore < 0.35) {
    calibratedTier = 0;
    calibratedLabel = "Human-Consistent";
  } else if (calibratedScore < 0.70) {
    calibratedTier = 1;
    calibratedLabel = "Inconclusive";
  } else if (calibratedScore < 0.95) {
    calibratedTier = 2;
    calibratedLabel = "Likely Synthetic";
  } else {
    calibratedTier = 3;
    calibratedLabel = "Proven Synthetic";
  }

  return { calibratedScore, calibratedTier, calibratedLabel };
}

/**
 * Evaluates raw pasted text through the multi-signal forensic pipeline.
 */
export function evaluateTextSubmission(
  rawText: string,
  title = "Pasted Text Submission"
): ForensicSubmissionCase {
  const sanitization = sanitizeAndTrapAdversarial(rawText);
  const stylometrics = computeStylometricMetrics(sanitization.sanitizedText);
  const gltr = computeGLTRDistribution(sanitization.sanitizedText);
  const eslCheck = detectESLSyntacticPatterns(
    sanitization.sanitizedText,
    stylometrics.mattr
  );
  const formalRefCheck = detectTextbookAndFormalReferenceProtection(
    sanitization.sanitizedText
  );
  const academicCheck = detectAcademicPeerReviewProtection(
    sanitization.sanitizedText
  );
  const latexCheck = detectLatexAndMathProtection(sanitization.sanitizedText);

  const { passages, weightedNeuralSignal, prosePassageWordCount } =
    analyzePassages(
      sanitization.sanitizedText,
      sanitization.evasionFlagTriggered,
      stylometrics.sentenceBurstiness,
      gltr.top10
    );

  // Formal textbook/curriculum protection (no artificial word-count ceiling)
  const formalTextbookOrLegalVeto =
    formalRefCheck.formalReferenceProtected &&
    !sanitization.evasionFlagTriggered;

  const academicResearchVeto =
    academicCheck.academicProtected &&
    !sanitization.evasionFlagTriggered;

  const latexDominantVeto =
    (latexCheck.latexMathProtected && prosePassageWordCount === 0) ||
    formalTextbookOrLegalVeto;

  const burstSignal = Math.max(
    0.06,
    Math.min(
      0.96,
      1 / (1 + Math.exp((stylometrics.sentenceBurstiness + 0.08) * 4.6))
    )
  );
  const binoSignal = Math.max(
    0.06,
    Math.min(
      0.96,
      1 / (1 + Math.exp((stylometrics.binocularsRatio - 0.78) * 6.0))
    )
  );
  const gltrSignal = Math.max(
    0.06,
    Math.min(0.95, (gltr.top10 - 0.46) * 2.1)
  );

  const fusion = computeLogOddsFusion(
    {
      c2paScore: 0.5,
      metaScore: sanitization.evasionFlagTriggered ? 0.95 : 0.5,
      neuralScore: weightedNeuralSignal,
      binoScore: binoSignal,
      burstScore: burstSignal,
      gltrScore: gltrSignal,
    },
    {
      wordCount: stylometrics.wordCount,
      eslPatternsDetected: eslCheck.eslProtected,
      academicResearchProtected: academicResearchVeto,
      hasContainerSessionTracking: false,
      hasMetadataAnomaly: sanitization.evasionFlagTriggered,
      hasVerifiedC2PA: false,
    }
  );

  const { calibratedScore, calibratedTier, calibratedLabel } =
    synchronizeAggregateScore(
      fusion.finalAggregateProbability,
      weightedNeuralSignal,
      latexDominantVeto,
      fusion.activeVetoes
    );

  const synchronizedFusion = {
    ...fusion,
    finalAggregateProbability: calibratedScore,
    tier: calibratedTier,
    tierLabel: calibratedLabel,
  };

  const flags: ForensicFlag[] = [];
  if (sanitization.evasionFlagTriggered) {
    flags.push({
      flag_code: "HIDDEN_CHARACTER_EVASION",
      description: `Removed ${sanitization.zeroWidthCount} invisible zero-width character(s) and normalized ${sanitization.homoglyphCount} embedded lookalike character(s).`,
      severity: "critical",
    });
  }

  const spans = buildSynchronizedSpans(
    passages,
    calibratedScore,
    fusion.activeVetoes.eslProtectionVeto,
    fusion.activeVetoes.minimumLengthVeto,
    latexDominantVeto,
    sanitization.evasionFlagTriggered
  );

  const summary = academicResearchVeto
    ? "Academic Peer-Review Protection applied: verified scholarly citations and research apparatus detected, ensuring authentic academic writing is protected."
    : formalTextbookOrLegalVeto
    ? "Official Textbook / Legal / Formal Reference Guard applied: standardized curriculum, legal, or committee-edited educational prose detected and protected from false-positive AI classification."
    : latexDominantVeto
    ? "LaTeX / Mathematical & Diagram Guard applied: document consists solely of symbolic equations and diagram labels."
    : fusion.activeVetoes.minimumLengthVeto
    ? `Passage is under 150 words (${stylometrics.wordCount} words); automatically protected from synthetic classification to prevent false positives.`
    : fusion.activeVetoes.eslProtectionVeto
    ? "ESL protection applied: second-language phrasing patterns detected alongside formulaic transitions, preventing false-positive classification."
    : calibratedTier === 0
    ? "Writing exhibits natural sentence variation, diverse vocabulary, and human-consistent cadence."
    : `Writing displays uniform sentence cadence and predictable token patterns (${
        fusion.activeVetoes.metadataAbsentDowngrade
          ? "capped at Tier 2 — Likely Synthetic under Metadata-Absent Downgrade because plain text lacks a container session log"
          : calibratedLabel
      }).`;

  const id = `sub_${Date.now().toString(36)}`;

  return {
    id,
    title,
    studentAlias: "Direct Text Input",
    courseCode: "Text Evaluation",
    submittedAt: new Date().toISOString(),
    documentText: sanitization.sanitizedText,
    report: {
      submission_id: id,
      timestamp: new Date().toISOString(),
      overall_verdict: {
        tier: calibratedTier,
        tier_label: calibratedLabel,
        defensible_outcome: synchronizedFusion.defensibleOutcome,
        aggregate_score: calibratedScore,
        conformal_p_value: synchronizedFusion.conformalPValue,
        allowable_fpr_ceiling: synchronizedFusion.allowableFprCeiling,
        disciplinary_action_eligible: fusion.disciplinaryActionEligible,
        summary_justification: summary,
      },
      document_metadata_forensics: {
        file_type: "plain",
        editing_duration_minutes: null,
        revision_count: null,
        author_tool_signature: latexCheck.latexMathProtected
          ? "LaTeX / Mathematical Notation"
          : "Direct Text Input (No Container Log)",
        anomaly_detected: sanitization.evasionFlagTriggered,
        flags,
      },
      highlighted_spans: spans,
    },
    stylometrics,
    gltr,
    sanitization,
    fusion: synchronizedFusion,
    slidingWindows: computeSlidingWindowGaussianCurve(
      sanitization.sanitizedText,
      spans
    ),
  };
}

/**
 * Evaluates an uploaded file (.docx, .pdf, .txt/.md, or .png/.jpg/.webp) client-side.
 */
export async function evaluateFileSubmission(
  file: File
): Promise<ForensicSubmissionCase> {
  const lowerName = file.name.toLowerCase();
  const id = `sub_${Date.now().toString(36)}`;

  // 1. DOCX OpenXML Archive
  if (lowerName.endsWith(".docx")) {
    const buffer = await file.arrayBuffer();
    const parsed = await parseDocxContainer(buffer);
    const rawText =
      parsed.extractedText ||
      "Document text layer is empty or contains only non-text media objects.";
    const sanitization = sanitizeAndTrapAdversarial(rawText);
    const stylometrics = computeStylometricMetrics(sanitization.sanitizedText);
    const gltr = computeGLTRDistribution(sanitization.sanitizedText);
    const eslCheck = detectESLSyntacticPatterns(
      sanitization.sanitizedText,
      stylometrics.mattr
    );
    const formalRefCheck = detectTextbookAndFormalReferenceProtection(
      sanitization.sanitizedText
    );
    const academicCheck = detectAcademicPeerReviewProtection(
      sanitization.sanitizedText
    );
    const latexCheck = detectLatexAndMathProtection(
      sanitization.sanitizedText,
      parsed.authorToolSignature
    );

    const { passages, weightedNeuralSignal, prosePassageWordCount } =
      analyzePassages(
        sanitization.sanitizedText,
        sanitization.evasionFlagTriggered,
        stylometrics.sentenceBurstiness,
        gltr.top10
      );

    const formalTextbookOrLegalVeto =
      formalRefCheck.formalReferenceProtected &&
      !sanitization.evasionFlagTriggered;

    const academicResearchVeto =
      academicCheck.academicProtected &&
      !sanitization.evasionFlagTriggered;

    const latexDominantVeto =
      (latexCheck.latexMathProtected && prosePassageWordCount === 0) ||
      formalTextbookOrLegalVeto;

    const isNonWordExporter = parsed.rsidTestStatus === "NOT_APPLICABLE";
    const hasExternalPasteAdvisory = parsed.flags.some(
      (f) => f.flag_code === "EXTERNAL_PASTE_DETECTED"
    );
    const hasMetaAnomaly =
      parsed.anomalyDetected || sanitization.evasionFlagTriggered;

    const burstSignal = Math.max(
      0.06,
      Math.min(
        0.96,
        1 / (1 + Math.exp((stylometrics.sentenceBurstiness + 0.08) * 4.6))
      )
    );
    const binoSignal = Math.max(
      0.06,
      Math.min(
        0.96,
        1 / (1 + Math.exp((stylometrics.binocularsRatio - 0.78) * 6.0))
      )
    );
    const gltrSignal = Math.max(
      0.06,
      Math.min(0.95, (gltr.top10 - 0.46) * 2.1)
    );
    const metaSignal = hasMetaAnomaly
      ? 0.96
      : parsed.editingDurationMinutes && parsed.editingDurationMinutes > 25
      ? 0.12
      : 0.5;

    const fusion = computeLogOddsFusion(
      {
        c2paScore: 0.5,
        metaScore: metaSignal,
        neuralScore: weightedNeuralSignal,
        binoScore: binoSignal,
        burstScore: burstSignal,
        gltrScore: gltrSignal,
      },
      {
        wordCount: stylometrics.wordCount,
        eslPatternsDetected: eslCheck.eslProtected,
        academicResearchProtected: academicResearchVeto,
        hasContainerSessionTracking:
          !isNonWordExporter &&
          !hasExternalPasteAdvisory &&
          parsed.editingDurationMinutes !== null,
        hasMetadataAnomaly: hasMetaAnomaly || hasExternalPasteAdvisory,
        hasVerifiedC2PA: false,
      }
    );

    const { calibratedScore, calibratedTier, calibratedLabel } =
      synchronizeAggregateScore(
        fusion.finalAggregateProbability,
        weightedNeuralSignal,
        latexDominantVeto,
        fusion.activeVetoes
      );

    const synchronizedFusion = {
      ...fusion,
      finalAggregateProbability: calibratedScore,
      tier: calibratedTier,
      tierLabel: calibratedLabel,
    };

    const flags: ForensicFlag[] = [...parsed.flags];
    if (sanitization.evasionFlagTriggered) {
      flags.push({
        flag_code: "HIDDEN_CHARACTER_EVASION",
        description: `Removed ${sanitization.zeroWidthCount} invisible zero-width character(s) and normalized ${sanitization.homoglyphCount} embedded lookalike character(s).`,
        severity: "critical",
      });
    }

    const spans = buildSynchronizedSpans(
      passages,
      calibratedScore,
      fusion.activeVetoes.eslProtectionVeto,
      fusion.activeVetoes.minimumLengthVeto,
      latexDominantVeto,
      sanitization.evasionFlagTriggered,
      isNonWordExporter ? undefined : parsed.dominantRsid ?? undefined
    );

    const summary = academicResearchVeto
      ? "Academic Peer-Review Protection applied: verified scholarly citations and research apparatus detected, ensuring authentic academic writing is protected."
      : formalTextbookOrLegalVeto
      ? "Official Textbook / Legal / Formal Reference Guard applied: standardized curriculum, legal, or committee-edited educational prose detected and protected from false-positive AI classification."
      : latexDominantVeto
      ? "LaTeX / Mathematical & Diagram Guard applied: document consists solely of symbolic equations and diagram labels."
      : fusion.activeVetoes.minimumLengthVeto
      ? `Document contains ${stylometrics.wordCount} words (<150-word minimum threshold); automatically protected to prevent false positives on short excerpts.`
      : isNonWordExporter
      ? `Document exported from ${parsed.authorToolSignature}; Microsoft Word RSID session checks are marked Not Applicable to prevent false positives.`
      : hasExternalPasteAdvisory
      ? "The document contains monolithic insertion. This indicates text was written in an external editor or pasted from a separate source. It does not determine whether the source was human or synthetic."
      : "Document evaluated across container revision history and multi-signal linguistic cadence.";

    return {
      id,
      title: file.name,
      studentAlias: "Uploaded DOCX",
      courseCode: "Document Review",
      submittedAt: new Date().toISOString(),
      documentText: sanitization.sanitizedText,
      report: {
        submission_id: id,
        timestamp: new Date().toISOString(),
        overall_verdict: {
          tier: calibratedTier,
          tier_label: calibratedLabel,
          defensible_outcome: synchronizedFusion.defensibleOutcome,
          aggregate_score: calibratedScore,
          conformal_p_value: synchronizedFusion.conformalPValue,
          allowable_fpr_ceiling: synchronizedFusion.allowableFprCeiling,
          disciplinary_action_eligible: fusion.disciplinaryActionEligible,
          summary_justification: summary,
        },
        document_metadata_forensics: {
          file_type: "docx",
          editing_duration_minutes: parsed.editingDurationMinutes,
          revision_count: parsed.revisionCount,
          author_tool_signature: parsed.authorToolSignature,
          anomaly_detected: hasMetaAnomaly,
          flags,
        },
        highlighted_spans: spans,
      },
      rsidSessionLog: parsed.rsidEntries,
      stylometrics,
      gltr,
      sanitization,
      fusion: synchronizedFusion,
      slidingWindows: computeSlidingWindowGaussianCurve(
        sanitization.sanitizedText,
        spans
      ),
    };
  }

  // 2. PDF File
  if (lowerName.endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    const parsedPdf = await parsePdfContainer(buffer);
    const sanitization = sanitizeAndTrapAdversarial(parsedPdf.extractedText);
    const stylometrics = computeStylometricMetrics(sanitization.sanitizedText);
    const gltr = computeGLTRDistribution(sanitization.sanitizedText);
    const eslCheck = detectESLSyntacticPatterns(
      sanitization.sanitizedText,
      stylometrics.mattr
    );
    const formalRefCheck = detectTextbookAndFormalReferenceProtection(
      sanitization.sanitizedText
    );
    const academicCheck = detectAcademicPeerReviewProtection(
      sanitization.sanitizedText
    );
    const latexCheck = detectLatexAndMathProtection(
      sanitization.sanitizedText,
      parsedPdf.producerSignature,
      parsedPdf.creatorSignature
    );

    const { passages, weightedNeuralSignal, prosePassageWordCount } =
      analyzePassages(
        sanitization.sanitizedText,
        sanitization.evasionFlagTriggered,
        stylometrics.sentenceBurstiness,
        gltr.top10
      );

    const formalTextbookOrLegalVeto =
      formalRefCheck.formalReferenceProtected &&
      !sanitization.evasionFlagTriggered;

    const academicResearchVeto =
      academicCheck.academicProtected &&
      !sanitization.evasionFlagTriggered;

    // Only veto if the PDF has zero prose passages (i.e. pure diagram / formula sheet) or formal reference
    const latexDominantVeto =
      (latexCheck.latexMathProtected && prosePassageWordCount === 0) ||
      formalTextbookOrLegalVeto;

    const burstSignal = Math.max(
      0.06,
      Math.min(
        0.96,
        1 / (1 + Math.exp((stylometrics.sentenceBurstiness + 0.08) * 4.6))
      )
    );
    const binoSignal = Math.max(
      0.06,
      Math.min(
        0.96,
        1 / (1 + Math.exp((stylometrics.binocularsRatio - 0.78) * 6.0))
      )
    );
    const gltrSignal = Math.max(
      0.06,
      Math.min(0.95, (gltr.top10 - 0.46) * 2.1)
    );

    const fusion = computeLogOddsFusion(
      {
        c2paScore: 0.5,
        metaScore: parsedPdf.anomalyDetected ? 0.92 : 0.5,
        neuralScore: weightedNeuralSignal,
        binoScore: binoSignal,
        burstScore: burstSignal,
        gltrScore: gltrSignal,
      },
      {
        wordCount:
          stylometrics.wordCount >= 60
            ? Math.max(160, stylometrics.wordCount)
            : stylometrics.wordCount,
        eslPatternsDetected: eslCheck.eslProtected,
        academicResearchProtected: academicResearchVeto,
        hasContainerSessionTracking: parsedPdf.anomalyDetected,
        hasMetadataAnomaly: parsedPdf.anomalyDetected,
        hasVerifiedC2PA: false,
      }
    );

    const { calibratedScore, calibratedTier, calibratedLabel } =
      synchronizeAggregateScore(
        fusion.finalAggregateProbability,
        weightedNeuralSignal,
        latexDominantVeto,
        fusion.activeVetoes
      );

    const synchronizedFusion = {
      ...fusion,
      finalAggregateProbability: calibratedScore,
      tier: calibratedTier,
      tierLabel: calibratedLabel,
    };

    const spans = buildSynchronizedSpans(
      passages,
      calibratedScore,
      fusion.activeVetoes.eslProtectionVeto,
      fusion.activeVetoes.minimumLengthVeto,
      latexDominantVeto,
      sanitization.evasionFlagTriggered
    );

    return {
      id,
      title: file.name,
      studentAlias: "Uploaded PDF",
      courseCode: "PDF Stream Review",
      submittedAt: new Date().toISOString(),
      documentText: sanitization.sanitizedText,
      pdfPagePreviews: parsedPdf.pagePreviews,
      report: {
        submission_id: id,
        timestamp: new Date().toISOString(),
        overall_verdict: {
          tier: calibratedTier,
          tier_label: calibratedLabel,
          defensible_outcome: synchronizedFusion.defensibleOutcome,
          aggregate_score: calibratedScore,
          conformal_p_value: synchronizedFusion.conformalPValue,
          allowable_fpr_ceiling: synchronizedFusion.allowableFprCeiling,
          disciplinary_action_eligible: fusion.disciplinaryActionEligible,
          summary_justification: academicResearchVeto
            ? `Academic Peer-Review Protection applied: verified scholarly citations (${academicCheck.citationCount}) and research apparatus detected, ensuring authentic academic writing is protected.`
            : formalTextbookOrLegalVeto
            ? "Official Textbook / Legal / Formal Reference Guard applied: standardized curriculum, legal, or committee-edited educational prose detected and protected from false-positive AI classification."
            : latexDominantVeto
            ? `LaTeX / Mathematical & Diagram Guard applied (${parsedPdf.producerSignature}): document contains only equations and diagram labels.`
            : fusion.activeVetoes.minimumLengthVeto
            ? `Extracted PDF text contains ${stylometrics.wordCount} words (<150-word minimum threshold); automatically protected to prevent false positives.`
            : parsedPdf.anomalyDetected
            ? `PDF stream metadata exposes programmatic generator '${parsedPdf.producerSignature}' with ${parsedPdf.xrefTableCount} XREF table(s).`
            : `PDF container (${parsedPdf.producerSignature}) evaluated across ${parsedPdf.xrefTableCount} XREF save table(s) and extracted prose stream.`,
        },
        document_metadata_forensics: {
          file_type: "pdf",
          editing_duration_minutes: null,
          revision_count: parsedPdf.xrefTableCount,
          author_tool_signature: latexCheck.latexMathProtected
            ? `${parsedPdf.producerSignature} (LaTeX / Math Guard)`
            : parsedPdf.producerSignature,
          anomaly_detected: parsedPdf.anomalyDetected,
          flags: parsedPdf.flags,
        },
        highlighted_spans: spans,
      },
      stylometrics,
      gltr,
      sanitization,
      fusion: synchronizedFusion,
      slidingWindows: computeSlidingWindowGaussianCurve(
        sanitization.sanitizedText,
        spans
      ),
    };
  }

  // 3. Image File (.png, .jpg, .jpeg, .webp)
  if (/\.(png|jpe?g|webp)$/i.test(lowerName)) {
    const imgForensics = await analyzeUploadedImageForensics(file);
    const imageUrl = URL.createObjectURL(file);

    // Scan for rendered AI generator watermarks (Server OCR endpoint first, in-browser Tesseract.js fallback)
    let ocrKeyword: string | null = null;
    let ocrTextSnippet: string | null = null;
    const aiRegex = /(chatgpt|dall[-_ ]?e|dalle|midjourney|stablediffusion|stable\s*diffusion|comfyui|adobe\s*firefly|firefly|novelai|bing\s*image|generic\s*ai|uncompensated\s*artists|ai\s*poster|ai\s*art)/i;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binaryStr = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
      }
      const dataUrl = `data:${file.type || "image/jpeg"};base64,${btoa(binaryStr)}`;
      const resp = await fetch("/api/forensics/image-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: dataUrl }),
      });
      if (resp.ok) {
        const ocrData = (await resp.json()) as {
          aiKeywordDetected: string | null;
          extractedText: string;
          isAiTextSignaled: boolean;
        };
        if (ocrData.isAiTextSignaled && ocrData.aiKeywordDetected) {
          ocrKeyword = ocrData.aiKeywordDetected;
          ocrTextSnippet = ocrData.extractedText.slice(0, 200).replace(/\n+/g, " ");
        }
      }
    } catch {
      // Server unreachable - proceed to client-side OCR fallback
    }

    // In-browser client-side OCR fallback with strict 4s timeout so UI never hangs
    // Only attempt if not already classified via Tier 1 C2PA or server OCR
    if (!ocrKeyword && !imgForensics.c2paDetected) {
      if (typeof window !== "undefined") {
        try {
          const TesseractModule = await import("tesseract.js");
          const Tesseract = (TesseractModule as any).default ?? TesseractModule;
          if (typeof Tesseract?.recognize === "function") {
            const ocrPromise = Tesseract.recognize(file, "eng", {
              logger: () => {},
            });
            const timeoutPromise = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error("Client OCR timeout")), 3500)
            );
            const ocrResult = (await Promise.race([ocrPromise, timeoutPromise])) as any;
            const clientText = ocrResult?.data?.text || "";
            const clientMatch = clientText.match(aiRegex);
            if (clientMatch) {
              ocrKeyword = clientMatch[0];
              ocrTextSnippet = clientText.slice(0, 200).replace(/\n+/g, " ");
            }
          }
        } catch (clientOcrErr) {
          console.warn("Client-side OCR fallback skipped or timed out:", clientOcrErr);
        }
      }
    }

    const detectedKeyword = imgForensics.aiKeywordTracesDetected || ocrKeyword;
    if (detectedKeyword && !imgForensics.flags.some((f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED")) {
      imgForensics.flags.push({
        flag_code: "AI_GENERATOR_TEXT_DETECTED",
        description: `Frontier AI generator signature identified in media text: "${detectedKeyword}"`,
        severity: "critical",
      });
    }
    
    // 4-Tier Multimodal Forensics Classification:
    // Tier 1 (Proven Synthetic / Conclusive Provenance): Cryptographic ISO 19566-5 C2PA JUMBF Manifest
    // or embedded PNG synthesis parameters chunk.
    const isTier1C2PA = imgForensics.c2paDetected || !!imgForensics.pngParametersChunk;
    
    // Tier 2 (Corroborated Anomaly / Likely AI Generated): C2PA absent, BUT either:
    // 1) Frontier AI generator keyword / prompt signature identified (OCR, ASCII header, metadata), OR
    // 2) 2D-FFT spectral anomaly detected (high-frequency upsampling artifacts / unnatural spectral slope / high residual variance), OR
    // 3) Generator EXIF software tag present (Midjourney, Stable Diffusion, Firefly)
    const isSpectralAnomalous = imgForensics.highFreqAnomaly || (imgForensics.conformalAnomalyPValue <= 0.05 && imgForensics.highFreqAnomalyScore > 0.25);
    const isTier2Corroborated = 
      !isTier1C2PA &&
      (!!detectedKeyword || !!imgForensics.exifSoftware || isSpectralAnomalous);

    if (isSpectralAnomalous && !imgForensics.flags.some((f) => f.flag_code === "FFT_SPECTRAL_UPSAMPLING_ANOMALY")) {
      imgForensics.flags.push({
        flag_code: "FFT_SPECTRAL_UPSAMPLING_ANOMALY",
        description: `2D-FFT spectral anomaly detected: unnatural high-frequency energy distribution (slope α=${imgForensics.fittedSlopeAlpha}, residual var=${imgForensics.harmonicResidualVariance}, conformal p=${imgForensics.conformalAnomalyPValue})`,
        severity: "critical",
      });
    }

    const aiGeneratorName = imgForensics.c2paAuthority 
      ? imgForensics.c2paAuthority.replace(" (JUMBF c2cs Box)", "")
      : imgForensics.exifSoftware ?? 
        (detectedKeyword ? `Frontier Model (${detectedKeyword})` : (imgForensics.pngParametersChunk ? "Frontier AI Generator" : (isSpectralAnomalous ? "Synthetic Diffusion Model" : "Generative Model")));

    const fusion = computeLogOddsFusion(
      {
        c2paScore: imgForensics.c2paDetected ? 0.99 : (isTier2Corroborated ? 0.92 : 0.05),
        metaScore: imgForensics.pngParametersChunk ? 0.96 : (detectedKeyword ? 0.94 : (isSpectralAnomalous ? 0.88 : 0.05)),
        neuralScore: isTier2Corroborated ? 0.90 : 0.05,
        binoScore: 0.5,
        burstScore: 0.5,
        gltrScore: 0.5,
      },
      {
        wordCount: 250,
        eslPatternsDetected: false,
        hasContainerSessionTracking: true,
        hasMetadataAnomaly: imgForensics.anomalyDetected || isTier2Corroborated,
        hasVerifiedC2PA: imgForensics.c2paDetected,
      }
    );

    const evidenceDetails: string[] = [];
    if (detectedKeyword) {
      evidenceDetails.push(`visible text signature "${detectedKeyword}"`);
    }
    if (isSpectralAnomalous) {
      evidenceDetails.push("2D-FFT spectral upsampling anomaly");
    }
    if (imgForensics.exifSoftware) {
      evidenceDetails.push(`software metadata tag "${imgForensics.exifSoftware}"`);
    }
    const evidenceSummary = evidenceDetails.length > 0 ? evidenceDetails.join(" and ") : "multi-signal visual markers";

    const summary = isTier1C2PA
      ? `Tier 1 Conclusive Provenance: Deterministic C2PA cryptographic signature / manifest verified (${aiGeneratorName}).`
      : isTier2Corroborated
      ? `Tier 2 Corroborated Anomaly: Frontier AI generator signature identified via ${evidenceSummary} (${aiGeneratorName}).`
      : "Tier 0 Human-Consistent: No C2PA synthetic manifest, no AI generator keywords, and natural photographic spectral profile.";

    const descText = isTier1C2PA
      ? `Tier 1: Proven Synthetic\n\n• Generator: ${aiGeneratorName}\n• Evidence: Deterministic C2PA Cryptographic Signature / Manifest Verified\n• File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      : isTier2Corroborated
      ? `Tier 2: Corroborated Anomaly (Likely AI)\n\n• Identified Generator: ${aiGeneratorName}\n• Evidence: Stripped metadata with corroborated ${evidenceSummary}\n• File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      : `Tier 0: Human-Consistent Image\n\n• Status: Clean Camera Artifact Profile\n• File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    const sanitization = sanitizeAndTrapAdversarial(descText);
    const stylometrics = computeStylometricMetrics(descText);
    const gltr = computeGLTRDistribution(descText);

    return {
      id,
      title: file.name,
      studentAlias: "Uploaded Image",
      courseCode: "Visual Media Review",
      submittedAt: new Date().toISOString(),
      documentText: descText,
      imagePreviewUrl: imageUrl,
      report: {
        submission_id: id,
        timestamp: new Date().toISOString(),
        overall_verdict: {
          tier: fusion.tier,
          tier_label: fusion.tierLabel,
          defensible_outcome: fusion.defensibleOutcome,
          aggregate_score: fusion.finalAggregateProbability,
          conformal_p_value: fusion.conformalPValue,
          allowable_fpr_ceiling: fusion.allowableFprCeiling,
          disciplinary_action_eligible: fusion.disciplinaryActionEligible,
          summary_justification: summary,
        },
        document_metadata_forensics: {
          file_type: "image",
          editing_duration_minutes: null,
          revision_count: 1,
          author_tool_signature:
            imgForensics.exifSoftware ?? "Standard Image Container",
          anomaly_detected: imgForensics.anomalyDetected,
          flags: imgForensics.flags,
        },
        image_forensics: {
          c2pa_manifest_present: imgForensics.c2paDetected,
          c2pa_verified_ai_generator: imgForensics.c2paAuthority,
          c2pa_sha256_claim_hash_verified: imgForensics.c2paSha256ClaimHashVerified,
          c2pa_cose_signature_verified: imgForensics.c2paCoseSignatureVerified,
          exif_software_tag: imgForensics.exifSoftware,
          frequency_spectral_slope_alpha: imgForensics.fittedSlopeAlpha,
          ocr_gibberish_detected: false,
        },
        highlighted_spans: [],
      },
      stylometrics,
      gltr,
      sanitization,
      fusion,
      slidingWindows: [],
      radialSpectrum: imgForensics.radialSpectrum,
    };
  }

  // 4. Plain Text (.txt, .md, etc.)
  const textContent = await file.text();
  const baseCase = evaluateTextSubmission(textContent, file.name);
  return enrichSubmissionWithLiveNeuralClassifier(baseCase);
}

/**
 * Invokes the server-side Deterministic Token Log-Likelihood & Conformal Calibration endpoint
 * (/api/forensics/neural-classify) to calibrate token cross-entropy and conformal p-values
 * when running in the browser.
 * Gracefully preserves the local statistical/syntactic evaluation if offline or in unit tests.
 */
export async function enrichSubmissionWithLiveNeuralClassifier(
  submission: ForensicSubmissionCase
): Promise<ForensicSubmissionCase> {
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return submission;
  }
  if (submission.report.document_metadata_forensics.file_type === "image") {
    return submission;
  }
  // When running inside the desktop app offline or without internet connectivity,
  // rely gracefully on the robust local statistical & stylometric fusion engine.
  if (isDesktopApp() || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return submission;
  }

  try {
    const rawPassages = splitIntoLogicalPassages(submission.documentText)
      .filter((p) => p.split(/\s+/).filter(Boolean).length >= 8 && !isMathOrDiagramSegment(p))
      .slice(0, 18)
      .map((text, index) => ({ index, text }));

    if (rawPassages.length === 0) {
      return submission;
    }

    let data: {
      overallNeuralScore?: number;
      crossEntropySignal?: number;
      conformalPValue?: number;
      allowableFprCeiling?: number;
      eslOrFormalHumanProtection?: boolean;
      passageScores?: Array<{ index: number; neuralAiProbability: number }>;
      liveNeuralInference?: boolean;
    } | null = null;

    // 1. First attempt local offline in-app transformer inference
    try {
      const localClassifier = await getLocalOfflineNeuralClassifier();
      if (localClassifier) {
        const fullDocSnippet = rawPassages.map((p) => p.text).join("\n\n").slice(0, 2000);
        const docOutput = await localClassifier(fullDocSnippet, { top_k: 2, truncation: true });
        const docProb = extractAiProbability(docOutput);

        if (docProb !== null) {
          const passageScores = await Promise.all(
            rawPassages.slice(0, 18).map(async (p) => {
              try {
                const out = await localClassifier(p.text.slice(0, 1200), { top_k: 2, truncation: true });
                const prob = extractAiProbability(out);
                return {
                  index: p.index,
                  neuralAiProbability: prob ?? 0.5,
                };
              } catch {
                return { index: p.index, neuralAiProbability: 0.5 };
              }
            })
          );

          data = {
            overallNeuralScore: docProb,
            liveNeuralInference: true,
            passageScores,
          };
        }
      }
    } catch (localErr) {
      console.warn("[LocalNeuralInference] Falling back to remote or statistical heuristics:", localErr);
    }

    // 2. If local offline was not available, try server endpoint (/api/forensics/neural-classify)
    if (!data) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return submission;
      }

      const res = await fetch("/api/forensics/neural-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentSummary: `${submission.title} (${submission.stylometrics.wordCount} words, ${submission.report.document_metadata_forensics.author_tool_signature})`,
          passages: rawPassages,
        }),
      });

      if (!res.ok) {
        return submission;
      }

      data = (await res.json()) as typeof data;
    }

    // If no inference data could be obtained (offline and server unreachable), retain baseline submission
    if (!data || !data.liveNeuralInference || typeof data.overallNeuralScore !== "number") {
      return submission;
    }

    const oldNeuralContrib = submission.fusion.signalContributions.find(
      (s) => s.id === "neural"
    );
    const baselineNeural = oldNeuralContrib?.rawScore ?? 0.5;
    const blendedNeural = Number(
      (data.overallNeuralScore * 0.65 + baselineNeural * 0.35).toFixed(3)
    );

    const binoContrib = submission.fusion.signalContributions.find((s) => s.id === "bino");
    const burstContrib = submission.fusion.signalContributions.find((s) => s.id === "burst");
    const gltrContrib = submission.fusion.signalContributions.find((s) => s.id === "gltr");
    const metaContrib = submission.fusion.signalContributions.find((s) => s.id === "meta");
    const c2paContrib = submission.fusion.signalContributions.find((s) => s.id === "c2pa");

    const updatedFusion = computeLogOddsFusion(
      {
        c2paScore: c2paContrib?.rawScore ?? 0.5,
        metaScore: metaContrib?.rawScore ?? 0.5,
        neuralScore: blendedNeural,
        binoScore:
          typeof data.crossEntropySignal === "number"
            ? Number(((binoContrib?.rawScore ?? 0.5) * 0.5 + data.crossEntropySignal * 0.5).toFixed(3))
            : binoContrib?.rawScore ?? 0.5,
        burstScore: burstContrib?.rawScore ?? 0.5,
        gltrScore: gltrContrib?.rawScore ?? 0.5,
      },
      {
        wordCount: submission.stylometrics.wordCount,
        eslPatternsDetected:
          submission.fusion.activeVetoes.eslProtectionVeto ||
          Boolean(data.eslOrFormalHumanProtection),
        academicResearchProtected:
          submission.fusion.activeVetoes.academicProtectionVeto,
        hasContainerSessionTracking:
          !submission.fusion.activeVetoes.metadataAbsentDowngrade &&
          submission.report.document_metadata_forensics.file_type === "docx",
        hasMetadataAnomaly: submission.report.document_metadata_forensics.anomaly_detected,
        hasVerifiedC2PA: false,
      }
    );

    const latexCheck = detectLatexAndMathProtection(
      submission.documentText,
      submission.report.document_metadata_forensics.author_tool_signature
    );
    const latexDominantVeto =
      latexCheck.latexMathProtected && rawPassages.length === 0;

    const { calibratedScore, calibratedTier, calibratedLabel } =
      synchronizeAggregateScore(
        updatedFusion.finalAggregateProbability,
        blendedNeural,
        latexDominantVeto,
        updatedFusion.activeVetoes
      );

    const finalConformalP =
      typeof data.conformalPValue === "number"
        ? data.conformalPValue
        : updatedFusion.conformalPValue;
    const finalFprCeiling =
      typeof data.allowableFprCeiling === "number"
        ? data.allowableFprCeiling
        : updatedFusion.allowableFprCeiling;

    return {
      ...submission,
      fusion: {
        ...updatedFusion,
        finalAggregateProbability: calibratedScore,
        tier: calibratedTier,
        tierLabel: calibratedLabel,
        conformalPValue: finalConformalP,
        allowableFprCeiling: finalFprCeiling,
      },
      report: {
        ...submission.report,
        overall_verdict: {
          ...submission.report.overall_verdict,
          tier: calibratedTier,
          tier_label: calibratedLabel,
          defensible_outcome: updatedFusion.defensibleOutcome,
          aggregate_score: calibratedScore,
          conformal_p_value: finalConformalP,
          allowable_fpr_ceiling: finalFprCeiling,
          disciplinary_action_eligible: updatedFusion.disciplinaryActionEligible,
        },
      },
    };
  } catch {
    return submission;
  }
}

