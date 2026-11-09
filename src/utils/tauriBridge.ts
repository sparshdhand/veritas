import { invoke, isTauri } from "@tauri-apps/api/core";

export interface DesktopAppInfo {
  name: string;
  version: string;
  identifier: string;
  is_desktop: boolean;
  platform: string;
}

export interface DesktopModelStatus {
  is_available: boolean;
  model_name: string;
  quantized: boolean;
  offline_ready: boolean;
}

/**
 * Checks whether the application is running inside the Tauri native desktop shell.
 */
export function isDesktopApp(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Tauri v2 sets window.__TAURI_INTERNALS__ when executing inside WebView2/WKWebView
  const hasTauriInternals = "__TAURI_INTERNALS__" in window;
  return isTauri() || hasTauriInternals;
}

/**
 * Invokes a native Tauri IPC command with fallback for browser development.
 */
export async function invokeDesktopCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!isDesktopApp()) {
    return null;
  }

  try {
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.warn(`[TauriBridge] Native command "${cmd}" execution failed:`, err);
    return null;
  }
}

/**
 * Retrieves the desktop application version.
 */
export async function getAppVersion(): Promise<string> {
  if (isDesktopApp()) {
    try {
      const info = await invokeDesktopCommand<DesktopAppInfo>("get_app_info");
      if (info?.version) {
        return info.version;
      }
    } catch {
      // Fallback below
    }
  }
  return "1.0.0";
}

/**
 * Queries the native offline model status.
 */
export async function getDesktopModelStatus(): Promise<DesktopModelStatus | null> {
  return invokeDesktopCommand<DesktopModelStatus>("get_model_status");
}
