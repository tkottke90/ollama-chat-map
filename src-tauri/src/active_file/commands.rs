// Tauri command handlers for mind map operations
use crate::active_file::files;

use super::cache::update_cache;
use super::manager::MindMapManager;
use super::persistence::{load_mind_map_from_disk, persist_active_file_state};
use super::types::{MindMap, SaveState};
use chrono::Utc;
use tauri::{AppHandle, Emitter, Manager, State};

/// Helper function to emit state updates to the frontend
fn emit_state_update<R: tauri::Runtime>(app: &AppHandle<R>, mind_map: &MindMap) -> Result<(), String> {
  app.emit("aiMindMap://mindMap/update", mind_map)
    .map_err(|e| format!("Failed to emit state update: {}", e))
}

/// Helper function to update the window title based on the mind map name
fn update_window_title<R: tauri::Runtime>(app: &AppHandle<R>, mind_map: &MindMap) -> Result<(), String> {
  // Get the main window
  let window = app.get_webview_window("main")
    .ok_or_else(|| "Failed to get main window".to_string())?;

  // Build the title: "AI Mind Map - {name}"
  let title = if mind_map.name.is_empty() || mind_map.name == "Untitled" {
    "AI Mind Map - Untitled".to_string()
  } else {
    format!("AI Mind Map - {}", mind_map.name)
  };

  // Set the window title
  window.set_title(&title)
    .map_err(|e| format!("Failed to set window title: {}", e))?;

  println!("🪟 Window title updated to: {}", title);

  Ok(())
}

/// Tauri command to create a new mind map
#[tauri::command]
pub fn create_mind_map<R: tauri::Runtime>(
  manager: State<'_, MindMapManager>,
  app: AppHandle<R>,
  name: String,
  description: String
) -> Result<(), String> {
  let new_mind_map = MindMap {
    id: 0,
    name,
    description,
    file_name: "".to_string(),
    nodes: serde_json::json!([]),
    edges: serde_json::json!([]),
    created_at: Utc::now().to_rfc3339(),
    updated_at: Utc::now().to_rfc3339(),
  };

  // Set as active mind map with empty path (unsaved)
  manager.set_active_mind_map(new_mind_map.clone(), String::new());

  // Persist the updated ActiveFileState to disk
  let state = manager.get_state();
  persist_active_file_state(&app, &state)?;

  // Update window title
  update_window_title(&app, &new_mind_map)?;

  // Emit to frontend
  emit_state_update(&app, &new_mind_map)?;

  Ok(())
}

/// Tauri command to get the current mind map state
/// Always returns a mind map (backend always has one loaded)
#[tauri::command]
pub fn get_mind_map(
  manager: State<'_, MindMapManager>
) -> Result<MindMap, String> {
  // Simply return the active mind map (always present)
  let mind_map = manager.get_active_mind_map();

  // Debug logging
  println!("📤 get_mind_map called:");
  println!("   - Name: {}", mind_map.name);
  println!("   - File: {}", mind_map.file_name);
  println!("   - Nodes: {} items",
    mind_map.nodes.as_array().map(|a| a.len()).unwrap_or(0));
  println!("   - Edges: {} items",
    mind_map.edges.as_array().map(|a| a.len()).unwrap_or(0));

  Ok(mind_map)
}

/// Tauri command to get the save state
#[tauri::command]
pub fn get_save_state(
  manager: State<'_, MindMapManager>
) -> Result<SaveState, String> {
  let is_saved = manager.is_saved();
  let last_saved_at = manager.get_last_saved_at()
    .map(|dt| dt.to_rfc3339());

  Ok(SaveState {
    is_saved,
    last_saved_at,
  })
}

/// Tauri command to load a mind map and broadcast to all windows
/// Use this when loading from database or file
#[tauri::command]
pub fn load_mind_map<R: tauri::Runtime>(
  manager: State<'_, MindMapManager>,
  app: AppHandle<R>,
  file_name: String
) -> Result<(), String> {
  // Load from disk
  let mind_map = load_mind_map_from_disk(&app, &file_name)?;

  // Update cache (for quick switching)
  update_cache(&manager, file_name.clone(), mind_map.clone());

  // Set as active mind map
  manager.set_active_mind_map(mind_map.clone(), file_name.clone());

  // Add to recent files
  manager.add_recent_file(file_name);

  // Persist the updated state to disk
  let state = manager.get_state();
  persist_active_file_state(&app, &state)?;

  // Update window title
  update_window_title(&app, &mind_map)?;

  // Emit to all windows since this is an external change
  emit_state_update(&app, &mind_map)?;

  Ok(())
}

/// Tauri command to save a mind map to disk and broadcast to all windows
#[tauri::command]
pub fn save_mind_map(
  manager: State<'_, MindMapManager>,
  app: AppHandle,
  mut mind_map: MindMap
) -> Result<(), String> {
  // Get app data directory
  let app_data_dir = files::build_data_path(&app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  // Create directory if it doesn't exist
  std::fs::create_dir_all(&app_data_dir)
    .map_err(|e| format!("Failed to create app data directory: {}", e))?;

  // Build file path - generate filename if not set
  let file_name = if mind_map.file_name.is_empty() {
    format!("{}.json", mind_map.name.replace(" ", "_"))
  } else {
    mind_map.file_name.clone()
  };

  let file_path = app_data_dir.join(&file_name);

  // Update the mind map's file_name field with the actual filename used
  mind_map.file_name = file_name.clone();

  // Update the updated_at timestamp
  mind_map.updated_at = Utc::now().to_rfc3339();

  // Serialize the MindMap to a JSON string (with updated file_name)
  let json_string = serde_json::to_string_pretty(&mind_map)
    .map_err(|e| format!("Failed to serialize mind map: {}", e))?;

  // Write to file
  std::fs::write(&file_path, json_string)
    .map_err(|e| format!("Failed to write file: {}", e))?;

  println!("💾 Mind map saved to: {:?}", file_path);

  // Update cache (for quick switching)
  update_cache(&manager, file_name.clone(), mind_map.clone());

  // Set as active mind map
  manager.set_active_mind_map(mind_map.clone(), file_name.clone());

  // Add to recent files
  manager.add_recent_file(file_name);

  // Persist the updated ActiveFileState to disk
  let state = manager.get_state();
  persist_active_file_state(&app, &state)?;

  // Update window title
  update_window_title(&app, &mind_map)?;

  // Emit to all windows since this is an external change
  emit_state_update(&app, &mind_map)?;

  Ok(())
}

/// Tauri command to flush the current active mind map to disk
#[tauri::command]
pub fn flush_mind_map(
  manager: State<'_, MindMapManager>,
  app: AppHandle
) -> Result<(), String> {
  // Get active mind map and path
  let mind_map = manager.get_active_mind_map();
  let path = manager.get_current_path();

  // If no path set (unsaved new map), skip flushing
  if path.is_empty() || mind_map.file_name.is_empty() {
    println!("⏭️  Skipping flush for unsaved mind map");
    return Ok(());
  }

  // Get app data directory
  let app_data_dir = files::build_data_path(&app)
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  // Create directory if it doesn't exist
  std::fs::create_dir_all(&app_data_dir)
    .map_err(|e| format!("Failed to create app data directory: {}", e))?;

  // Build file path
  let file_path = app_data_dir.join(&path);

  // Serialize the MindMap to a JSON string
  let json_string = serde_json::to_string_pretty(&mind_map)
    .map_err(|e| format!("Failed to serialize mind map: {}", e))?;

  // Write to file
  std::fs::write(&file_path, json_string)
    .map_err(|e| format!("Failed to write file: {}", e))?;

  // Mark as saved
  manager.mark_saved();

  println!("💾 Mind map flushed to disk: {:?}", file_path);

  Ok(())
}

/// Tauri command to update current mind map edges
#[tauri::command]
pub fn update_edges(
  manager: State<'_, MindMapManager>,
  edges: serde_json::Value
) -> Result<(), String> {
  // Update edges in active mind map
  manager.update_edges(edges);

  println!("✅ Edges updated in active mind map");

  Ok(())
}

/// Tauri command to update current mind map nodes
#[tauri::command]
pub fn update_nodes(
  manager: State<'_, MindMapManager>,
  nodes: serde_json::Value
) -> Result<(), String> {
  // Update nodes in active mind map
  manager.update_nodes(nodes);

  println!("✅ Nodes updated in active mind map");

  Ok(())
}

/// Tauri command to open a file dialog and load the selected mind map
#[tauri::command]
pub async fn open_file_dialog<R: tauri::Runtime>(
  manager: State<'_, MindMapManager>,
  app: AppHandle<R>
) -> Result<(), String> {
  use tauri_plugin_dialog::DialogExt;

  println!("📂 Opening file dialog...");

  // Get the default directory (user's documents/AiMindMap folder)
  let default_dir = files::build_data_path(&app)
    .ok()
    .and_then(|path| path.to_str().map(|s| s.to_string()));

  // Build and show the file dialog
  let file_path = app
    .dialog()
    .file()
    .set_title("Open Mind Map")
    .add_filter("Mind Map Files", &["json"])
    .set_directory(default_dir.unwrap_or_default())
    .blocking_pick_file();

  // Handle the selected file
  match file_path {
    Some(path) => {
      println!("📂 File selected: {:?}", path);

      // Convert FilePath to PathBuf
      let path_buf = path.into_path()
        .map_err(|e| format!("Failed to convert file path: {}", e))?;

      // Extract just the filename from the full path
      let file_name = path_buf
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "Invalid file name".to_string())?
        .to_string();

      // Load the mind map from disk
      let mind_map = load_mind_map_from_disk(&app, &file_name)?;

      // Update cache
      update_cache(&manager, file_name.clone(), mind_map.clone());

      // Set as active mind map
      manager.set_active_mind_map(mind_map.clone(), file_name.clone());

      // Add to recent files
      manager.add_recent_file(file_name);

      // Persist the updated state to disk
      let state = manager.get_state();
      persist_active_file_state(&app, &state)?;

      // Update window title
      update_window_title(&app, &mind_map)?;

      // Emit to frontend
      emit_state_update(&app, &mind_map)?;

      println!("✅ Mind map loaded successfully");
      Ok(())
    }
    None => {
      println!("❌ No file selected");
      Err("No file selected".to_string())
    }
  }
}

