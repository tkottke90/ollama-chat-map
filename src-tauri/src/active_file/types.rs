// Data structures for mind map management
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MindMap {
  pub(crate) id: i64,
  pub(crate) name: String,
  pub(crate) description: String,

  #[serde(rename = "fileName")]
  pub(crate) file_name: String,

  pub(crate) nodes: serde_json::Value,
  pub(crate) edges: serde_json::Value,

  pub(crate) created_at: String,
  pub(crate) updated_at: String,
}

impl Default for MindMap {
  fn default() -> Self {
    Self {
      id: 0,
      name: "Untitled".to_string(),
      description: "No description".to_string(),
      file_name: "".to_string(),
      nodes: serde_json::json!([]),
      edges: serde_json::json!([]),
      created_at: Utc::now().to_rfc3339(),
      updated_at: Utc::now().to_rfc3339(),
    }
  }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActiveFileState {
  #[serde(rename = "currentMindMapPath")]
  pub(crate) current_mind_map_path: Option<String>,
  
  #[serde(rename = "recentFiles")]
  pub(crate) recent_files: Vec<String>
}

impl Default for ActiveFileState {
  fn default() -> Self {
    Self {
      current_mind_map_path: None,
      recent_files: vec![]
    }
  }
}

/// Save state information for the frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveState {
  pub is_saved: bool,
  pub last_saved_at: Option<String>, // ISO 8601 timestamp
}

// Helper functions for creating mind maps

/// Create an empty default mind map
pub fn create_empty_mind_map() -> MindMap {
  MindMap {
    id: 0,
    name: "Untitled".to_string(),
    description: "".to_string(),
    file_name: "".to_string(),
    nodes: serde_json::json!([]),
    edges: serde_json::json!([]),
    created_at: Utc::now().to_rfc3339(),
    updated_at: Utc::now().to_rfc3339(),
  }
}

/// Create tutorial mind map for first-time users
pub fn create_tutorial_mind_map() -> MindMap {
  MindMap {
    id: 0,
    name: "Tutorial".to_string(),
    description: "Learn how to use AI Mind Map".to_string(),
    file_name: "tutorial.json".to_string(),
    nodes: serde_json::json!([
      {
        "id": "welcome",
        "type": "llmPrompt",
        "position": { "x": 0, "y": 0 },
        "data": {
          "userMessage": {
            "role": "user",
            "content": "Welcome to AI Mind Map! This is a tutorial node. Try adding more nodes and connecting them to create your mind map."
          }
        }
      },
      {
        "id": "tip1",
        "type": "llmPrompt",
        "position": { "x": 300, "y": 0 },
        "data": {
          "userMessage": {
            "role": "user",
            "content": "Tip: You can drag nodes around to organize your thoughts. Connect nodes by dragging from one node's handle to another."
          }
        }
      }
    ]),
    edges: serde_json::json!([
      {
        "id": "e-welcome-tip1",
        "source": "welcome",
        "target": "tip1"
      }
    ]),
    created_at: Utc::now().to_rfc3339(),
    updated_at: Utc::now().to_rfc3339(),
  }
}

/// Check if this is a first-time user (no mind map files exist)
pub fn is_first_time_user<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> bool {
  let app_data_dir = match app.path().app_data_dir() {
    Ok(dir) => dir,
    Err(_) => return true,
  };

  // Check if any .json files exist (excluding active_file_state.json)
  if let Ok(entries) = std::fs::read_dir(&app_data_dir) {
    for entry in entries.flatten() {
      if let Some(name) = entry.file_name().to_str() {
        if name.ends_with(".json") && name != "active_file_state.json" {
          return false; // Found a mind map file
        }
      }
    }
  }

  true // No mind map files found
}

