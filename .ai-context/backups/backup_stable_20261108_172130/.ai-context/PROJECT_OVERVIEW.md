# Project Overview: AI Detection School Project (Veritas Forensic)

## Target Audience & Purpose
Veritas Forensic is designed for secondary and post-secondary educational institutions, academic integrity review committees, educators, and students. Its goal is to provide a defensible, multi-modal evidence framework for academic submissions that mitigates demographic bias, protects non-native English (ESL/L2) writers, and combines container/metadata forensics with real machine-learning inference.

## Scope
- Multi-modal submission analysis: Plaintext, PDF academic papers, Microsoft Word DOCX containers, and digital images/diagrams.
- Defensive evidentiary protocol: Replacing black-box percentage scores with non-probabilistic container logs, empirical conformal calibration bounds, and multi-tier institutional outcomes.
- Anti-bias protections: Dedicated safeguards for ESL syntax patterns, mathematical/symbolic derivations (LaTeX/TikZ), and standardized textbook apparatus.

## Core Feature Roadmap
1. **Linguistic & Neural Inference**:
   - Local CPU ONNX sequence classification (`Xenova/roberta-base-openai-detector` via `@huggingface/transformers`).
   - Algorithmic Lempel-Ziv (LZ78) dictionary complexity and subword cross-entropy.
   - Conformal Prediction p-value bounds against an empirical 200-sample human academic baseline (`humanCalibrationBaseline.json`).
2. **Container & Provenance Forensics**:
   - OpenXML DOCX analysis: Session duration (`<TotalTime>`), Revision Save Identifiers (`rsidR`), and external paste detection (`EXTERNAL_PASTE_DETECTED`).
   - PDF Producer/Creator disassembly and font subset validation.
   - ISO 19566-5 (JUMBF) C2PA manifest inspection and COSE_Sign1 structure validation.
3. **Spectral Image Analysis**:
   - 2D Cooley-Tukey Fast Fourier Transform (FFT) on full 512x512 spatial luminance matrices.
   - Azimuthal power spectrum radial decay fitting ($P(f_r) \propto f_r^{-\alpha}$) to detect periodic generative upsampling grid harmonics.
4. **Institutional Reporting**:
   - 4-stage hearing dossier summary conforming to administrative review standards.
   - Clear distinction between "Consistent with Human Baseline", "Anomalous / Low Informational Variance", and "Unverified External Provenance".
