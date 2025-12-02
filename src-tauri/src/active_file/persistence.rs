// Persistence layer - handles reading and writing to disk
use super::types::{ActiveFileState, MindMap, SavingStatePayload};
use crate::files;

/// Load ActiveFileState from disk
pub(crate) fn load_active_file_state<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>
) -> Result<ActiveFileState, String> {
  // Get app data directory
  let app_data_dir = files::build_config_path(app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  // Build file path for the state file
  let state_file_path = app_data_dir.join("active_file_state.json");

  // Check if file exists - return default if not found
  if !state_file_path.exists() {
    println!("No existing ActiveFileState file found, using default");
    return Ok(ActiveFileState::default());
  }

  // Read the file using the shared load_text_file function
  let json_string = files::load_text_file(&state_file_path)?;

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

  // Read the file using the shared load_text_file function
  let json_string = files::load_text_file(&file_path)?;

  // Deserialize from JSON
  let mind_map: MindMap = serde_json::from_str(&json_string)
    .map_err(|e| format!("Failed to deserialize mind map: {}", e))?;

  Ok(mind_map)
}

/// Persist ActiveFileState to disk
pub fn persist_active_file_state<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  state: &ActiveFileState
) -> Result<(), String> {
  use tauri::Emitter;

  // Emit saving started event
  app.emit("aiMindMap://mindMap/saving", SavingStatePayload { is_saving: true })
    .map_err(|e| format!("Failed to emit saving started event: {}", e))?;

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

  // Emit saving completed event
  app.emit("aiMindMap://mindMap/saving", SavingStatePayload { is_saving: false })
    .map_err(|e| format!("Failed to emit saving completed event: {}", e))?;

  Ok(())
}

