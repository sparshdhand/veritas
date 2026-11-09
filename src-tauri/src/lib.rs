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
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Veritas".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        identifier: "com.veritas.forensic".to_string(),
        is_desktop: true,
        platform: std::env::consts::OS.to_string(),
    }
}

#[tauri::command]
pub fn get_model_status() -> ModelStatus {
    ModelStatus {
        is_available: true,
        model_name: "veritas-forensic-quantized-onnx".to_string(),
        quantized: true,
        offline_ready: true,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_model_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running veritas forensic tauri application");
}
