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
          // Initialize MindMapManager with cache
          let mind_map_manager = active_file::initialize_mind_map_manager(app);
          app.manage(mind_map_manager);
          Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ollama::ollama_chat,
            ollama::set_ollama_config,
            active_file::commands::get_mind_map,
            active_file::commands::load_mind_map,
            active_file::commands::save_mind_map,
            active_file::commands::create_mind_map,
            active_file::commands::update_nodes,
            active_file::commands::update_edges,
            active_file::commands::flush_mind_map
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
