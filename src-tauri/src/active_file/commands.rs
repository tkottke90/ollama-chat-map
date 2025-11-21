// Tauri command handlers for mind map operations
use super::cache::{get_current_mind_map, update_cache};
use super::manager::MindMapManager;
use super::persistence::{load_mind_map_from_disk, persist_active_file_state};
use super::types::MindMap;
use chrono::Utc;
use tauri::{AppHandle, Emitter, Manager, State};

/// Helper function to emit state updates to the frontend
fn emit_state_update(app: &AppHandle, mind_map: &MindMap) -> Result<(), String> {
  app.emit("aiMindMap://mindMap/update", mind_map)
    .map_err(|e| format!("Failed to emit state update: {}", e))
}

/// Tauri command to create a new mind map
#[tauri::command]
pub fn create_mind_map(
  manager: State<'_, MindMapManager>,
  app: AppHandle,
  name: String,
  description: String
) -> Result<(), String> {
  let new_mind_map = MindMap {
    id: 0, // TODO: Generate proper ID or get from database
    name,
    description,
    file_name: "".to_string(),
    nodes: serde_json::json!([]),
    edges: serde_json::json!([]),
    created_at: Utc::now().to_rfc3339(),
    updated_at: Utc::now().to_rfc3339(),
  };

  // Don't cache yet - wait until first save
  // Clear the current path since this is a new unsaved mind map
  let mut state = manager.state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  state.current_mind_map_path = None;

  // Persist the updated ActiveFileState to disk
  persist_active_file_state(&app, &state)?;

  // Emit to frontend
  emit_state_update(&app, &new_mind_map)?;

  Ok(())
}

/// Tauri command to get the current mind map state
/// Always returns a mind map (creates default if none exists)
#[tauri::command]
pub fn get_mind_map(
  manager: State<'_, MindMapManager>,
  app: AppHandle
) -> Result<MindMap, String> {
  // With lazy creation, this always succeeds
  let (mind_map, _path) = get_current_mind_map(&manager, &app)?;
  Ok(mind_map)
}

/// Tauri command to load a mind map and broadcast to all windows
/// Use this when loading from database or file
#[tauri::command]
pub fn load_mind_map(
  manager: State<'_, MindMapManager>,
  app: AppHandle,
  file_name: String
) -> Result<(), String> {
  // Load from disk
  let mind_map = load_mind_map_from_disk(&app, &file_name)?;

  // Update cache using helper
  update_cache(&manager, file_name.clone(), mind_map.clone());

  // Update state
  let mut state = manager.state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  state.current_mind_map_path = Some(file_name);

  // Persist the updated state to disk
  persist_active_file_state(&app, &state)?;

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
  let app_data_dir = app.path().app_data_dir()
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

  println!("Mind map saved to: {:?}", file_path);

  // Update cache (after successful disk write) using helper
  update_cache(&manager, file_name.clone(), mind_map.clone());

  // Update state (just the path)
  let mut state = manager.state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  state.current_mind_map_path = Some(file_name);

  // Persist the updated ActiveFileState to disk
  persist_active_file_state(&app, &state)?;

  // Emit to all windows since this is an external change
  emit_state_update(&app, &mind_map)?;

  Ok(())
}

/// Tauri command to flush the current cached mind map to disk
#[tauri::command]
pub fn flush_mind_map(
  manager: State<'_, MindMapManager>,
  app: AppHandle
) -> Result<(), String> {
  // Check cache size - if we have 2 or more entries, skip the flush
  // This indicates there haven't been many changes recently
  let cache_size = manager.cache.entry_count();
  if cache_size >= 2 {
    println!("⏭️  Skipping flush - cache has {} entries (threshold: 2)", cache_size);
    return Ok(());
  }

  // Get current mind map from cache or disk
  let (mind_map, path) = get_current_mind_map(&manager, &app)?;

  // If this is the default "untitled.json" and hasn't been saved yet, skip flushing
  if path == "untitled.json" && mind_map.file_name.is_empty() {
    println!("⏭️  Skipping flush for unsaved default mind map");
    return Ok(());
  }

  // Get app data directory
  let app_data_dir = app.path().app_data_dir()
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

  println!("💾 Mind map flushed to disk: {:?}", file_path);

  // After successful flush, clean up the cache by removing all entries except the current one
  // Collect all keys except the current path
  let keys_to_remove: Vec<String> = manager.cache
    .iter()
    .filter_map(|entry| {
      let key = entry.key().clone();
      if key != path {
        Some(key)
      } else {
        None
      }
    })
    .collect();

  // Remove all old entries from cache
  for key in &keys_to_remove {
    manager.cache.invalidate(key);
  }

  if !keys_to_remove.is_empty() {
    println!("🧹 Cleaned up {} old cache entries", keys_to_remove.len());
  }

  Ok(())
}

/// Tauri command to update current mind map edges
#[tauri::command]
pub fn update_edges(
  manager: State<'_, MindMapManager>,
  app: AppHandle,
  edges: serde_json::Value
) -> Result<(), String> {
  // Get current mind map from cache or disk
  let (mut mind_map, path) = get_current_mind_map(&manager, &app)?;

  // Update edges
  mind_map.edges = edges;
  mind_map.updated_at = Utc::now().to_rfc3339();

  // Update cache immediately (fast, in-memory)
  update_cache(&manager, path, mind_map.clone());

  println!("✅ Edges updated in cache for: {}", mind_map.file_name);

  Ok(())
}

/// Tauri command to update current mind map nodes
#[tauri::command]
pub fn update_nodes(
  manager: State<'_, MindMapManager>,
  app: AppHandle,
  nodes: serde_json::Value
) -> Result<(), String> {
  // Get current mind map from cache or disk
  let (mut mind_map, path) = get_current_mind_map(&manager, &app)?;

  // Update nodes
  mind_map.nodes = nodes;
  mind_map.updated_at = Utc::now().to_rfc3339();

  // Update cache immediately (fast, in-memory)
  update_cache(&manager, path, mind_map.clone());

  println!("✅ Nodes updated in cache for: {}", mind_map.file_name);

  Ok(())
}

