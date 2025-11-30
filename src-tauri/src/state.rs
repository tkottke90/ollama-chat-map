// Centralized application state management
//
// This module provides a single AppState struct that holds all configuration
// and state for the backend, making it easier to manage and access state
// across different parts of the application.
//
// State is automatically persisted to disk whenever it changes.

use serde::{Deserialize, Serialize};
use std::sync::RwLock;

use crate::files;
use crate::ollama::{OllamaConfig, OllamaStatus};

const STATE_FILE_NAME: &str = "app_state.json";

// Serializable snapshot of all configs for persistence
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfigSnapshot {
  pub ollama: OllamaConfig,
  // Future configs added here
}

impl Default for AppConfigSnapshot {
  fn default() -> Self {
    Self {
      ollama: OllamaConfig::default(),
    }
  }
}

/// Main application state container
///
/// This struct holds all configuration and runtime state for the application.
/// It is registered with Tauri's state management system and can be accessed
/// from any command handler.
///
/// Each config field is wrapped in RwLock for thread-safe access with
/// optimized read performance (multiple readers, single writer).
///
/// Note: Only configuration is persisted to disk. Runtime status (like OllamaStatus)
/// is not persisted and resets on app restart.
pub struct AppState {
  /// Ollama LLM configuration (domain, port) - persisted
  ollama_config: RwLock<OllamaConfig>,

  /// Ollama runtime status (availability, models) - NOT persisted
  ollama_status: RwLock<OllamaStatus>,

  // Future configs can be added here:
  // ui_config: RwLock<UiConfig>,
  // export_config: RwLock<ExportConfig>,
}

impl AppState {
  /// Create a new AppState with default configurations
  pub fn new() -> Self {
    Self {
      ollama_config: RwLock::new(OllamaConfig::default()),
      ollama_status: RwLock::new(OllamaStatus::default()),
    }
  }

  /// Create AppState from a snapshot (used when loading from disk)
  pub fn from_snapshot(snapshot: AppConfigSnapshot) -> Self {
    Self {
      ollama_config: RwLock::new(snapshot.ollama),
      ollama_status: RwLock::new(OllamaStatus::default()), // Status not persisted
    }
  }

  // =========================================================================
  // Ollama config accessors (persisted)
  // =========================================================================

  /// Get a clone of the current Ollama configuration
  pub fn get_ollama_config(&self) -> OllamaConfig {
    self.ollama_config.read().unwrap().clone()
  }

  /// Update the Ollama configuration and persist to disk
  pub fn set_ollama_config<R: tauri::Runtime>(
    &self,
    app: &tauri::AppHandle<R>,
    config: OllamaConfig
  ) {
    *self.ollama_config.write().unwrap() = config;

    // Auto-persist after change
    if let Err(e) = persist_app_state(app, self) {
      eprintln!("⚠️  Failed to persist app state: {}", e);
    }
  }

  // =========================================================================
  // Ollama status accessors (runtime only, not persisted)
  // =========================================================================

  /// Get a clone of the current Ollama status
  pub fn get_ollama_status(&self) -> OllamaStatus {
    self.ollama_status.read().unwrap().clone()
  }

  /// Update the Ollama status (does NOT persist - runtime only)
  pub fn set_ollama_status(&self, status: OllamaStatus) {
    *self.ollama_status.write().unwrap() = status;
  }

  // =========================================================================
  // Snapshot (for persistence)
  // =========================================================================

  /// Create a snapshot of all current configurations (excludes runtime status)
  pub fn snapshot(&self) -> AppConfigSnapshot {
    AppConfigSnapshot {
      ollama: self.get_ollama_config(),
    }
  }
}

impl Default for AppState {
  fn default() -> Self {
    Self::new()
  }
}

// ============================================================================
// Persistence functions
// ============================================================================

/// Load AppState from disk, returning default if file doesn't exist
pub fn load_app_state<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> AppState {
  match load_app_state_snapshot(app) {
    Ok(snapshot) => {
      println!("✅ Loaded app state from disk");
      AppState::from_snapshot(snapshot)
    }
    Err(e) => {
      println!("📝 No existing app state found ({}), using defaults", e);
      AppState::new()
    }
  }
}

/// Load the raw snapshot from disk
fn load_app_state_snapshot<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>
) -> Result<AppConfigSnapshot, String> {
  let config_dir = files::build_config_path(app)?;
  let state_file_path = config_dir.join(STATE_FILE_NAME);

  if !state_file_path.exists() {
    return Err("State file does not exist".to_string());
  }

  let json_string = std::fs::read_to_string(&state_file_path)
    .map_err(|e| format!("Failed to read state file: {}", e))?;

  let snapshot: AppConfigSnapshot = serde_json::from_str(&json_string)
    .map_err(|e| format!("Failed to deserialize state: {}", e))?;

  Ok(snapshot)
}

/// Persist AppState to disk
pub fn persist_app_state<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  state: &AppState
) -> Result<(), String> {
  let snapshot = state.snapshot();

  let json_string = serde_json::to_string_pretty(&snapshot)
    .map_err(|e| format!("Failed to serialize state: {}", e))?;

  let config_dir = files::build_config_path(app)?;

  // Ensure directory exists
  std::fs::create_dir_all(&config_dir)
    .map_err(|e| format!("Failed to create config directory: {}", e))?;

  let state_file_path = config_dir.join(STATE_FILE_NAME);

  std::fs::write(&state_file_path, json_string)
    .map_err(|e| format!("Failed to write state file: {}", e))?;

  println!("💾 App state persisted to: {:?}", state_file_path);

  Ok(())
}
