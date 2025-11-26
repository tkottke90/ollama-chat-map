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
use crate::files;

// Re-export public types and functions
pub use manager::MindMapManager;
pub use types::{create_empty_mind_map, create_tutorial_mind_map, is_first_time_user};

// Public initialization function
use persistence::{load_active_file_state, load_mind_map_from_disk};
use types::ActiveFileState;

/// Initialize MindMapManager during app setup with eager loading
/// This ensures the backend always has an active mind map before the frontend starts
pub fn initialize_mind_map_manager<R: tauri::Runtime>(app: &tauri::App<R>) -> MindMapManager {
  let app_handle = app.handle().clone();

  // Step 1: Load state file
  let state = match load_active_file_state(&app_handle) {
    Ok(s) => {
      println!("✅ Loaded active file state");
      s
    },
    Err(e) => {
      eprintln!("⚠️  No state file found: {}", e);
      ActiveFileState::default()
    }
  };

  // Step 2: Try to load the previous mind map
  let (active_mind_map, updated_state) = if let Some(path) = &state.current_mind_map_path {
    match load_mind_map_from_disk(&app_handle, path) {
      Ok(map) => {
        println!("✅ Loaded previous mind map: {}", path);
        (map, state)
      }
      Err(e) => {
        eprintln!("⚠️  Failed to load {}: {}", path, e);
        println!("📝 Creating default mind map");
        (create_empty_mind_map(), state)
      }
    }
  } else {
    // No previous mind map
    if is_first_time_user(&app_handle) {
      println!("👋 First-time user detected, creating tutorial");
      let tutorial = create_tutorial_mind_map();

      // Save tutorial to disk
      if let Err(e) = save_tutorial_to_disk(&app_handle, &tutorial) {
        eprintln!("⚠️  Failed to save tutorial: {}", e);
      }

      // Update state to point to tutorial.json
      let mut updated_state = state;
      updated_state.current_mind_map_path = Some("tutorial.json".to_string());
      updated_state.recent_files.insert(0, "tutorial.json".to_string());

      // Persist the updated state
      if let Err(e) = persistence::persist_active_file_state(&app_handle, &updated_state) {
        eprintln!("⚠️  Failed to persist state: {}", e);
      }

      (tutorial, updated_state)
    } else {
      println!("📝 Creating empty mind map");
      (create_empty_mind_map(), state)
    }
  };

  // Step 3: Create manager with loaded data
  println!("🚀 MindMapManager initialized with active mind map");
  MindMapManager::with_loaded_mind_map(updated_state, active_mind_map)
}

/// Helper to save tutorial to disk
fn save_tutorial_to_disk<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  tutorial: &types::MindMap
) -> Result<(), String> {
  let app_data_dir = files::build_data_path(app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  std::fs::create_dir_all(&app_data_dir)
    .map_err(|e| format!("Failed to create app data directory: {}", e))?;

  let file_path = app_data_dir.join("tutorial.json");

  let json_string = serde_json::to_string_pretty(tutorial)
    .map_err(|e| format!("Failed to serialize tutorial: {}", e))?;

  std::fs::write(&file_path, json_string)
    .map_err(|e| format!("Failed to write tutorial file: {}", e))?;

  println!("📚 Tutorial saved to: {:?}", file_path);

  Ok(())
}

