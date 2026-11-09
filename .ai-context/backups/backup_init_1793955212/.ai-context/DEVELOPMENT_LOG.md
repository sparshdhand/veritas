# Development Log: AI Detection School Project (Veritas Forensic)

## Initial Setup & Baseline Migration (2026-11-06)
- **Status**: Stable migration into `.gemini/projects/AI Detection School project/`.
- **Key Decisions**:
  - Eliminated simulated character-code modulo math and 12-state Markov POS tables.
  - Migrated neural inference to real local ONNX sequence classification (`Xenova/roberta-base-openai-detector` via `@huggingface/transformers`).
  - Implemented empirical conformal prediction p-values computed against `humanCalibrationBaseline.json` (200 peer-reviewed human academic samples).
  - Upgraded image forensics to full 512x512 canvas patches with high-pass Laplacian filtering to preserve high-frequency diffusion upsampling harmonics.
  - Reclassified DOCX monolithic paste anomalies from "Critical Synthetic" to informational `EXTERNAL_PASTE_DETECTED` ("Low" severity).
  - Decorated collinear log-odds weights with a 0.25 scaling factor and implemented the three defensible academic tiers.
- **Technical Debt & Future Notes**:
  - Optional integration of full C2PA X.509 certificate validation via `@contentauth/c2pa-node` for complete PKI chain checking.
  - Support for multi-page batch submissions and historical student trajectory comparisons.
