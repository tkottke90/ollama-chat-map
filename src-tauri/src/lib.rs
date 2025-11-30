mod ollama;
mod active_file;
mod app_menu;
mod files;
mod state;

use tauri::{Builder, Manager};

pub use state::AppState;
use state::load_app_state;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
          // Load centralized application state from disk (or use defaults)
          let app_state = load_app_state(&app.handle());
          app.manage(app_state);

          // Initialize MindMapManager with cache
          let mind_map_manager = active_file::initialize_mind_map_manager(app);
          app.manage(mind_map_manager);

          app_menu::configure(app)?;

          // Start Ollama health check background task (every 5 seconds)
          ollama::start_health_check_task(app.handle().clone(), 5);

          Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ollama::ollama_chat,
            ollama::get_ollama_config,
            ollama::set_ollama_config,
            ollama::get_ollama_status,
            active_file::commands::get_mind_map,
            active_file::commands::get_save_state,
            active_file::commands::load_mind_map,
            active_file::commands::save_mind_map,
            active_file::commands::create_mind_map,
            active_file::commands::update_nodes,
            active_file::commands::update_edges,
            active_file::commands::flush_mind_map,
            active_file::commands::open_file_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
