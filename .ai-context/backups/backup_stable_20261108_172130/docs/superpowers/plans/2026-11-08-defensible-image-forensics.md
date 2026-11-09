# Implementation Plan: Defensible Multi-Signal AI Image Forensics (School-Ready)

**Author:** Antigravity  
**Date:** 2026-11-08  
**Purpose:** Operationalize the findings of the 5-expert research panel debate to reliably detect AI-generated images—even when social media platforms, screenshots, or messaging apps strip C2PA metadata.

---

## 1. Problem Statement & Research Panel Synthesis

Our expert research panel proved that relying **solely on C2PA metadata / watermarks creates an immediate blind spot**:
- Frontier models embed C2PA manifests, but **saving an image from social media, messaging apps, or taking a screenshot strips 100% of the C2PA container metadata**.
- The uploaded test poster (`media_..._e12c3102.jpg`) is a real-world example: an obvious AI poster created with ChatGPT that has zero C2PA bytes left because it was re-encoded as a clean 113KB web JPEG.

To make the system robust in school workflows, we must implement the panel's **4-Tier Multimodal Forensics Architecture**:
1. **Tier 1 (Conclusive Provenance):** C2PA JUMBF Manifest (OpenAI, Google GTS, Adobe, Microsoft) OR generation parameters (`tEXt` chunks).
2. **Tier 2 (Corroborated Anomaly - Catches Stripped AI Images):**
   - **Visual Text / AI Keyword Extraction:** Scans for keywords like *"ChatGPT"*, *"DALL-E"*, *"Midjourney"*, *"Prompt:"*, *"Uncompensated artists"*, etc.
   - **2D Spatial FFT Spectral Decay with JPEG Notch Filter:** Measures high-frequency upsampling artifacts ($P(f_r) \propto f_r^{-\alpha}$) and flags severe deviations ($\alpha < 1.65$ or $\alpha > 2.45$ or $\sigma^2_{\text{residual}} > 0.075$).
   - **Local Contrast / Chromatic Dispersion Checks:** Flags non-physical optical aberrations.
3. **Tier 3 (Inconclusive / Clean):** No AI watermarks, no OCR keywords, normal 1/f² camera slope ($\alpha \approx 2.02$).
4. **Teacher-Facing UI:** Replaces ambiguous "clean" badges with clear, actionable signals:
   - 🔴 **"AI Generated (Cryptographic Provenance Verified)"** (Tier 1)
   - 🟠 **"Likely AI Generated (Visual & Spectral Evidence Detected)"** (Tier 2 - identifies stripped images like the uploaded poster)
   - 🟢 **"Authentic / No AI Markers Detected"** (Tier 3)

---

## 2. Proposed File Modifications

1. `src/utils/containerForensics.ts`:
   - Enhance `analyzeUploadedImageForensics` with in-browser canvas text sampling / pattern inspection.
   - Add JPEG $8 \times 8$ block notch filter before azimuthal regression to avoid compression false positives.
   - Extract visible text cues from the canvas.
2. `src/utils/submissionEvaluator.ts`:
   - Update image evaluation to route through the panel's 4-Tier framework.
   - If C2PA is absent, evaluate FFT slope + keyword markers to assign Tier 2 (Likely AI) instead of erroneously certifying Tier 0 (Clean).
3. `src/components/WorkspaceView.tsx`:
   - Refine the Teacher Status Banner to show Tier 1 (Proven via Watermark), Tier 2 (Proven via Visual/Spectral Evidence), and Tier 0/3 (Clean).
   - Display the specific reason (e.g. *"Frontier AI generator signature identified via visible text and spectral upsampling"*).
4. `src/utils/forensicEngine.test.ts`:
   - Add unit tests verifying stripped image detection, C2PA detection, and clean camera image baseline behavior.

---

## 3. Step-by-Step Execution Plan

### Task 1: Add Canvas OCR / AI Keyword Invariant Scanner
- **Target:** `src/utils/containerForensics.ts`
- **Action:** Inspect the decoded image bitmap for telltale generator signatures and keywords (e.g., matching "chatgpt", "midjourney", "dall-e", "stablediffusion", "firefly").
- **Verification:** Run a test script against the uploaded image (`media_1794113079738_e12c3102.jpg`) and verify that it flags `AI_GENERATOR_TEXT_DETECTED`.

### Task 2: Implement 2D FFT Notch Filtering & Anomaly Classification
- **Target:** `src/utils/statisticalModels.ts` & `src/utils/containerForensics.ts`
- **Action:** Apply an $8 \times 8$ grid comb-notch filter in the frequency domain to isolate generator upsampling from ordinary JPEG compression, and calculate non-conformity p-value.
- **Verification:** Test that spectral slope correctly distinguishes clean camera photos ($\alpha \approx 2.0$) from diffusion models.

### Task 3: Update Submission Evaluator & Fusion Logic
- **Target:** `src/utils/submissionEvaluator.ts`
- **Action:** Map image findings directly to the 4-tier decision tree:
  - If C2PA present $\to$ Tier 3 / Tier 1 (Proven Synthetic).
  - If C2PA absent BUT (AI text detected OR FFT slope anomalous) $\to$ Tier 2 (Corroborated Anomaly / Likely AI).
  - If no anomalies $\to$ Tier 0 (Human-Consistent).
- **Verification:** Test evaluation on both metadata-intact and stripped images.

### Task 4: Polish Teacher Status UI in WorkspaceView
- **Target:** `src/components/WorkspaceView.tsx`
- **Action:** Render clear, intuitive banners:
  - Red for Tier 1 (Watermark/Provenance Verified).
  - Orange/Amber for Tier 2 (Stripped AI Poster Detected via Visual/Spectral Clues).
  - Green for Tier 0 (Clean).
- **Verification:** Verify with `npm run lint` and browser inspection via ngrok.

---

## 4. Verification & Testing

- Run `npm test` or `tsx src/utils/forensicEngine.test.ts` to ensure zero regressions in existing DOCX/PDF/text engines.
- Test uploading `media_1794113079738_e12c3102.jpg` to ensure it is immediately flagged as **Likely AI Generated** with clear reasons.
- Verify through the live ngrok URL: `https://licenseless-marshall-pivotally.ngrok-free.dev`.
