// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub identifier: String,
    pub is_desktop: bool,
    pub platform: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelStatus {
    pub is_available: bool,
    pub model_name: String,
    pub quantized: bool,
    pub offline_ready: bool,
}

#[tauri::command]
fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Veritas".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        identifier: "com.veritas.forensic".to_string(),
        is_desktop: true,
        platform: std::env::consts::OS.to_string(),
    }
}

#[tauri::command]
fn get_model_status() -> ModelStatus {
    ModelStatus {
        is_available: true,
        model_name: "veritas-forensic-quantized-onnx".to_string(),
        quantized: true,
        offline_ready: true,
    }
}

#[tauri::command]
fn show_main_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;
    // Mark onboarding as completed persistently in app data dir
    if let Ok(app_dir) = app_handle.path().app_data_dir() {
        let _ = std::fs::create_dir_all(&app_dir);
        let flag_path = app_dir.join(".intro_seen");
        let _ = std::fs::write(flag_path, "1");
    }

    if let Some(main_window) = app_handle.get_webview_window("main") {
        let _ = main_window.show();
        let _ = main_window.set_focus();
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri::Manager;
            // Check if onboarding intro was already completed previously
            let mut intro_already_seen = false;
            if let Ok(app_dir) = app.path().app_data_dir() {
                let flag_path = app_dir.join(".intro_seen");
                if flag_path.exists() {
                    intro_already_seen = true;
                }
            }

            if intro_already_seen {
                // User has already seen the intro in a previous session:
                // Close the intro window immediately and show the main window directly!
                if let Some(intro_win) = app.get_webview_window("intro") {
                    let _ = intro_win.close();
                }
                if let Some(main_win) = app.get_webview_window("main") {
                    let _ = main_win.show();
                    let _ = main_win.set_focus();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_model_status,
            show_main_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running veritas forensic tauri application");
}
