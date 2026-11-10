# Veritas Forensic

> **Defensible, multi-modal evidentiary forensic workbench for academic integrity.**

[[https://img.shields.io/badge/release-v1.2.0-0F3B5F?style=flat-square]](https://github.com/)
[[https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black]](https://react.dev/)
[[https://img.shields.io/badge/Tauri-v2-FFC131?style=flat-square&logo=tauri&logoColor=black]](https://tauri.app/)
[[https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white]](https://www.typescriptlang.org/)
[[https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white]](https://tailwindcss.com/)
[[https://img.shields.io/badge/Inference-ONNX_Offline-005CED?style=flat-square]](https://onnxruntime.ai/)
[[https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Web-4A5568?style=flat-square]](https://github.com/)

---

## Overview

**Veritas Forensic** is an open-source, multi-modal digital forensics station designed for academic integrity review boards, secondary and post-secondary institutions, educators, and researchers.

Rather than relying on opaque, punitive black-box percentage scores that disproportionately penalize non-native English writers (ESL/L2) and disciplined technical prose, Veritas implements an **evidentiary protocol**: pairing local offline neural inference with container-level metadata forensics, empirical conformal calibration, and deterministic academic protections.

---

## Key Pillars & Capabilities

### 1. Multi-Modal Container Forensics
- **Microsoft Word (`.docx`) Disassembly**: Deconstructs OpenXML packages via `JSZip` to extract low-level revision identifiers (`w:rsidR`), actual active session writing time (`<TotalTime>`), editing hops, and non-native external paste artifacts (`EXTERNAL_PASTE_DETECTED`).
- **Academic PDF Disassembly**: Analyzes PDF Producer/Creator chains, structural metadata, and embedded font subset encodings to detect synthetic compilation workflows.
- **Cryptographic Provenance**: Inspects ISO/IEC 19566-5 (JUMBF) C2PA containers and validates `COSE_Sign1` cryptographic signature manifests for verifiable generative provenance.

### 2. Dual-Engine Offline Neural Inference
- **ModernBERT Primary Classifier**: Built with quantized weights from `onnx-community/modernbert-ai-detection-raid-mage-ONNX` (~144MB), featuring an **8,192-token context window** to accurately assess modern long-form LLM outputs (GPT-4o, Claude) without context clipping.
- **RoBERTa Secondary Fallback**: Bundled local sequence classification (`onnx-community/roberta-base-openai-detector-ONNX`) running locally via `@huggingface/transformers` (ONNX Runtime WebAssembly & CPU).
- **Zero-Network Architecture**: All inference operates 100% locally on the client or local server—no student manuscripts or documents are ever uploaded to external commercial AI APIs.

### 3. Spectral Image Forensics
- **2D Cooley-Tukey Radix-2 FFT**: Executes full-resolution spatial luminance 2D Fast Fourier Transforms on an HTML5 Canvas pipeline.
- **Azimuthal Radial Power Spectrum Fitting ($P(f_r) \propto f_r^{-\alpha}$)**: Analyzes radial frequency decay slopes ($\alpha$) and applies a 3×3 Laplacian filter with an 8×8 JPEG-block notch filter to expose periodic generative upsampling grid artifacts.
- **OCR Invariant Verification**: Tesseract OCR pipeline checks stripped web images for generative watermarks and prompt artifacts.

### 4. Conformal Calibration & Bias Protection
- **Empirical Conformal Prediction**: Bounded against a verified human academic corpus (`humanCalibrationBaseline.json`) with strict false-positive rate ceilings ($\alpha \le 0.01$, $0.05$, $0.10$).
- **Academic Apparatus Safeguard**: Heuristic and structural veto that recognizes APA/IEEE in-text citations (`(Author, Year)` or `[1]`), formal bibliographies, qualitative interview transcripts, and statistical terminology—guaranteeing authentic scholarship is not penalized for rigor.
- **Fairness & Format Decoupling**: Eliminates arbitrary word-count caps and artificial score floors, preventing unedited academic PDFs or pasted text from being artificially forced into synthetic tiers.
- **ESL / L2 Syntax Protections & Formula Guards**: Bypasses stylistic false positives caused by regularized vocabulary in non-native English speakers or dense mathematical/LaTeX notation.

---

## Architecture & Data Flow

```text
1. Client Input (Raw Manuscript / PDF / DOCX / Image)
       │
       ├── Container Forensics (JSZip / PDF.js)
       │   └── Extracts text runs, w:rsidR, <TotalTime>, PDF Creator, C2PA JUMBF
       │
       ├── Computational & Neural Engine
       │   ├── Subword LZ78 Complexity & Conditional Entropy
       │   ├── Local ModernBERT / RoBERTa ONNX Inference (@huggingface/transformers)
       │   └── Empirical Conformal Calibration against Human Baseline (p-value bounds)
       │
       ├── Image Spectral Pipeline (HTML5 Canvas 512x512)
       │   └── 3x3 Laplacian Filter -> 2D Cooley-Tukey FFT -> Azimuthal Radial Decay α
       │
       └── Multi-Tier Institutional Adjudication Engine
           ├── Decorrelated Collinear Fusion Weights
           ├── Hard Veto Overrides (Academic apparatus, ESL syntax, LaTeX guardrails)
           └── Institutional Adjudication Certificate & Synchronized Manuscript Spans
```

---

## Institutional Adjudication Tiers

| Tier | Status | Evidentiary Standard |
| :--- | :--- | :--- |
| **Tier 0** | **Human-Consistent Baseline** | Text conforms to empirical human baseline quantiles ($p \ge 0.05$) or triggers active academic apparatus, ESL, or formula safeguards. |
| **Tier 1** | **Cryptographic Proof** | Affirmative generator manifest confirmed via ISO/IEC 19566-5 C2PA/JUMBF or verified EXIF generation metadata. |
| **Tier 2** | **Corroborated Anomaly** | Multi-signal confluence (neural aggregate probability, low informational entropy, and absence of physical writing provenance). |

---

## Studio Interface & Design System

Veritas Forensic operates as a single, unified 16:9 widescreen studio workbench designed around warm, archival research surfaces:
- **Palette**: Warm limestone canvas (`#F4F1EA`), archival desk surfaces (`#FAF8F4`), recessed ledgers (`#EDE6DB`), deep Prussian blue anchor (`#0F3B5F`), cognac warning (`#B45309`), and verified emerald (`#047857`). Zero stark white glare.
- **Forensic Target Ring**: Dynamic rotating radar aperture guiding file ingest and manuscript paste.
- **Synchronized Reader**: Inline manuscript preview highlighting detected synthetic spans alongside container telemetry and the Official Adjudication Certificate.
- **Decoupled Dia Window (Desktop)**: Dual-window native orchestration featuring a transparent, borderless HazeOver backdrop intro window that smoothly reveals the active workbench upon launch.

---

## Tech Stack

- **Desktop Runtime**: [Tauri v2](https://tauri.app/) (macOS WKWebView `aarch64` & Windows WebView2 `x86_64`)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`), [Vite 8](https://vite.dev/), [Motion](https://motion.dev/), [KaTeX](https://katex.org/), [Lucide React](https://lucide.dev/)
- **Server Runtime**: [Node.js v24](https://nodejs.org/), Express 4, `tsx`
- **Machine Learning & DSP**: `@huggingface/transformers`, ONNX Runtime Web/WASM, custom 2D Cooley-Tukey Radix-2 FFT, LZ78 compression engine
- **Parsers**: `JSZip` (OpenXML DOCX), `pdfjs-dist` (PDF disassembly), Tesseract OCR

---

## Getting Started

### Prerequisites
- **Node.js**: v20+ (Node v24 recommended)
- **Rust Toolchain**: Stable Rust with Cargo (required only for building desktop binaries with Tauri)
- **Package Manager**: `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/your-username/veritas-forensic.git](https://github.com/your-username/veritas-forensic.git)
   cd veritas-forensic
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify offline neural models**:
   Ensure quantized ONNX models are present in the public assets directory:
   - ModernBERT: `public/models/modernbert-detector/`
   - RoBERTa: `public/models/roberta-detector/`

4. **Launch development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## Desktop Builds (Tauri v2)

### macOS (Apple Silicon `aarch64`)
```bash
npm run tauri build
```
Generates `.app` bundle and standalone `.dmg` installer in `src-tauri/target/release/bundle/dmg/`.

### Windows 10/11 (`x86_64`)
```bash
npm run tauri build
```
Generates NSIS `.exe` installer and WiX `.msi` package in `src-tauri/target/release/bundle/nsis/`.

---

## Environment Variables

Configure via a `.env` file in the project root:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the local Express forensic compute server. |
| `HF_DETECTOR_MODEL_ID` | `Xenova/roberta-base-openai-detector` | Default Hugging Face ONNX model identifier. |
| `HF_DETECTOR_ENDPOINT` | *(None)* | Optional remote Python / FastAPI neural inference endpoint. |
| `BINOCULARS_ENDPOINT` | *(None)* | Optional external Falcon/Llama cross-perplexity microservice. |
| `DISABLE_HMR` | `false` | Disables Vite Hot Module Reloading in headless/sandbox environments. |

---

## Repository Structure

```text
veritas-forensic/
├── colab/                      # Google Colab cloud execution notebooks
├── dist-installers/            # Compiled macOS DMG & Windows NSIS/MSI installers
├── public/
│   ├── models/                 # Quantized ONNX weights (ModernBERT & RoBERTa)
│   ├── wasm/                   # ONNX WebAssembly execution runtimes
│   └── manifest.json           # PWA standalone manifest
├── src/
│   ├── components/             # Studio workbench UI components & telemetry cards
│   ├── utils/
│   │   ├── forensicEngine.ts   # Container, LZ78, FFT & academic protection logic
│   │   ├── localNeuralClassifier.ts # Offline ONNX transformer inference runner
│   │   └── submissionEvaluator.ts   # Conformal calibration & score fusion
│   ├── App.tsx                 # Main studio workbench entry
│   └── main.tsx                # App bootstrap & service worker registration
├── src-tauri/                  # Tauri v2 native desktop application wrapper (Rust)
├── ARCHITECTURE.md             # In-depth architectural & math specification
├── DESIGN.md                   # Visual design system & token definitions
└── DEVELOPMENT_LOG.md          # Chronological development & audit log
```

---

## Institutional Ethics & Use Policy

Veritas Forensic is built as an **investigative decision-support aid**, not an autonomous disciplinarian. Due to the probabilistic nature of language models, institutional review boards must never issue disciplinary sanctions solely based on statistical detection scores. Formal adjudications must corroborate container provenance, document version history, and student interviews in accordance with institutional due process standards.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
