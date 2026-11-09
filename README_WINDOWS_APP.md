# Veritas Forensic — Windows Desktop Application Guide

Veritas Forensic is a standalone, 100% offline-first forensic workbench for analyzing academic manuscripts and evaluating AI-generation vs. human authorship.

This guide explains:
1. How to build the Windows `.exe` and `.msi` installers from macOS / Linux using GitHub Actions.
2. How to run local development.
3. How offline neural model bundling works.
4. How educators and administrators install and run the application.

---

## 1. Automated Windows Cloud Build (via GitHub Actions)

Because building a Windows `.exe` / `.msi` native installer requires the Microsoft Visual C++ (MSVC) toolchain and Windows SDKs, the project includes an automated GitHub Actions CI/CD workflow located at:
[`.github/workflows/build-windows.yml`](file://.github/workflows/build-windows.yml)

### To Trigger a 1-Click Build:
1. Push your changes to `main` (or `master`), or go to your GitHub repository's **Actions** tab.
2. Under **Workflows**, click **"Build Windows Desktop App"**.
3. Click the **"Run workflow"** button (`workflow_dispatch`).
4. Once completed (approx. 4–7 minutes on GitHub's `windows-latest` runner):
   - Scroll to the bottom of the workflow run summary to find the **Artifacts** section.
   - Download the **`veritas-forensic-windows-installer`** zip package.
   - Inside you will find:
     - `Veritas Forensic_1.0.0_x64-setup.exe` (NSIS full installer)
     - `Veritas Forensic_1.0.0_x64_en-US.msi` (Enterprise WiX MSI installer)

---

## 2. Local Development

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **Rust**: `rustup` with `stable` toolchain
- (Optional, if testing Tauri locally on macOS): Xcode command line tools

### Web Application Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### Desktop App Dev Server (Tauri)
```bash
npm run desktop:dev
```
This runs Vite in watch mode alongside the Tauri desktop window with native IPC enabled.

### Production Web Build
```bash
npm run build
```

---

## 3. Offline Model Architecture & Bundling

Veritas Forensic operates strictly under zero-telemetry and zero-cloud principles:
- **Statistical Forensic Engine**: Perplexity, burstiness, Zipf's law distribution, repetition penalties, punctuation rhythm, and entropy are computed entirely in pure TypeScript inside the client worker/runtime.
- **Neural ONNX Classifier**: 
  - Located in `src-tauri/resources/models/`.
  - When compiled via Tauri, the folder is bundled as native application resources (`tauri.conf.json -> bundle.resources`).
  - At runtime, `src/utils/tauriBridge.ts` checks `isTauri()`. In desktop mode, model weights and vocabulary files are read directly from local disk via native Tauri IPC (`resolve_model_path`), completely bypassing Hugging Face or remote CDNs.
  - In a standard browser preview, it falls back to the in-memory cache or preloaded worker.

---

## 4. Teacher & School Deployment Instructions

### Installing on Windows 10 / Windows 11:
1. Download `Veritas Forensic_1.0.0_x64-setup.exe`.
2. Double-click the installer and complete the setup wizard.
3. Launch **Veritas Forensic** from the Start Menu or Desktop shortcut.

### Key Teacher Features:
- **Full-Window Drag-and-Drop Replacement**: Teachers can drag any student paper (`.pdf`, `.docx`, `.tex`, `.txt`, `.png`, `.jpg`) anywhere onto the window at any time to instantly evaluate or swap manuscripts.
- **Air-Gapped School Security**: No document content ever leaves the teacher's PC. No student data is sent to external servers or AI APIs.
- **Export Forensic Dossier**: Export compliant PDF audit reports, complete with token-level perplexity heatmaps, forensic reasoning, and confidence intervals.
