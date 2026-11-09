/**
 * Production-Ready Data Contracts & Extended Types
 * Based on "Technical Architecture for Defensible Multi-Modal AI Detection in Academic Submissions"
 */

export type TierLevel = 0 | 1 | 2 | 3;

export type TierLabel =
  | "Human-Consistent"
  | "Inconclusive"
  | "Likely Synthetic"
  | "Proven Synthetic";

export type ReasonCode =
  | "MONOLITHIC_INSERTION"
  | "LOW_BURSTINESS_UNIFORM_PPL"
  | "NEURAL_SPAN_POSITIVE"
  | "HOMOGLYPH_EVASION";

export interface ForensicFlag {
  flag_code: string;
  description: string;
  severity: "low" | "medium" | "critical";
}

export interface TextHighlightSpan {
  id: string;
  start_char: number; // 0-based character offset
  end_char: number;   // 0-based character offset
  text_segment: string;
  severity_tier: 1 | 2 | 3;
  confidence: number; // [0.00, 1.00]
  reason_code: ReasonCode;
  forensic_metrics: {
    sentence_burstiness: number;
    binoculars_score: number;
    gltr_top10_percentage: number;
    associated_rsid?: string;
    stripped_adversarial_chars?: number;
  };
  esl_protective_override_applied: boolean;
}

export type DefensibleOutcomeLabel =
  | "Consistent with Human Baseline"
  | "Anomalous / Low Informational Variance"
  | "Unverified External Provenance";

export interface ImageForensics {
  c2pa_manifest_present: boolean;
  c2pa_verified_ai_generator: string | null;
  c2pa_sha256_claim_hash_verified?: boolean;
  c2pa_cose_signature_verified?: boolean;
  exif_software_tag: string | null;
  frequency_spectral_slope_alpha: number | null;
  ocr_gibberish_detected: boolean;
  synthid_p_value?: number | null;
  png_generation_params?: string | null;
  chromatic_aberration_present?: boolean;
  hough_orthogonality_deviation_deg?: number | null;
  ocr_extracted_terms?: Array<{
    term: string;
    is_pseudo_word: boolean;
    trigram_gibberish_score: number;
  }>;
}

export interface AnalysisReportPayload {
  submission_id: string;
  timestamp: string; // ISO 8601
  overall_verdict: {
    tier: TierLevel;
    tier_label: TierLabel;
    defensible_outcome?: DefensibleOutcomeLabel;
    conformal_p_value?: number;
    allowable_fpr_ceiling?: number;
    aggregate_score: number; // [0.00, 1.00]
    disciplinary_action_eligible: boolean;
    summary_justification: string;
  };
  document_metadata_forensics: {
    file_type: "docx" | "pdf" | "image" | "plain";
    editing_duration_minutes: number | null;
    revision_count: number | null;
    author_tool_signature: string;
    anomaly_detected: boolean;
    flags: Array<ForensicFlag>;
  };
  image_forensics?: ImageForensics;
  highlighted_spans: Array<TextHighlightSpan>;
}

export interface SanitizationAnomaly {
  index: number;
  originalChar: string;
  codePointHex: string;
  replacementChar: string;
  type: "zero_width" | "homoglyph" | "math_alphanumeric";
  contextWord: string;
}

export interface SanitizationResult {
  sanitizedText: string;
  originalLength: number;
  sanitizedLength: number;
  zeroWidthCount: number;
  homoglyphCount: number;
  mathVariantCount: number;
  evasionFlagTriggered: boolean;
  anomalies: SanitizationAnomaly[];
}

export interface GLTRDistribution {
  top10: number;     // r(x_i) <= 10 (High-Frequency Core Tier)
  top100: number;    // 10 < r(x_i) <= 100 (Secondary Register Tier)
  top1000: number;   // 100 < r(x_i) <= 1000 (Domain Lexical Tier)
  tail: number;      // r(x_i) > 1000 (Idiosyncratic / Tail Tier)
  tokenRanks: Array<{
    token: string;
    rank: number;
    tier: "top10" | "top100" | "top1000" | "tail";
  }>;
}

export interface StylometricMetrics {
  wordCount: number;
  sentenceCount: number;
  tokenPerplexity: number;       // Syntactic Discourse Surprisal Index
  sentenceBurstiness: number;    // B in [-1, 1]
  meanSentencePPL: number;       // mu_p
  stdSentencePPL: number;        // sigma_p
  sentencePPLs: Array<{
    sentence: string;
    ppl: number;
    index: number;
  }>;
  mattr: number;                 // 50-token sliding window Type-Token Ratio
  hapaxLegomenaRatio: number;    // V_1 / N
  simpsonsDiversityIndex: number;// D_S
  binocularsRatio: number;       // Cross-Entropy Contrast Ratio
  fastDetectGPTCurvature: number;// Conditional Dispersion Curvature
  semanticDriftMinSim: number;   // Min adjacent sentence cosine similarity
  yulesK?: number;               // Yule's Characteristic K
  posTransitionEntropy?: number; // Shannon POS Bigram Entropy H(POS)
  clauseLengthCV?: number;       // Clause-length Coefficient of Variation
}

export interface LogOddsSignalInput {
  c2paScore: number;     // s_c2pa in [0, 1]
  metaScore: number;     // s_meta in [0, 1]
  neuralScore: number;   // s_neural in [0, 1]
  binoScore: number;     // s_bino in [0, 1]
  burstScore: number;    // s_burst in [0, 1]
  gltrScore: number;     // s_gltr in [0, 1]
}

export interface HardVetoContext {
  wordCount: number;
  eslPatternsDetected: boolean;
  academicResearchProtected?: boolean;
  hasContainerSessionTracking: boolean;
  hasMetadataAnomaly: boolean;
  hasVerifiedC2PA: boolean;
}

export interface LogOddsFusionResult {
  rawAggregateProbability: number;
  finalAggregateProbability: number;
  totalLogOdds: number;
  tier: TierLevel;
  tierLabel: TierLabel;
  defensibleOutcome?: DefensibleOutcomeLabel;
  conformalPValue?: number;
  allowableFprCeiling?: number;
  compositeDistributionalScore?: number;
  disciplinaryActionEligible: boolean;
  activeVetoes: {
    minimumLengthVeto: boolean;
    eslProtectionVeto: boolean;
    academicProtectionVeto?: boolean;
    metadataAbsentDowngrade: boolean;
  };
  signalContributions: Array<{
    id: string;
    label: string;
    weight: number;
    effectiveWeight: number;
    rawScore: number;
    logOdds: number;
    weightedLogOdds: number;
    suppressed: boolean;
  }>;
}

export interface SlidingWindowPoint {
  windowIndex: number;
  startToken: number;
  endToken: number;
  centerChar: number;
  rawWindowProb: number;
  gaussianSmoothedProb: number;
}

export interface RSIDSessionEntry {
  rsid: string;
  tagType: "w:rsidRoot" | "w:rsidR" | "w:rsidP" | "w:rsidRDefault";
  runCount: number;
  wordSharePercentage: number;
  templateInheritedMismatch?: boolean;
}

export interface RadialSpectrumPoint {
  frequencyBin: number;
  logFrequency: number;
  observedLogPower: number;
  naturalReferenceLogPower: number;
  residual: number;
}

export interface ForensicSubmissionCase {
  id: string;
  title: string;
  studentAlias: string;
  courseCode: string;
  submittedAt: string;
  documentText: string;
  report: AnalysisReportPayload;
  rsidSessionLog?: RSIDSessionEntry[];
  pdfStreamForensics?: {
    producerSignature: string;
    creatorSignature: string;
    fontSubsettingValid: boolean;
    sampleFontTag: string;
    modCreationDeltaSeconds: number;
    xrefTableCount: number;
  };
  stylometrics: StylometricMetrics;
  gltr: GLTRDistribution;
  sanitization: SanitizationResult;
  fusion: LogOddsFusionResult;
  slidingWindows: SlidingWindowPoint[];
  radialSpectrum?: RadialSpectrumPoint[];
  pdfPagePreviews?: string[];
  imagePreviewUrl?: string;
}
