// Active file module - manages mind map state, cache, and persistence
//
// This module is organized into several submodules:
// - types: Data structures (MindMap, ActiveFileState)
// - manager: MindMapManager implementation
// - persistence: Disk I/O operations
// - cache: Cache operations and helpers
// - commands: Tauri command handlers

mod cache;
pub mod commands;
mod manager;
mod persistence;
mod types;

// Re-export public types and functions
pub use manager::MindMapManager;

// Public initialization function
use persistence::load_active_file_state;

/// Initialize MindMapManager during app setup
pub fn initialize_mind_map_manager<R: tauri::Runtime>(app: &tauri::App<R>) -> MindMapManager {
  let app_handle = app.handle().clone();
  match load_active_file_state(&app_handle) {
    Ok(state) => MindMapManager::with_state(state),
    Err(e) => {
      eprintln!("Error loading ActiveFileState: {}, using default", e);
      MindMapManager::new()
    }
  }
}

