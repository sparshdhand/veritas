# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Academic integrity officers, university evaluators, journal peer-reviewers, and institutional hearing committees evaluating student or research manuscripts for synthetic generation vs. authentic human authorship.

## Product Purpose

Veritas Forensic provides defensible, multi-modal AI detection and authorship provenance analysis. It prevents false positives on ESL writers, formal textbooks (e.g., NCERT), and LaTeX-heavy mathematical manuscripts while surfacing verifiable container forensics, empirical conformal prediction p-values, and local transformer span probabilities.

## Positioning

Unlike black-box binary AI detectors that guess from static prose alone, Veritas Forensic combines local ONNX transformer inference (`roberta-base-openai-detector`), empirical Conformal Prediction calibrated against human academic baselines, 512×512 2D-FFT spectral image forensics, OpenXML/PDF container metadata auditing, and interactive KaTeX equation rendering in a unified forensic workbench.

## Operating Context

Used during manuscript screening, academic integrity reviews, and formal institutional hearings. Evaluators upload `.pdf`, `.docx`, `.tex`, or `.txt` files, inspect paragraph-level span telemetry alongside rendered equations and native PDF previews, test sensitivity thresholds in the Weight Sandbox, and export a 6-part evidentiary Hearing Dossier.

## Capabilities and Constraints

- Local transformer inference via `@huggingface/transformers` on `/api/forensic/evaluate` with empirical Conformal Prediction calibration (`alpha = 0.01`).
- Native PDF split-pane preview and interactive KaTeX LaTeX formula rendering so equations are never misclassified as synthetic prose.
- Four-tier log-odds Bayesian evidentiary fusion capped at Tier 2 (`Highly Probable AI`) when deterministic container provenance is absent.
- ESL & Textbook / Formal Pedagogical Register Hard Veto protections.

## Brand Commitments

- **Name:** Veritas Forensic (`VERITAS // FORENSIC`)
- **Voice:** Objective, clinical, mathematically transparent, and legally defensible—never accusatory without deterministic provenance.

## Evidence on Hand

- Empirical human calibration baseline (`src/data/humanCalibrationBaseline.json`) with 200 human academic non-conformity scores.
- Five reference forensic corpus cases (ESL Biology, Zero-Minute DOCX Paste, Mixed Graduate Thesis, C2PA Signed Journal Review, and White-Font Adversarial Injection).

## Product Principles

1. **Provenance Over Guessing:** Never issue a Tier 3 (`Proven Synthetic`) classification without deterministic container or cryptographic evidence.
2. **Protect Formal & ESL Prose:** Explicitly shield non-native English patterns, formal pedagogical textbooks, and LaTeX symbolic equations from false-positive flags.
3. **Inspectable Math:** Every score exposes its log-odds breakdown, conformal p-value, and sentence-level perplexity/burstiness telemetry.
