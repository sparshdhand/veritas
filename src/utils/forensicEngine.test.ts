import test from "node:test";
import assert from "node:assert/strict";
import {
  computeBurstinessFromSentencePPLs,
  computeLogOddsFusion,
  computeStylometricMetrics,
  detectESLSyntacticPatterns,
  evaluateDocxExportGuard,
  generateRadialSpectrumProfile,
  resolveSequentialSpanOffsets,
  sanitizeAndTrapAdversarial,
} from "./forensicEngine";

test("sanitizeAndTrapAdversarial strips zero-width chars, maps Cyrillic homoglyphs, and triggers evasion flag > 3", () => {
  // Inject 2 zero-width spaces (\u200B) and 2 Cyrillic 'е' (\u0435) -> total 4 anomalies (> 3 threshold)
  const adversarialInput = "comput\u0435r\u200B sci\u0435nce\u200B";
  const res = sanitizeAndTrapAdversarial(adversarialInput);

  assert.equal(res.sanitizedText, "computer science");
  assert.equal(res.zeroWidthCount, 2);
  assert.equal(res.homoglyphCount, 2);
  assert.equal(res.evasionFlagTriggered, true);
  assert.equal(res.anomalies.length, 4);
});

test("computeBurstinessFromSentencePPLs calculates bounded burstiness B = (sigma - mu) / (sigma + mu)", () => {
  // Uniform synthetic sentence perplexities -> negative burstiness approaching -1
  const uniformSynthetic = [14.0, 14.5, 13.8, 14.2, 14.1];
  const synResult = computeBurstinessFromSentencePPLs(uniformSynthetic);
  assert.ok(synResult.burstiness < -0.9, `Expected strongly negative burstiness, got ${synResult.burstiness}`);

  // High-variance human sentence perplexities -> higher burstiness
  const variedHuman = [12.0, 95.0, 18.0, 140.0, 22.0];
  const humResult = computeBurstinessFromSentencePPLs(variedHuman);
  assert.ok(humResult.burstiness > synResult.burstiness);
});

test("computeLogOddsFusion enforces Minimum Length Veto (< 150 words clamped to Tier 0)", () => {
  const result = computeLogOddsFusion(
    {
      c2paScore: 0.5,
      metaScore: 0.95,
      neuralScore: 0.98,
      binoScore: 0.92,
      burstScore: 0.90,
      gltrScore: 0.91,
    },
    {
      wordCount: 95, // Under 150-word minimum threshold
      eslPatternsDetected: false,
      hasContainerSessionTracking: true,
      hasMetadataAnomaly: true,
      hasVerifiedC2PA: false,
    }
  );

  assert.equal(result.activeVetoes.minimumLengthVeto, true);
  assert.equal(result.tier, 0);
  assert.equal(result.tierLabel, "Human-Consistent");
  assert.ok(result.finalAggregateProbability < 0.35);
});

test("computeLogOddsFusion enforces ESL Protection Veto (suppresses w_bino and w_burst to 0 and caps at Tier 1)", () => {
  const result = computeLogOddsFusion(
    {
      c2paScore: 0.5,
      metaScore: 0.15,
      neuralScore: 0.78,
      binoScore: 0.92,
      burstScore: 0.89,
      gltrScore: 0.85,
    },
    {
      wordCount: 600,
      eslPatternsDetected: true,
      hasContainerSessionTracking: true,
      hasMetadataAnomaly: false,
      hasVerifiedC2PA: false,
    }
  );

  assert.equal(result.activeVetoes.eslProtectionVeto, true);
  const binoSig = result.signalContributions.find((s) => s.id === "bino");
  const burstSig = result.signalContributions.find((s) => s.id === "burst");
  assert.equal(binoSig?.effectiveWeight, 0.0);
  assert.equal(burstSig?.effectiveWeight, 0.0);
  assert.ok(result.tier <= 1, `Expected Tier <= 1, got Tier ${result.tier}`);
  assert.equal(result.disciplinaryActionEligible, false);
});

test("computeLogOddsFusion enforces Metadata-Absent Downgrade (caps unformatted plain text at Tier 2)", () => {
  const result = computeLogOddsFusion(
    {
      c2paScore: 0.5,
      metaScore: 0.95,
      neuralScore: 0.99,
      binoScore: 0.96,
      burstScore: 0.95,
      gltrScore: 0.94,
    },
    {
      wordCount: 800,
      eslPatternsDetected: false,
      hasContainerSessionTracking: false, // Plain .txt without session tracking
      hasMetadataAnomaly: false,
      hasVerifiedC2PA: false,
    }
  );

  assert.equal(result.activeVetoes.metadataAbsentDowngrade, true);
  assert.equal(result.tier, 2);
  assert.equal(result.tierLabel, "Likely Synthetic");
  assert.ok(result.finalAggregateProbability < 0.95);
});

test("computeStylometricMetrics & detectESLSyntacticPatterns accurately quantify MATTR, Simpson's D, and ESL markers", () => {
  const eslSample =
    "In nowadays society, many researches discuss about how infrastructure depend from municipal budgets. Furthermore, it is important to remember that cities make a research before investing.";
  const metrics = computeStylometricMetrics(eslSample);
  assert.ok(metrics.mattr > 0 && metrics.mattr <= 1);
  assert.ok(metrics.simpsonsDiversityIndex > 0 && metrics.simpsonsDiversityIndex <= 1);

  const eslCheck = detectESLSyntacticPatterns(eslSample, metrics.mattr);
  assert.equal(eslCheck.eslProtected, true);
  assert.ok(eslCheck.detectedMarkers.length >= 2);
});

test("generateRadialSpectrumProfile distinguishes natural slope (~2.0) from synthetic diffusion spikes", () => {
  const natural = generateRadialSpectrumProfile(false);
  const synthetic = generateRadialSpectrumProfile(true);

  assert.ok(natural.fittedSlopeAlpha >= 1.8 && natural.fittedSlopeAlpha <= 2.2);
  assert.ok(synthetic.harmonicResidualVariance > natural.harmonicResidualVariance);
});

test("resolveSequentialSpanOffsets matches multiple identical phrases sequentially without collision", () => {
  const doc = "Furthermore, the results are clear. Middle human paragraph here. Furthermore, the results are clear.";
  const repeatedPhrase = "Furthermore, the results are clear.";

  const resolved = resolveSequentialSpanOffsets(doc, [
    {
      id: "span_a",
      start_char: 0,
      end_char: 20,
      text_segment: repeatedPhrase,
      severity_tier: 2,
      confidence: 0.85,
      reason_code: "NEURAL_SPAN_POSITIVE",
      forensic_metrics: { sentence_burstiness: -0.2, binoculars_score: 0.75, gltr_top10_percentage: 0.82 },
      esl_protective_override_applied: false,
    },
    {
      id: "span_b",
      start_char: 40,
      end_char: 80,
      text_segment: repeatedPhrase,
      severity_tier: 3,
      confidence: 0.94,
      reason_code: "MONOLITHIC_INSERTION",
      forensic_metrics: { sentence_burstiness: -0.4, binoculars_score: 0.71, gltr_top10_percentage: 0.89 },
      esl_protective_override_applied: false,
    },
  ]);

  assert.equal(resolved[0].resolved_start, 0);
  assert.equal(resolved[0].resolved_end, repeatedPhrase.length);
  assert.equal(resolved[1].resolved_start, 65);
  assert.equal(resolved[1].resolved_end, 65 + repeatedPhrase.length);
  assert.notEqual(resolved[0].resolved_start, resolved[1].resolved_start);
});

test("evaluateDocxExportGuard marks RSID test NOT_APPLICABLE for Google Docs and Apple Pages exports", () => {
  const gdocsResult = evaluateDocxExportGuard({
    authorToolSignature: "Google Docs (OpenXML Exporter)",
    totalDistinctRsids: 0,
    wordCount: 1800,
    dominantRsid: "NONE",
    dominantRsidShare: 0,
    editingDurationMinutes: 0,
  });

  assert.equal(gdocsResult.rsidTestStatus, "NOT_APPLICABLE");
  assert.equal(gdocsResult.exporterGuardTriggered, true);
  assert.equal(
    gdocsResult.flags.some((f) => f.flag_code === "SINGLE_RSID_TREE"),
    false
  );

  const pagesResult = evaluateDocxExportGuard({
    authorToolSignature: "Apple Pages 14.1",
    totalDistinctRsids: 1,
    wordCount: 2200,
    dominantRsid: "00000000",
    dominantRsidShare: 100,
    editingDurationMinutes: null,
  });

  assert.equal(pagesResult.rsidTestStatus, "NOT_APPLICABLE");
  assert.equal(pagesResult.exporterGuardTriggered, true);
});

test("LaTeX, mathematical symbols, and TikZ diagrams are protected from false-positive evasion and prose flagging", async () => {
  const { isMathOrDiagramSegment, detectLatexAndMathProtection } = await import(
    "./forensicEngine"
  );

  // 1. Standalone Unicode math variables and Greek letters (\alpha, \rho, \nu) in equations
  // must NOT trigger adversarial homoglyph evasion
  const mathEquationText =
    "Let \u{1D453}(\u{1D465}) = \u03B1\u{1D465}^2 + \u03C1_1 \u{1D466} - \u03BD \u2211_{i=1}^{n} x_i = 0.";
  const sanitizedMath = sanitizeAndTrapAdversarial(mathEquationText);
  assert.equal(
    sanitizedMath.evasionFlagTriggered,
    false,
    "Standalone math variables and Greek letters should not trigger adversarial evasion"
  );

  // 2. TikZ diagram and equation segments are recognized as non-prose math/diagram segments
  const tikzSegment =
    "\\begin{tikzpicture} \\node (A) at (0,0) {$x_1 \\to y_1$}; \\draw[->] (A) -- (B); \\end{tikzpicture}";
  assert.equal(isMathOrDiagramSegment(tikzSegment), true);
  assert.equal(isMathOrDiagramSegment(mathEquationText), true);

  // 3. PDF compiled with pdfTeX / LaTeX triggers LaTeX/Math protection
  const latexGuard = detectLatexAndMathProtection(
    `${tikzSegment}\n\n${mathEquationText}`,
    "pdfTeX-1.40.25",
    "LaTeX with hyperref and TikZ"
  );
  assert.equal(latexGuard.isLatexCompiler, true);
  assert.equal(latexGuard.latexMathProtected, true);
});

test("AI-generated paper containing LaTeX equations and TikZ diagrams retains ~85%+ AI score and highlights AI prose while exempting equations", async () => {
  const { evaluateTextSubmission } = await import("./submissionEvaluator");

  const aiProsePara1 =
    "Furthermore, the optimization framework demonstrates that stochastic gradient descent converges rapidly under standard convexity assumptions (2024). Moreover, the comprehensive architectural paradigm provides a transformative approach to modern neural network regularization across diverse computational environments. Consequently, leveraging adaptive learning rate schedules significantly enhances model stability and overall generalization performance.";
  const latexEquation =
    "$$L(\\theta) = \\frac{1}{N} \\sum_{i=1}^{N} \\mathcal{L}(f(x_i; \\theta), y_i) + \\lambda \\|\\theta\\|_2^2$$";
  const aiProsePara2 =
    "Additionally, empirical evaluations across multiple benchmark datasets underscore the pivotal role of spectral normalization in fostering robust representation learning. Specifically, this multifaceted methodology ensures that the underlying feature space maintains optimal conditioning throughout the training process. Therefore, the resulting framework seamlessly integrates theoretical convergence guarantees with practical scalability.";
  const tikzDiagram =
    "\\begin{tikzpicture} \\node (X) at (0,0) {$x_i$}; \\node (H) at (2,0) {$h_i = \\sigma(Wx_i + b)$}; \\draw[->] (X) -- (H); \\end{tikzpicture}";
  const aiProsePara3 =
    "Overall, it is important to remember that these experimental results provide a comprehensive foundation for future research in automated optimization systems. Notably, the consistent improvements observed across all evaluation metrics demonstrate the essential nature of structured regularization in contemporary deep learning applications.";

  const mixedAiPaperWithMath = [
    aiProsePara1,
    latexEquation,
    aiProsePara2,
    tikzDiagram,
    aiProsePara3,
  ].join("\n\n");

  const evaluation = evaluateTextSubmission(
    mixedAiPaperWithMath,
    "AI_Paper_With_LaTeX.tex"
  );

  // 1. Overall AI score must remain high (~80%-90% AI, Tier 2 Likely Synthetic) — NOT dropped to 20%!
  assert.ok(
    evaluation.report.overall_verdict.aggregate_score >= 0.78,
    `Expected AI paper with LaTeX equations to score >= 0.78, got ${evaluation.report.overall_verdict.aggregate_score}`
  );
  assert.equal(evaluation.report.overall_verdict.tier_label, "Likely Synthetic");

  // 2. Preview AI Detection must highlight the 3 AI-generated prose paragraphs
  assert.equal(
    evaluation.report.highlighted_spans.length,
    3,
    `Expected all 3 AI prose paragraphs to be highlighted, got ${evaluation.report.highlighted_spans.length}`
  );

  // 3. Neither the LaTeX equation nor the TikZ diagram should be highlighted as AI
  for (const span of evaluation.report.highlighted_spans) {
    assert.ok(!span.text_segment.includes("\\begin{tikzpicture}"));
    assert.ok(!span.text_segment.includes("\\sum_{i=1}^{N}"));
  }
});

test("NCERT textbooks, legal documents, and committee-edited formal educational prose are protected from false positives", async () => {
  const { evaluateTextSubmission } = await import("./submissionEvaluator");

  const ncertAndFalsePositivePassage = `The "False Positive" Problem
Academic papers, legal documents, and official textbooks are the most common victims of false positives in AI detectors. In fact, multiple linguistic studies have shown that text written by non-native English speakers or highly formalized educational text is regularly misclassified as machine-generated simply because it follows strict rules of clarity and grammar.
NCERT books are meticulously drafted, reviewed, and edited by committees of human professors, subject matter experts, and researchers over months of collaborative work. In Chapter 4 (Activity 4.2 and Fig. 4.3), let us recall how standard curriculum chapters explain foundational principles using clear declarative grammar so students across diverse linguistic backgrounds can understand each concept without ambiguity.`;

  const evaluation = evaluateTextSubmission(
    ncertAndFalsePositivePassage,
    "NCERT_Textbook_Reference.txt"
  );

  assert.equal(evaluation.report.overall_verdict.tier, 0);
  assert.equal(evaluation.report.overall_verdict.tier_label, "Human-Consistent");
  assert.ok(
    evaluation.report.overall_verdict.aggregate_score < 0.35,
    `Expected NCERT/formal textbook passage to be Human-Consistent (<0.35), got ${evaluation.report.overall_verdict.aggregate_score}`
  );
  assert.equal(evaluation.report.highlighted_spans.length, 0);
});

test("inspectBinaryC2PABoxes rejects spoofed ASCII 'c2pa OpenAI' strings and requires authentic ISO 19566-5 JUMBF boxes", async () => {
  const { inspectBinaryC2PABoxes } = await import("./statisticalModels");

  // 1. Forged EXIF/comment string containing "c2pa OpenAI trainedAlgorithmicMedia" without binary JUMBF structure
  const forgedBytes = new TextEncoder().encode(
    "Exif\0\0Comment: c2pa OpenAI trainedAlgorithmicMedia jumb forged header"
  );
  const forgedResult = inspectBinaryC2PABoxes(forgedBytes);
  assert.equal(
    forgedResult.validJumbfBoxFound,
    false,
    "Plain ASCII 'c2pa OpenAI' string must NOT be accepted as a verified C2PA JUMBF manifest"
  );
  assert.equal(forgedResult.unauthenticatedTextCommentDetected, true);

  // 2. Authentic binary ISO 19566-5 'jumd' box with 16-byte C2PA UUID + 'c2ma' + 'c2cs' COSE_Sign1 box
  const validPacket = new Uint8Array(128);
  // Box 1 at offset 0: length = 32 (0x00000020), FourCC = 'jumd' (0x6A,0x75,0x6D,0x64), followed by 16-byte C2PA UUID
  validPacket.set(
    [
      0x00, 0x00, 0x00, 0x20,
      0x6a, 0x75, 0x6d, 0x64,
      0x63, 0x32, 0x70, 0x61, 0x00, 0x11, 0x00, 0x10,
      0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71,
    ],
    0
  );
  // Box 2 at offset 32: length = 16, FourCC = 'c2ma'
  validPacket.set([0x00, 0x00, 0x00, 0x10, 0x63, 0x32, 0x6d, 0x61], 32);
  // Box 3 at offset 48: length = 24, FourCC = 'c2cs' + "OpenAI"
  validPacket.set(
    [
      0x00, 0x00, 0x00, 0x18,
      0x63, 0x32, 0x63, 0x73,
      0x4f, 0x70, 0x65, 0x6e, 0x41, 0x49,
    ],
    48
  );

  const validResult = inspectBinaryC2PABoxes(validPacket);
  assert.equal(validResult.validJumbfBoxFound, true);
  assert.equal(validResult.coseSignatureBoxFound, true);
  assert.equal(validResult.claimBoxFound, true);
  assert.ok(validResult.issuerAuthority?.includes("OpenAI"));
});

test("compute1DFFT executes exact invertible Radix-2 Cooley-Tukey Fast Fourier Transform", async () => {
  const { compute1DFFT } = await import("./statisticalModels");

  const N = 16;
  const original = Float64Array.from({ length: N }, (_, i) =>
    Math.sin((2 * Math.PI * 2 * i) / N) + 0.5 * Math.cos((2 * Math.PI * 5 * i) / N)
  );
  const re = Float64Array.from(original);
  const im = new Float64Array(N);

  // Forward FFT
  compute1DFFT(re, im, false);
  // Frequency bin k=2 and k=5 must carry non-zero spectral energy
  const powerBin2 = re[2] * re[2] + im[2] * im[2];
  const powerBin3 = re[3] * re[3] + im[3] * im[3];
  assert.ok(powerBin2 > 10, `Expected strong spectral peak at harmonic k=2, got ${powerBin2}`);
  assert.ok(powerBin3 < 1e-9, `Expected zero energy at non-harmonic k=3, got ${powerBin3}`);

  // Inverse FFT must reconstruct the original time-domain signal
  compute1DFFT(re, im, true);
  for (let i = 0; i < N; i++) {
    assert.ok(Math.abs(re[i] - original[i]) < 1e-9);
  }
});

test("evaluateDocxExportGuard emits informational EXTERNAL_PASTE_DETECTED (severity 'low') rather than synthetic AI proof", () => {
  const pastedDraftResult = evaluateDocxExportGuard({
    authorToolSignature: "Microsoft Office Word",
    totalDistinctRsids: 1,
    wordCount: 950,
    dominantRsid: "004A1B2C",
    dominantRsidShare: 98.4,
    editingDurationMinutes: 1,
  });

  assert.equal(pastedDraftResult.rsidTestStatus, "APPLICABLE");
  // Must NOT emit critical or medium AI proof flags that falsely convict external draft pastes
  assert.equal(
    pastedDraftResult.flags.some((f) => f.severity === "critical"),
    false
  );
  const externalPasteFlag = pastedDraftResult.flags.find(
    (f) => f.flag_code === "EXTERNAL_PASTE_DETECTED"
  );
  assert.ok(externalPasteFlag, "Expected EXTERNAL_PASTE_DETECTED flag");
  assert.equal(externalPasteFlag?.severity, "low");
  assert.equal(
    externalPasteFlag?.description,
    "The document contains monolithic insertion. This indicates text was written in an external editor or pasted from a separate source. It does not determine whether the source was human or synthetic."
  );
});

test("computeConformalCalibration & verifyBinaryC2PAProvenanceAsync compute calibrated p-values and real SHA-256 payload digests", async () => {
  const {
    computeConformalCalibration,
    verifyBinaryC2PAProvenanceAsync,
    applyHighPassLaplacianFilter,
  } = await import("./statisticalModels");

  // 1. Conformal calibration p-value must separate human high-entropy baseline from low-perplexity synthetic text
  const humanCal = computeConformalCalibration(54.0, 0.55, 2.25);
  const synthCal = computeConformalCalibration(14.5, 0.18, 1.35);
  assert.ok(
    humanCal.conformalPValue > synthCal.conformalPValue,
    `Expected human conformal p-value (${humanCal.conformalPValue}) > synthetic (${synthCal.conformalPValue})`
  );
  assert.ok(synthCal.conformalPValue <= 0.05);

  // 2. High-pass 3x3 Laplacian filter zeroes out constant DC planes and highlights stride edges
  const flatGrid = new Float64Array(16).fill(120);
  const filteredFlat = applyHighPassLaplacianFilter(flatGrid, 4);
  assert.equal(filteredFlat[5], 0);

  // 3. Async C2PA SHA-256 verification computes a 64-hex-char SHA-256 digest of the payload
  const sampleBytes = new Uint8Array(64).fill(0x42);
  const c2paAsync = await verifyBinaryC2PAProvenanceAsync(sampleBytes);
  assert.equal(c2paAsync.computedAssetSha256Hex.length, 64);
});

test("matchAiGeneratorKeywords and image forensics detect AI generator text and identify synthetic spectral anomalies", async () => {
  const { matchAiGeneratorKeywords, analyzeUploadedImageForensics } = await import("./containerForensics");
  const { computeReference2DFFTProfile, compute2DAzimuthalPowerSpectrum } = await import("./statisticalModels");

  // 1. Keyword pattern matcher on OCR extracted text / metadata
  const ocrSnippets = [
    "Created with Midjourney v6.0 for presentation",
    "Generated by ChatGPT (DALL-E 3) on Nov 2026",
    "Model: Stable Diffusion XL 1.0; prompt: futuristic classroom",
    "Adobe Firefly Generative Fill applied to poster",
    "Bing Image Creator asset for science project",
    "Illustration from Crayion AI",
    "Character design NovelAI anime diffusion",
    "ComfyUI workflow output node 42",
  ];

  for (const snippet of ocrSnippets) {
    const res = matchAiGeneratorKeywords(snippet);
    assert.equal(res.matched, true, `Expected match for snippet: "${snippet}"`);
    assert.ok(res.keyword, "Expected matched keyword to be populated");
    assert.ok(res.confidence >= 0.90, "Expected high confidence");
  }

  // Baseline clean text must NOT trigger AI keyword match
  const cleanSnippet = "Student research poster on photosynthetic rates in Arabidopsis thaliana under varied LED wavelengths.";
  const cleanRes = matchAiGeneratorKeywords(cleanSnippet);
  assert.equal(cleanRes.matched, false);
  assert.equal(cleanRes.keyword, null);

  // 2. 2D FFT notch filtering and synthetic spectral upsampling anomaly detection
  // Natural photo simulation:
  const naturalProfile = computeReference2DFFTProfile(false);
  assert.ok(
    naturalProfile.spectralSlope >= 1.8 && naturalProfile.spectralSlope <= 2.2,
    `Natural slope should be ~2.0, got ${naturalProfile.spectralSlope}`
  );
  assert.equal(naturalProfile.highFreqAnomaly, false);
  assert.ok(
    naturalProfile.conformalAnomalyPValue > 0.05,
    `Natural photo should have non-significant anomaly p-value, got ${naturalProfile.conformalAnomalyPValue}`
  );

  // Synthetic diffusion upsampling simulation:
  const syntheticProfile = computeReference2DFFTProfile(true);
  assert.ok(
    syntheticProfile.harmonicResidualVariance > naturalProfile.harmonicResidualVariance,
    `Synthetic residual variance (${syntheticProfile.harmonicResidualVariance}) should exceed natural (${naturalProfile.harmonicResidualVariance})`
  );
  assert.equal(syntheticProfile.highFreqAnomaly, true);
  assert.ok(
    syntheticProfile.conformalAnomalyPValue <= 0.05,
    `Synthetic upsampling should trigger low conformal p-value (<= 0.05), got ${syntheticProfile.conformalAnomalyPValue}`
  );

  // 3. analyzeUploadedImageForensics with OCR extracted text flags AI_GENERATOR_TEXT_DETECTED
  const fakeFile = new File([new Uint8Array(256)], "poster_presentation.jpg", { type: "image/jpeg" });
  const imgAnalysis = await analyzeUploadedImageForensics(fakeFile, "Final poster created using ChatGPT & DALL-E 3");
  assert.ok(imgAnalysis.flags.some((f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED"));
  const aiTextFlag = imgAnalysis.flags.find((f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED");
  assert.equal(aiTextFlag?.severity, "critical");
  assert.equal(imgAnalysis.anomalyDetected, true);
  assert.ok(imgAnalysis.aiKeywordTracesDetected);
});

test("evaluateFileSubmission routes image submissions to Tier 1, Tier 2, or Tier 0 based on 4-Tier multimodal forensics", async () => {
  const { evaluateFileSubmission } = await import("./submissionEvaluator");

  // Case A: Clean camera photo without C2PA or AI text -> routes to Tier 0 (Human-Consistent)
  const cleanImageFile = new File([new Uint8Array(512)], "field_study_photo.jpg", { type: "image/jpeg" });
  const cleanSubmission = await evaluateFileSubmission(cleanImageFile);

  assert.equal(cleanSubmission.report.overall_verdict.tier, 0);
  assert.equal(cleanSubmission.report.overall_verdict.tier_label, "Human-Consistent");
  assert.ok(cleanSubmission.report.overall_verdict.summary_justification.includes("Tier 0 Human-Consistent"));
  assert.ok(!cleanSubmission.report.document_metadata_forensics.flags.some((f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED"));

  // Case B: Stripped AI poster containing generator keywords in filename/metadata -> routes to Tier 2 (Corroborated Anomaly / Likely AI)
  const aiPosterFile = new File([new Uint8Array(512)], "science_fair_chatgpt_dalle_poster.jpg", { type: "image/jpeg" });
  const aiPosterSubmission = await evaluateFileSubmission(aiPosterFile);

  assert.ok(
    aiPosterSubmission.report.overall_verdict.tier >= 2,
    `Expected Tier >= 2, got Tier ${aiPosterSubmission.report.overall_verdict.tier}`
  );
  assert.ok(
    aiPosterSubmission.report.document_metadata_forensics.flags.some(
      (f) => f.flag_code === "AI_GENERATOR_TEXT_DETECTED"
    )
  );
  assert.ok(
    aiPosterSubmission.report.overall_verdict.summary_justification.includes("Tier 2 Corroborated Anomaly")
  );
  assert.ok(
    aiPosterSubmission.documentText.includes("Tier 2: Corroborated Anomaly (Likely AI)")
  );

  // Case C: Simulated C2PA image with authentic ISO 19566-5 binary boxes -> routes to Tier 1 (Proven Synthetic / Conclusive Provenance)
  const validPacket = new Uint8Array(128);
  // Box 1 at offset 0: length = 32 (0x00000020), FourCC = 'jumd' (0x6A,0x75,0x6D,0x64), followed by 16-byte C2PA UUID
  validPacket.set(
    [
      0x00, 0x00, 0x00, 0x20,
      0x6a, 0x75, 0x6d, 0x64,
      0x63, 0x32, 0x70, 0x61, 0x00, 0x11, 0x00, 0x10,
      0x80, 0x00, 0x00, 0xaa, 0x00, 0x38, 0x9b, 0x71,
    ],
    0
  );
  // Box 2 at offset 32: length = 16, FourCC = 'c2ma'
  validPacket.set([0x00, 0x00, 0x00, 0x10, 0x63, 0x32, 0x6d, 0x61], 32);
  // Box 3 at offset 48: length = 24, FourCC = 'c2cs' + "OpenAI"
  validPacket.set(
    [
      0x00, 0x00, 0x00, 0x18,
      0x63, 0x32, 0x63, 0x73,
      0x4f, 0x70, 0x65, 0x6e, 0x41, 0x49,
    ],
    48
  );

  const c2paImageFile = new File([validPacket], "certified_dalle3_c2pa.jpg", { type: "image/jpeg" });
  const c2paSubmission = await evaluateFileSubmission(c2paImageFile);

  assert.equal(c2paSubmission.report.image_forensics?.c2pa_manifest_present, true);
  assert.ok(
    c2paSubmission.report.overall_verdict.tier >= 1,
    `Expected Tier >= 1, got Tier ${c2paSubmission.report.overall_verdict.tier}`
  );
  assert.ok(
    c2paSubmission.report.overall_verdict.summary_justification.includes("Tier 1 Conclusive Provenance")
  );
  assert.ok(
    c2paSubmission.documentText.includes("Tier 1: Proven Synthetic")
  );
});



