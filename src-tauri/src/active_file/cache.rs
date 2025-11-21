// Cache operations and helpers
use super::manager::MindMapManager;
use super::persistence::load_mind_map_from_disk;
use super::types::MindMap;
use std::sync::Arc;
use tauri::AppHandle;

/// Update the cache with a modified mind map
pub(crate) fn update_cache(
  manager: &MindMapManager,
  path: String,
  mind_map: MindMap
) {
  manager.cache.insert(path, Arc::new(mind_map));
}

/// Get the current active mind map from cache or disk
/// Returns both the mind map and its file path
/// If no active mind map exists, creates a default in-memory mind map (lazy creation)
pub(crate) fn get_current_mind_map(
  manager: &MindMapManager,
  app: &AppHandle
) -> Result<(MindMap, String), String> {
  // Get the current mind map path from state
  let state = manager.state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  // If no active mind map, use a default in-memory one (lazy creation)
  let path_clone = if let Some(path) = &state.current_mind_map_path {
    path.clone()
  } else {
    drop(state);
    println!("📝 No active mind map - creating default in-memory mind map");
    let default_map = MindMap::default();
    let default_path = "untitled.json".to_string();

    // Cache the default mind map (but don't persist to disk yet)
    update_cache(manager, default_path.clone(), default_map.clone());

    return Ok((default_map, default_path));
  };

  drop(state); // Release lock before I/O

  // Try to get from cache first, otherwise load from disk
  let mind_map = if let Some(cached) = manager.cache.get(&path_clone) {
    (*cached).clone()
  } else {
    load_mind_map_from_disk(app, &path_clone)?
  };

  Ok((mind_map, path_clone))
}

