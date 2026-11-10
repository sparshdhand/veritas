# Development Log: AI Detection School Project (Veritas Forensic)

## 2026-11-10 04:10 — Release v1.2.0 Packaging: macOS & Windows Installers Ready
- **Release Version**: `1.2.0` (Major Internal Overhaul).
- **macOS Build**:
  - `dist-installers/macos/Veritas.app` (`224.2 MB`)
  - `dist-installers/macos/Veritas_1.2.0_aarch64.dmg` (`218.7 MB`)
- **Windows Build**:
  - Compiled via GitHub Actions Windows runner (`#42699947128`).
  - Bundled offline neural models (ModernBERT ONNX + RoBERTa ONNX) and WebAssembly runtimes.
  - `dist-installers/windows/nsis/Veritas_1.2.0_x64-setup.exe` (`218.3 MB`)
  - `dist-installers/windows/msi/Veritas_1.2.0_x64_en-US.msi` (`217.0 MB`)
- **Store & Colab Delivery**:
  - Microsoft Store compliance and privacy disclosures completed (`docs/store/`).
  - Google Colab collaborative notebook published (`colab/veritas_colab_launcher.ipynb`).

## 2026-11-10 02:18 — DOCX Forensic Verification & Citation Regex Hardening
- **Root Cause of DOCX Misclassification (`High-Taste Video Editing Harness Architecture.docx`)**:
  - The document contained code tuples/arrays (e.g. `[0, 1]`, `[3, 2, 2]`) which were matching an overly broad `\[\d+\]` citation regex.
  - Accompanied by tool citations and statistical terminology (`"standard deviation"`), this falsely triggered `academicProtectionVeto`, capping the score at 0.32 (Human).
- **Hardening & Fix**:
  - Hardened `detectAcademicPeerReviewProtection` in `src/utils/forensicEngine.ts` to require genuine author-year parenthetical citations (e.g. `(Author, Year)`) paired with a dedicated bibliography (`References` / `Bibliography`) or qualitative participant transcripts.
  - Stripped single incidental code brackets from academic citation counts.
- **Verification Results**:
  - `High-Taste Video Editing Harness Architecture.docx` now correctly evaluates as **Tier 2 · Likely Synthetic** (`0.79` aggregate synthetic probability, `0` ESL override, `academicProtectionVeto = false`).
  - Generated **539 synchronized AI highlighted spans** in the document preview.
  - Zero false-positive regressions on true academic papers (Mariusz Kruk 2017 paper remains protected at **Tier 0 · Human-Consistent (0.32)**).
  - Graphify knowledge graph updated and verified (12,730 nodes, 26,420 edges, 778 communities).

## 2026-11-10 01:44 — ModernBERT ONNX Model Migration & Academic Rule Calibration
- **Model Upgrade**:
  - Downloaded and bundled quantized ModernBERT ONNX weights (`public/models/modernbert-detector/` ~144MB, 8,192-token context window) from `onnx-community/modernbert-ai-detection-raid-mage-ONNX`.
  - Updated `src/utils/localNeuralClassifier.ts` to prioritize ModernBERT in offline inference, with automated fallback to RoBERTa.
  - Successfully mapped ModernBERT labels (`LABEL_1 = Synthetic/AI`, `LABEL_0 = Human/Real`).
  - Verified on modern LLM outputs (GPT-4o/Claude): modern AI text is detected at ~88.7% AI (where RoBERTa falsely scored 99.8% Human).
- **Academic Heuristic Calibration**:
  - Tightened `detectAcademicPeerReviewProtection()` in `src/utils/forensicEngine.ts` to require authentic author-year in-text citations (`(Author, Year)` or `[1]`) rather than surface-level terminology or formulas.
  - Retained strict zero-network execution (100% offline).
- **Verification**:
  - All 18 unit tests in `src/utils/forensicEngine.test.ts` passing.
  - Production build passing cleanly.
  - Graphify knowledge graph synchronized (12,729 nodes, 26,419 edges, 776 communities).

## 2026-11-10 01:13 — Forensic Pipeline Root-Cause Audit: Academic False Positive Diagnosis
- **Investigation Objective**:
  - Investigated catastrophic false positive where a 100% human-authored peer-reviewed research paper (*"A look at advanced learners' use of mobile devices for English language study: Insights from interview data"* by Mariusz Kruk, EUROCALL Review 2017) was flagged by Veritas Forensic as **92% AI (Likely Synthetic)**.
- **Identified Pipeline Failure Modes & Architectural Flaws**:
  1. **Disabling Protective Veto on Long Documents (`wordCount < 1200`)**:
     - `src/utils/submissionEvaluator.ts` hardcoded an arbitrary ceiling: `formalRefCheck.formalReferenceProtected && stylometrics.wordCount < 1200`.
     - *Flaw*: Genuine academic articles, dissertations, and student research papers are 3,000–8,000+ words. The moment a full paper is submitted, its protection is stripped away.
     - *Inconsistency*: Formal/textbook protection was never invoked in `evaluateFileSubmission()` for `.pdf` or `.docx` files, leaving file uploads unprotected.
  2. **Artificial "Metadata-Absent Downgrade" Score Clamping (`0.88 - 0.93`)**:
     - In `synchronizeAggregateScore()`, if a submission lacked OpenXML DOCX revision tracking (`rsidR`) or C2PA, high aggregate probabilities were forced into `Math.min(0.93, Math.max(0.88, score))`.
     - *Flaw*: Flattened academic PDFs or pasted text are artificially forced to ~91% AI (Tier 2) instead of being evaluated neutrally or bounded by institutional error margins.
  3. **Penalizing Academic Rigor as Machine Generation**:
     - Disciplined human scholarship relies on standardized transitions (*"taking into consideration"*, *"statistically significant"*), which inflate GLTR Top-10 predictability.
     - Balanced, controlled sentence lengths in academic prose suppress sentence burstiness variance.
     - The Bayesian log-odds fusion aggregates these collinear stylometric signals without recognizing human academic apparatus.
  4. **Absence of Academic / Bibliographic Apparatus Protection**:
     - The engine lacks recognition for in-text parenthetical citations (APA/IEEE like `(Holec, 1981, p. 3)` or `[1]`), qualitative interview markers (`S10:`, `Participant 3:`), and research methodology sections.
  5. **Model Evaluation & Context Window Limitation**:
     - Current `roberta-base-openai-detector` (125M params, 512-token context) has an ~61% false-positive rate on L2/formal academic English. Evaluated `rasbt/ai-text-detector-modernbert` (149M, 8,192-token context) as candidate replacement; ruled out `qwen3-0.6b` due to excessive RAM pressure.
- **Remediation Roadmap**:
  - Remove `< 1200` word ceiling on formal reference protections.
  - Remove artificial 88%–93% score clamp from metadata-absent downgrade rule.
  - Implement `detectAcademicPeerReviewProtection()` detecting APA/IEEE citations, qualitative transcripts, and empirical research apparatus across text, PDF, and DOCX pipelines.
  - Upgrade neural classifier to ModernBERT ONNX.

## UI Redesign & Impeccable Live Refinement (2026-11-06)
- **Status**: Completed full studio workbench unification and interactive browser refinements.
- **Key Enhancements**:
  1. **Single Unified 16:9 Studio Surface**:
     - Removed multi-page routing and detached landing view; application boots directly into the live forensic analysis station.
  2. **Warm Limestone & Archival Palette**:
     - Styled with archival paper background (`#F4F1EA`), warm desk surfaces (`#FAF8F4`), and deep Prussian blue (`#0F3B5F`) contrast. Stark white glare and dark mode completely removed.
  3. **Floating Top Navigation**:
     - Converted into an extended floating capsule pill (`max-w-[96rem]`) with the minimal **Veritas** brand mark and streamlined **Upload** action.
  4. **Multi-Layered Forensic Target Ring Aperture**:
     - Built rotating dashed radar orbit ring with animated scanning stages.
     - Cleaned direct manuscript text paste button ("Paste Manuscript Text Directly").
  5. **Judicial Adjudication Certificate**:
     - Cleaned up right rail with a high-impact score display (`text-6xl`), subordinate diagnostic signal accordion, and active veto safeguard indicators.
     - Removed redundant "Generate Institutional Hearing Dossier" CTA button per user request.
  6. **Impeccable Quality Verification**:
     - Executed `/impeccable polish`, `/impeccable distill`, and `/impeccable clarify`.
     - Fixed off-ramp font sizes in manuscript reader (`text-base`).
     - Passed mechanical design detector (`.agents/skills/impeccable/scripts/impeccable detect`) with 0 warnings.
  7. **Codebase Health**:
     - `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build`) passing with zero errors.

## 2026-11-08 09:15 — Multi-Agent Panel Debate on Defensible AI Image Forensics
- Convened 5-member expert research panel using `superpowers:panel-debate`.
- Evaluated physical sensor PRNU, CFA demosaicing, and 2D-FFT azimuthal radial decay P(f_r) ~ f_r^-alpha.
- Analyzed VAE downsampling bottlenecks (f=8, 16), Flow Matching (Flux.1), and DIRE vs. contrastive probes.
- Investigated ISO/IEC 19566-5 JUMBF, C2PA COSE_Sign1 envelopes, and invisible watermarks (SynthID, Tree-Ring).
- Established legal admissibility under Daubert / FRE 702 and formulated the 4-Tier Institutional Adjudication Protocol with Conformal Prediction error bounds (alpha <= 0.01).
- Executed full counter-forensics red team audit covering donor PRNU grafting, 1/f^2 slope whitening, and LMS metadata scrubbing.
- Artifact generated: ai-image-detection-panel-debate.md.

## 2026-11-08 10:31 — Multimodal Image Forensics Implementation
- Integrated research panel recommendations from ai-image-detection-panel-debate.md.
- Added JPEG-block 8x8 notch filter in 2D FFT azimuthal radial power spectrum calculation.
- Implemented Tesseract OCR invariant endpoint (/api/forensics/image-ocr) to catch visual AI generator watermarks and prompt strings on stripped web images.
- Implemented 4-Tier Adjudication routing for images: Tier 1 (C2PA/JUMBF cryptographic proof), Tier 2 (Corroborated Anomaly via OCR & 2D FFT), Tier 0 (Human-Consistent).
- Updated WorkspaceView teacher banner to display clear, plain-language adjudication outcome.

## 2026-11-08 10:33 — PWA & Auto-Update Service Worker Implementation
- Configured Web App Manifest (`public/manifest.json`) with standalone window mode and brand theme colors (#0F3B5F / #F4F1EA).
- Generated 192x192 and 512x512 PWA icons in `public/`.
- Implemented Network-First auto-updating Service Worker (`public/sw.js`) with `self.skipWaiting()` and `clients.claim()`.
- Registered client-side controllerchange event in `src/main.tsx` so when updates are deployed, the user automatically gets the latest build without requiring a manual hard-refresh.
- Successfully verified production build (`vite build`).

## 2026-11-09 21:28 — Dual-Window Dia Architecture, HazeOver Dimming & Cross-Platform Releases (/stable)
- **Decoupled Dual-Window Intro Architecture (Dia Pattern)**:
  - Configured native decoupled windows in `src-tauri/tauri.conf.json`:
    - `main`: `visible: false` by default, keeping the primary workspace window dormant on application startup.
    - `intro`: `visible: true`, `decorations: false`, `transparent: true`, `shadow: false`, `alwaysOnTop: true`.
  - Added dedicated multi-page Vite entry point (`intro.html` & `src/intro.tsx`) with transparent root wrapper (`background: rgba(0, 0, 0, 0) !important`).
  - Added native window swapping command (`show_main_window`) in `src-tauri/src/main.rs`.
- **HazeOver Backdrop Dimming**:
  - Dynamically sized the intro window to the user's primary monitor resolution upon launch (`set_size` and `set_position(0, 0)`).
  - Implemented full-screen darkened backdrop (`fixed inset-0 bg-black/45 backdrop-blur-[2px]`) with spotlight emphasis on the central Veritas institutional card.
  - Smooth fade-out and seamless reveal of the main workbench upon completion or pressing <kbd>Esc</kbd>.
- **Initial Launch Persistence Guard**:
  - App inspects persistent flag `.intro_seen` in local app data directory (`~/Library/Application Support/com.veritas.forensic/` on macOS and `%APPDATA%\com.veritas.forensic\` on Windows).
  - If flag is present, intro window closes immediately and workbench displays instantly.
- **Cross-Platform Release Artifacts**:
  - Compiled and verified macOS DMG: `dist-installers/macos/Veritas_1.0.0_aarch64.dmg` (112.3 MB).
  - Automated Windows build on GitHub Actions (Run #42642043723) and verified standalone installer: `dist-installers/windows/nsis/Veritas_1.0.0_x64-setup.exe` (111.4 MB) and MSI: `dist-installers/windows/msi/Veritas_1.0.0_x64_en-US.msi` (111.3 MB).
  - Verified 100% offline neural weights (RoBERTa ONNX) embedded inside both binaries with zero external network dependency.

## 2026-11-09 13:56 — Windows Desktop Port (Tauri v2) & Offline RoBERTa Neural Model Packaging
- Ported application to standalone offline Windows desktop application (`.exe` / `.msi`) via Tauri v2.
- Preserved identical React 19 UI, dark forensic styling, KaTeX equation parsing, and PDF split-pane viewer.
- Integrated quantized ONNX RoBERTa OpenAI detector (`model_quantized.onnx`, ~120MB) and ONNX WebAssembly runtime locally in `public/models/roberta-detector/` and `public/wasm/`.
- Updated `src/utils/localNeuralClassifier.ts` and `src/utils/submissionEvaluator.ts` to perform in-app offline neural inference without external server calls.
- Built automated GitHub Actions CI/CD workflow (`.github/workflows/build-windows.yml`) cross-compiling x86_64 NSIS `.exe` and WiX `.msi` installers.
- Generated `Veritas_1.0.0_x64-setup.exe` (111MB) and verified full model embedding.
- Non-stable backup created at `.ai-context/backups/backup_20261109_135633`.

## 2026-11-08 17:21 — Cloudflare Pages Deployment & Live UI Simplification (/stable)
- **UI Streamlining via Impeccable Live**:
  - Removed subordinate diagnostic signal details accordion to de-clutter the adjudication column.
  - Cleaned redundant conformal p-value subtext beneath the aggregate score gauge.
  - Removed top navigation Dossier button.
  - Successfully finalized carbonize cleanup with zero orphaned markers.
- **Cloudflare Infrastructure & MCP**:
  - Registered Cloudflare MCP (`https://mcp.cloudflare.com/mcp`) and Documentation MCP (`https://docs.mcp.cloudflare.com/mcp`) into `~/.gemini/config/mcp_config.json`.
  - Configured `wrangler.json` for Cloudflare Pages deployment.
  - Deployed `veritas-forensic` to Cloudflare Pages (`https://veritas-forensic.pages.dev`).
  - Added `"deploy"` script to `package.json`.
- **Knowledge Graph & Backups**:
  - Ran `graphify update` and verified knowledge graph (6,851 nodes, 15,094 edges, 377 communities).
  - Snapshot `backup_stable_20261108_172130` created and marked stable in `registry.json`.
- Calibrated Tier 2 requirement to necessitate affirmative generator proof (C2PA JUMBF manifest, EXIF software generator tags, or OCR-detected AI generator branding like ChatGPT/Midjourney).
- Verified: Baby screenshot evaluates cleanly as Tier 0 (Human-Consistent), while AI-generated posters evaluate as AI-Generated.
