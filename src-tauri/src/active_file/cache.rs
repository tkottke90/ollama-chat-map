// Cache operations and helpers
use super::manager::MindMapManager;
use super::types::MindMap;
use std::sync::Arc;

/// Update the cache with a modified mind map
pub(crate) fn update_cache(
  manager: &MindMapManager,
  path: String,
  mind_map: MindMap
) {
  manager.cache.insert(path, Arc::new(mind_map));
}

/// Get the current active mind map from cache or disk (DEPRECATED - use manager.get_active_mind_map() instead)
/// This function is kept for backward compatibility but should not be used in new code
#[allow(dead_code)]
pub(crate) fn get_current_mind_map(
  manager: &MindMapManager,
  _app: &tauri::AppHandle
) -> Result<(MindMap, String), String> {
  // Simply return the active mind map from the manager
  let mind_map = manager.get_active_mind_map();
  let path = manager.get_current_path();

  Ok((mind_map, path))
}

