// MindMapManager - manages state and cache for mind maps
use super::types::{ActiveFileState, MindMap};
use chrono::{DateTime, Utc};
use mini_moka::sync::Cache;
use std::sync::{Arc, RwLock};
use std::time::Duration;

// Manager struct that holds the active mind map and state
pub struct MindMapManager {
  // Current active mind map (always present, never null)
  active_mind_map: Arc<RwLock<MindMap>>,

  // Path to current file
  current_path: Arc<RwLock<String>>,

  // Recent files list
  recent_files: Arc<RwLock<Vec<String>>>,

  // Save state tracking
  is_saved: Arc<RwLock<bool>>,
  last_saved_at: Arc<RwLock<Option<DateTime<Utc>>>>,

  // Optional: Cache for quick file switching
  pub(crate) cache: Cache<String, Arc<MindMap>>,
}

impl MindMapManager {
  /// Create manager with default empty state (used for testing)
  #[allow(dead_code)]
  pub fn new() -> Self {
    let cache = Cache::builder()
      .max_capacity(10)  // Cache last 10 mind maps
      .time_to_idle(Duration::from_secs(5 * 60))  // 5 min idle timeout
      .build();

    Self {
      active_mind_map: Arc::new(RwLock::new(MindMap::default())),
      current_path: Arc::new(RwLock::new(String::new())),
      recent_files: Arc::new(RwLock::new(vec![])),
      is_saved: Arc::new(RwLock::new(true)),
      last_saved_at: Arc::new(RwLock::new(None)),
      cache
    }
  }

  /// Create manager with loaded mind map (used during initialization)
  pub fn with_loaded_mind_map(state: ActiveFileState, mind_map: MindMap) -> Self {
    let cache = Cache::builder()
      .max_capacity(10)
      .time_to_idle(Duration::from_secs(5 * 60))
      .build();

    let path = state.current_mind_map_path
      .unwrap_or_else(|| String::new());

    Self {
      active_mind_map: Arc::new(RwLock::new(mind_map)),
      current_path: Arc::new(RwLock::new(path)),
      recent_files: Arc::new(RwLock::new(state.recent_files)),
      is_saved: Arc::new(RwLock::new(true)), // Freshly loaded = saved
      last_saved_at: Arc::new(RwLock::new(Some(Utc::now()))),
      cache
    }
  }

  /// Get the current active mind map (always succeeds)
  pub fn get_active_mind_map(&self) -> MindMap {
    self.active_mind_map.read().unwrap().clone()
  }

  /// Get the current file path
  pub fn get_current_path(&self) -> String {
    self.current_path.read().unwrap().clone()
  }

  /// Update nodes in the active mind map
  pub fn update_nodes(&self, nodes: serde_json::Value) {
    let mut map = self.active_mind_map.write().unwrap();
    map.nodes = nodes;
    map.updated_at = chrono::Utc::now().to_rfc3339();
    drop(map); // Release lock before marking unsaved

    // Mark as unsaved
    self.mark_unsaved();
  }

  /// Update edges in the active mind map
  pub fn update_edges(&self, edges: serde_json::Value) {
    let mut map = self.active_mind_map.write().unwrap();
    map.edges = edges;
    map.updated_at = chrono::Utc::now().to_rfc3339();
    drop(map); // Release lock before marking unsaved

    // Mark as unsaved
    self.mark_unsaved();
  }

  /// Set a new active mind map (used when loading a different file)
  pub fn set_active_mind_map(&self, mind_map: MindMap, path: String) {
    *self.active_mind_map.write().unwrap() = mind_map;
    *self.current_path.write().unwrap() = path;
  }

  /// Get the recent files list
  #[allow(dead_code)]
  pub fn get_recent_files(&self) -> Vec<String> {
    self.recent_files.read().unwrap().clone()
  }

  /// Add a file to recent files list
  pub fn add_recent_file(&self, path: String) {
    let mut recent = self.recent_files.write().unwrap();
    // Remove if already exists
    recent.retain(|p| p != &path);
    // Add to front
    recent.insert(0, path);
    // Keep only last 10
    recent.truncate(10);
  }

  /// Get ActiveFileState for persistence
  pub fn get_state(&self) -> ActiveFileState {
    let path = self.current_path.read().unwrap();
    let recent = self.recent_files.read().unwrap();

    ActiveFileState {
      current_mind_map_path: if path.is_empty() { None } else { Some(path.clone()) },
      recent_files: recent.clone(),
    }
  }

  /// Mark the mind map as unsaved
  pub fn mark_unsaved(&self) {
    *self.is_saved.write().unwrap() = false;
  }

  /// Mark the mind map as saved
  pub fn mark_saved(&self) {
    *self.is_saved.write().unwrap() = true;
    *self.last_saved_at.write().unwrap() = Some(Utc::now());
  }

  /// Check if the mind map is saved
  pub fn is_saved(&self) -> bool {
    *self.is_saved.read().unwrap()
  }

  /// Get the last saved timestamp
  pub fn get_last_saved_at(&self) -> Option<DateTime<Utc>> {
    *self.last_saved_at.read().unwrap()
  }
}

