// MindMapManager - manages state and cache for mind maps
use super::types::{ActiveFileState, MindMap};
use mini_moka::sync::Cache;
use std::sync::{Arc, Mutex};
use std::time::Duration;

// Manager struct that holds both state and cache
pub struct MindMapManager {
  // Persisted state (just paths)
  pub(crate) state: Mutex<ActiveFileState>,
  // In-memory cache (not persisted)
  pub(crate) cache: Cache<String, Arc<MindMap>>
}

impl MindMapManager {
  pub fn new() -> Self {
    let cache = Cache::builder()
      .max_capacity(10)  // Cache last 10 mind maps
      .time_to_idle(Duration::from_secs(5 * 60))  // 5 min idle timeout
      .build();

    Self {
      state: Mutex::new(ActiveFileState::default()),
      cache
    }
  }

  pub fn with_state(state: ActiveFileState) -> Self {
    let cache = Cache::builder()
      .max_capacity(10)
      .time_to_idle(Duration::from_secs(5 * 60))
      .build();

    Self {
      state: Mutex::new(state),
      cache
    }
  }
}

