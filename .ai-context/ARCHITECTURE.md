# Architecture: AI Detection School Project (Veritas Forensic)

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Vite 8, Lucide React, Motion, KaTeX.
- **Desktop Runtime**: Tauri v2 (`veritas-forensic`), supporting native macOS WKWebView and Microsoft Edge WebView2 on Windows 10/11 x86_64.
- **Window Architecture**: Decoupled multi-window orchestration (hidden primary workbench + borderless transparent floating intro with dynamic primary monitor bounds and HazeOver backdrop dimming).
- **Backend / Server Runtime**: Node.js (v24), Express 4, `tsx` runtime.
- **Machine Learning & Inference**: `@huggingface/transformers` (ONNX Runtime Web/WASM + CPU quantized sequence classification using `onnx-community/roberta-base-openai-detector-ONNX` embedded offline in `public/models/roberta-detector/`).
- **Container Parsers**: JSZip (OpenXML DOCX disassembly), PDF.js (`pdfjs-dist`).
- **Mathematical & Forensic Compute**: Custom in-place 2D Cooley-Tukey Radix-2 FFT, Lempel-Ziv LZ78 compression engine, Conformal Prediction calibration against empirical human quantiles.

## Environment Variables (Non-Secret Schema)
- `PORT`: Server listen port (default: `3000`).
- `HF_DETECTOR_MODEL_ID`: Hugging Face ONNX model identifier (default: `Xenova/roberta-base-openai-detector`).
- `HF_DETECTOR_ENDPOINT`: Optional remote Python/FastAPI endpoint override.
- `BINOCULARS_ENDPOINT`: Optional external Falcon/Llama cross-perplexity microservice.
- `DISABLE_HMR`: Disable Vite Hot Module Reloading in headless/sandbox environments.

## Data Flow
```
1. Client Input (Text / PDF / DOCX / Image)
       │
       ├── Container Forensics (JSZip / PDF.js)
       │   └── Extracts text runs, w:rsidR, <TotalTime>, PDF Creator, C2PA JUMBF boxes
       │
       ├── Express Server (/api/forensics/neural-classify & /token-logprobs)
       │   ├── Subword LZ78 Complexity & Conditional Entropy
       │   ├── Local ONNX Transformer Inference (@huggingface/transformers)
       │   └── Empirical Conformal Calibration (humanCalibrationBaseline.json)
       │
       ├── Image Spectral Pipeline (HTML5 Canvas 512x512)
       │   └── 3x3 Laplacian Filter -> 2D Cooley-Tukey FFT -> Azimuthal Radial Decay α
       │
       └── Confidence Fusion Engine
           ├── Decorrelated Collinear Weights (w_bino, w_burst, w_gltr * 0.25)
           ├── Hard Veto Overrides (ESL syntax, LaTeX/math protection, minimum length, academic apparatus)
           └── 3 Defensible Institutional Tiers & Hearing Dossier Generation
```

### Forensic Failure Modes & Protections
- **Academic Apparatus Safeguard**: Protects authentic research structures (APA/IEEE citations, empirical methodology transcripts, table/data references) against statistical stylometric false positives.
- **Fairness & Format Decoupling**: Eliminates word-count ceilings (<1200w) and artificial score floors (88-93% plain text clamp), ensuring long-form scholarship is not penalized for rigor.

## Schemas
- `ForensicSubmissionCase`: Primary state model containing metadata, metrics, highlighted spans, and fusion report.
- `AnalysisReportPayload`: Structured forensic output comprising document metadata flags, GLTR distribution, stylometrics, and hearing steps.
- `ConformalCalibrationResult`: Non-conformity score, p-value, and allowable false positive rate ceiling (0.01 / 0.05 / 0.10).
