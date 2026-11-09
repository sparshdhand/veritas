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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_model_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running veritas forensic tauri application");
}
