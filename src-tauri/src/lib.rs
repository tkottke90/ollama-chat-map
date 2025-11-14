mod ollama;
mod active_file;

use tauri::{Builder, Manager};
use std::sync::Mutex;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
          app.manage(Mutex::new(ollama::OllamaConfig::default()));
          app.manage(Mutex::new(active_file::ActiveFileState::default()));
          Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ollama::ollama_chat,
            ollama::set_ollama_config,
            active_file::get_mind_map,
            active_file::load_mind_map,
            active_file::create_mind_map,
            active_file::update_nodes,
            active_file::update_edges,
            active_file::add_node,
            active_file::add_edge
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
