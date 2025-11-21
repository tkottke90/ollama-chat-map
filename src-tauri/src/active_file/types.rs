// Data structures for mind map management
use chrono::Utc;
use serde::{Deserialize, Serialize};

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

