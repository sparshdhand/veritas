# Privacy Policy for Veritas Forensic Desktop

**Effective Date:** November 10, 2026  
**Product Name:** Veritas Forensic (Academic Integrity & AI Detection Workbench)  
**Developer Contact:** [sparshanshdhand@gmail.com](mailto:sparshanshdhand@gmail.com)  
**Application ID:** `com.veritas.forensic`  

---

### 1. Zero Data Collection Principle
Veritas Forensic is an entirely air-gapped, offline, client-side digital forensics application. We respect the privacy of educators, institutions, and students.
- **No Personal Data Collected:** Veritas Forensic does not collect, record, log, transmit, or sell any personally identifiable information (PII).
- **No Document Telemetry:** Any files analyzed by Veritas Forensic—including `.docx`, `.pdf`, `.txt`, scanned images, or pasted text—remain strictly inside the local host machine's memory and disk. No student submissions, extracted text fragments, forensic logs, or file hashes are ever transmitted across the network.
- **No External Cloud AI Queries:** Neural inference (RoBERTa and ModernBERT ONNX models), statistical burstiness estimation, Binoculars cross-perplexity, GLTR ranking, and OpenXML container forensic audits are executed 100% locally on the user's host CPU via WebAssembly/ONNX Runtime.

---

### 2. Network Activity & Offline Execution
- Veritas Forensic operates in a strict zero-network mode during all file and forensic operations.
- The application does not contact remote tracking servers, advertising networks, analytics platforms, or external telemetry hubs.
- If you use optional user-initiated deep research features that leverage user-provided API credentials (e.g. Google Gemini Live or API keys), those requests are made directly between your local client and the API endpoint via your own secure credentials and are never proxied through developer-owned servers.

---

### 3. Permissions & Host System Access
- **Local File System Access:** When you drag and drop or open a document for forensic inspection, the application accesses only the designated target file to extract document structure, metadata revisions, and textual spans.
- **No Background Telemetry:** The application runs no background telemetry daemons, persistent surveillance processes, or cross-app tracking.

---

### 4. Children’s and Student Privacy (FERPA / COPPA / GDPR)
Veritas Forensic is built explicitly for educational institutions, schools, and academic integrity officers:
- Because the software does not transmit, store, or process student papers on external servers, institutions maintain complete compliance with the Family Educational Rights and Privacy Act (**FERPA**), the Children’s Online Privacy Protection Rule (**COPPA**), and **GDPR** Article 9 protections.

---

### 5. Policy Inquiries & Support
If you have questions, feedback, or inquiries regarding our privacy standards or technical architecture, contact:
- **Email:** [sparshanshdhand@gmail.com](mailto:sparshanshdhand@gmail.com)  
- **Repository:** [https://github.com/sparshdhand/veritas](https://github.com/sparshdhand/veritas)
