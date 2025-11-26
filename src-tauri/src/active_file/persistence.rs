// Persistence layer - handles reading and writing to disk
use super::types::{ActiveFileState, MindMap};
use crate::active_file::files;

/// Load ActiveFileState from disk
pub(crate) fn load_active_file_state<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>
) -> Result<ActiveFileState, String> {
  // Get app data directory
  let app_data_dir = files::build_config_path(app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  // Build file path for the state file
  let state_file_path = app_data_dir.join("active_file_state.json");

  // Check if file exists
  if !state_file_path.exists() {
    println!("No existing ActiveFileState file found, using default");
    return Ok(ActiveFileState::default());
  }

  // Read the file
  let json_string = std::fs::read_to_string(&state_file_path)
    .map_err(|e| format!("Failed to read ActiveFileState file: {}", e))?;

  // Deserialize from JSON
  let state: ActiveFileState = serde_json::from_str(&json_string)
    .map_err(|e| format!("Failed to deserialize ActiveFileState: {}", e))?;

  println!("ActiveFileState loaded from: {:?}", state_file_path);

  Ok(state)
}

/// Load a mind map from disk
pub(crate) fn load_mind_map_from_disk<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  file_name: &str
) -> Result<MindMap, String> {
  let app_data_dir = files::build_data_path(app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  let file_path = app_data_dir.join(file_name);

  if !file_path.exists() {
    return Err(format!("Mind map file not found: {:?}", file_path));
  }

  let json_string = std::fs::read_to_string(&file_path)
    .map_err(|e| format!("Failed to read mind map file: {}", e))?;

  let mind_map: MindMap = serde_json::from_str(&json_string)
    .map_err(|e| format!("Failed to deserialize mind map: {}", e))?;

  Ok(mind_map)
}

/// Persist ActiveFileState to disk
pub fn persist_active_file_state<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  state: &ActiveFileState
) -> Result<(), String> {
  // Serialize the ActiveFileState to JSON
  let json_string = serde_json::to_string_pretty(state)
    .map_err(|e| format!("Failed to serialize ActiveFileState: {}", e))?;

  // Get app data directory
  let app_data_dir = files::build_config_path(app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  // Create directory if it doesn't exist
  std::fs::create_dir_all(&app_data_dir)
    .map_err(|e| format!("Failed to create app data directory: {}", e))?;

  // Build file path for the state file
  let state_file_path = app_data_dir.join("active_file_state.json");

  // Write to file
  std::fs::write(&state_file_path, json_string)
    .map_err(|e| format!("Failed to write ActiveFileState file: {}", e))?;

  println!("ActiveFileState saved to: {:?}", state_file_path);

  Ok(())
}

