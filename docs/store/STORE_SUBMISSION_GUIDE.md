# Microsoft Store Submission & Policy Compliance Guide
**Application:** Veritas Forensic // Academic Integrity Workbench  
**Version:** 1.2.0  
**Publisher:** Sparsh Dhand  
**Package Identifier:** `com.veritas.forensic`  
**Target Category:** Education / Developer Tools / Productivity  

---

## 1. Executive Summary & Policy Adherence Matrix

| Microsoft Store Policy | Requirement | Veritas Compliance State | Evidence / Implementation |
| :--- | :--- | :--- | :--- |
| **Policy 10.1 (Distinct Function & Value)** | Must provide substantial, unique utility | **Compliant** | Multi-signal offline academic forensics combining container metadata, OpenXML RSID sessions, statistical perplexity, and neural sequence classifiers. |
| **Policy 10.5 (Personal Information & Privacy)** | Clear privacy policy disclosure | **Compliant** | Offline air-gapped architecture. Zero data collected. Dedicated policy document: `docs/store/PRIVACY_POLICY.md`. |
| **Policy 11.2 (Security)** | Must not compromise host or user safety | **Compliant** | Air-gapped ONNX/WASM execution. No elevated privilege escalation required. Built via Tauri v2 with secure sandbox bindings. |
| **Policy 11.16 (Live Generative AI Content)** | Transparency, moderation, user feedback | **Compliant** | Veritas is primarily an **analytical detector / forensic classifier**, not an open-ended generator. All local neural models execute locally. |

---

## 2. Microsoft Store Policy 11.16 ("Live Generative AI Content") Declaration

In Microsoft Partner Center under the **Product Declaration / Artificial Intelligence** section:

### Question: Does your product utilize Live Generative AI?
- **Declaration:** **No / Utility Classification** (or **Yes - Analytic & Forensic Classification with In-App User Feedback** depending on Partner Center phrasing).
- **Official Description for Certification Reviewers:**
  > *"Veritas Forensic is a client-side document forensics and academic integrity utility. It utilizes local, offline sequence classification models (ModernBERT ONNX and RoBERTa) to detect statistical uniformity, entropy anomalies, and text-burstiness signatures indicative of synthetic generation. The app does not output unmoderated open-ended text, synthetic deepfakes, or uncontrolled generative media. Any optional user-directed assistance is bound by client-side filtering and deterministic forensic scoring. Users are provided an accessible support and feedback mechanism directly in the interface and documentation."*

---

## 3. Store Listing Copy & Metadata Pack

### App Title
`Veritas Forensic - Academic Integrity & AI Detection Workbench`

### Short Description (Up to 100 characters)
`Air-gapped academic integrity workbench with multi-signal AI text and container forensics.`

### Full Description
```markdown
Veritas Forensic is an advanced, offline desktop workbench engineered for educators, academic integrity boards, and researchers to verify document authenticity without compromising student data privacy.

Unlike cloud detectors that transmit private essays to third-party servers, Veritas operates 100% offline on your device CPU:

KEY FORENSIC CAPABILITIES:
• Offline Neural Verification: High-dimensional sequence classification powered by ModernBERT and RoBERTa ONNX runtimes.
• OpenXML Container Forensics: Micro-inspection of Microsoft Word (.docx) RSID revision sessions, edit timestamps, and paste anomalies.
• PDF Structural Analysis: Font embedding inspection, metadata tool signatures, and visual span mapping.
• ESL Demographic Fairness Safeguards: Calibrated burstiness baselines to protect non-native English writers from systemic false positives.
• Academic Apparatus Recognition: Distinguishes genuine peer-reviewed scholarship, formal research citations (APA/IEEE), and qualitative interview data from machine generation.
• Granular Span Visualizer: Synchronized character-level highlighting indicating localized low-burstiness and high-predictability passages.

ZERO-TELEMETRY PRIVACY:
• Zero cloud uploads or external telemetry.
• Complete FERPA, COPPA, and GDPR compliance for educational institutions.
```

### Search Keywords / Tags
`ai detector`, `academic integrity`, `plagiarism detector`, `docx forensics`, `pdf analyzer`, `education`, `research forensics`, `modernbert`, `air-gapped`

### Support & Feedback URL
`https://github.com/sparshdhand/veritas/issues`

### Privacy Policy URL
`https://github.com/sparshdhand/veritas/blob/main/docs/store/PRIVACY_POLICY.md`

---

## 4. Packaging Steps for Microsoft Store Submission

1. **Upload Package in Partner Center:**
   - In Partner Center -> **Submissions** -> **Packages**, upload the MSIX or MSI installer generated from the build workflow:
     `dist-installers/windows/msi/Veritas_1.2.0_x64_en-US.msi` (or NSIS `.exe` if enrolled in the Desktop Win32 program).
2. **Age Rating / IARC Questionnaire:**
   - Classification: **General / All Ages (3+ / Everyone)**.
   - The app does not feature user-to-user chat, explicit material, or violence.
3. **Notes for Certification Reviewer:**
   > *"Veritas Forensic is an educational analysis tool. It processes documents completely offline on the host machine using ONNX Runtime. The app requires no login or cloud subscription to function."*
