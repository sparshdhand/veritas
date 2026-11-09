# Veritas Forensic: Windows Desktop App (Tauri v2) Implementation Plan

**Goal:** Port Veritas Forensic to a 100% offline standalone Windows desktop application (`.exe` / `.msi`) using Tauri v2, bundling the quantized ONNX neural model locally, preserving the exact React 19 UI, adding full-window drag-and-drop replacement, and setting up an automated cross-platform GitHub Actions build workflow.

**Spec Reference:** [`docs/superpowers/specs/2026-11-09-windows-tauri-port-design.md`](file:///Users/sparsh/.gemini/projects/AI%20Detection%20School%20project/docs/superpowers/specs/2026-11-09-windows-tauri-port-design.md)

---

## 1. File Structure & Responsibilities

| File Path | Responsibility |
| :--- | :--- |
| `src-tauri/tauri.conf.json` | Tauri v2 configuration (app bundle identifier, window dimensions, permissions, bundled model resources, WebView2 settings). |
| `src-tauri/Cargo.toml` | Rust dependencies (`tauri`, `serde`, `serde_json`, etc.). |
| `src-tauri/src/main.rs` | Tauri runtime entry point. |
| `src-tauri/src/lib.rs` | Native IPC commands (local model path resolver, offline file reading). |
| `src/utils/tauriBridge.ts` | Frontend IPC helper that detects whether running inside Tauri desktop or web browser, and invokes native commands. |
| `src/App.tsx` | Add window-level drag-and-drop overlay so teachers can drop any new file on top of an active report to seamlessly swap papers. |
| `src/components/GlobalDropOverlay.tsx` | Fluent semi-transparent drag-and-drop overlay UI component with visual feedback. |
| `.github/workflows/build-windows.yml` | GitHub Actions workflow to cross-compile the Windows x86_64 installer (`.exe` / `.msi`) on real `windows-latest` runners. |
| `package.json` | Add `@tauri-apps/api` and `@tauri-apps/cli` scripts (`npm run tauri:dev`, `npm run tauri:build`). |

---

## 2. Bite-Sized Implementation Tasks

### Task 1: Add Global Drag-and-Drop Replacement Overlay in React UI
- **Files:** `src/components/GlobalDropOverlay.tsx`, `src/App.tsx`
- **Objective:** Allow teachers to drag any `.pdf`, `.docx`, `.tex`, `.txt`, or image file anywhere over an active report to seamlessly swap to the new paper without needing to scroll or click the top-right upload button.
- **Details:**
  - Create `GlobalDropOverlay.tsx` with animated fluent styling (subtle backdrop blur, dashed accent border, message: *"Drop student manuscript here to analyze"*).
  - Add `onDragEnter`, `onDragOver`, `onDragLeave`, and `onDrop` handlers to the top-level container in `App.tsx`.
  - On drop, cancel prior evaluation, unload previous memory, and immediately invoke `handleProcessFile(file)`.
- **Test:** Run `npm run build` and test drag events.

### Task 2: Scaffold Tauri v2 Project Structure & Rust Core
- **Files:** `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`
- **Objective:** Initialize Tauri v2 configuration matching the existing Vite build output (`dist/`).
- **Details:**
  - Add `@tauri-apps/api` and `@tauri-apps/cli` to `package.json`.
  - Configure `tauri.conf.json`:
    - `productName: "Veritas Forensic"`
    - `version: "1.0.0"`
    - `identifier: "org.veritas.forensic"`
    - Window title, minimum size (1024x720), default dark background matching the theme (`#090d16`).
    - Configure resource bundling for offline model assets: `resources: ["resources/models/*"]`.
- **Test:** Validate `tauri.conf.json` syntax and schema.

### Task 3: Implement Offline Model Bundling & Tauri Bridge
- **Files:** `src/utils/tauriBridge.ts`, `src/utils/submissionEvaluator.ts`, `src-tauri/src/lib.rs`
- **Objective:** Enable 100% offline neural classification inside the Windows app without requiring external internet or network calls.
- **Details:**
  - In `src/utils/tauriBridge.ts`: Implement `isTauri()` check and `invokeTauriCommand()`.
  - In `src/utils/submissionEvaluator.ts`: When running in desktop mode, read model weights directly from the bundled resource path or local worker rather than making remote HTTP requests to Hugging Face.
  - Ensure zero network calls occur when running offline.
- **Test:** Run `npx tsx src/utils/forensicEngine.test.ts` to verify statistical evaluation remains intact.

### Task 4: Create GitHub Actions Cross-Platform Windows Build Pipeline
- **Files:** `.github/workflows/build-windows.yml`
- **Objective:** Provide automated building of the Windows x86_64 installer (`.exe` / `.msi`) from your Mac via GitHub's cloud runners.
- **Details:**
  - Configure GitHub Actions with `runs-on: windows-latest`.
  - Set up Node.js, Rust `stable-x86_64-pc-windows-msvc`.
  - Cache npm and cargo dependencies.
  - Run Vite frontend build (`npm run build`).
  - Run `npx tauri build` to package the NSIS installer (`.exe`) and WiX installer (`.msi`).
  - Upload artifacts to GitHub Actions release/summary for 1-click download.
- **Test:** Validate YAML schema with GitHub Actions linter.

### Task 5: Final Verification & Audit
- **Files:** All modified files.
- **Objective:** Full verification of build, tests, and air-gapped readiness.
- **Checks:**
  1. `npm run lint` (`tsc --noEmit`) passes with 0 errors.
  2. `npm run build` generates production bundle in `dist/`.
  3. `npx tsx src/utils/forensicEngine.test.ts` passes all 18 tests.
  4. Verify drag-and-drop replacement renders cleanly without regressions.
