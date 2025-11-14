// Tools for managing the active state map
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, AppHandle, Emitter};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MindMap {
  id: i64,
  name: String,
  description: String,

  nodes: serde_json::Value,
  edges: serde_json::Value,

  created_at: String,
  updated_at: String,
}

impl Default for MindMap {
  fn default() -> Self {
    Self {
      id: 0,
      name: "Untitled".to_string(),
      description: "No description".to_string(),
      nodes: serde_json::json!([]),
      edges: serde_json::json!([]),
      created_at: Utc::now().to_rfc3339(),
      updated_at: Utc::now().to_rfc3339(),
    }
  }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActiveFileState {
  current_mind_map: Option<MindMap>
}

impl Default for ActiveFileState {
  fn default() -> Self {
    Self {
      current_mind_map: None
    }
  }
}

// Helper function to emit state updates to the frontend
fn emit_state_update(app: &AppHandle, mind_map: &MindMap) -> Result<(), String> {
  app.emit("state-updated", mind_map)
    .map_err(|e| format!("Failed to emit state update: {}", e))
}

// Tauri command to update the entire nodes array
// Note: Does not emit events - frontend already has the updated state
#[tauri::command]
pub fn update_nodes(
  state: State<'_, Mutex<ActiveFileState>>,
  nodes: serde_json::Value
) -> Result<(), String> {
  let mut state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  if let Some(mind_map) = &mut state_mutex.current_mind_map {
    mind_map.nodes = nodes;
    mind_map.updated_at = Utc::now().to_rfc3339();
  } else {
    return Err("No active mind map".to_string());
  }

  Ok(())
}

// Tauri command to update the entire edges array
// Note: Does not emit events - frontend already has the updated state
#[tauri::command]
pub fn update_edges(
  state: State<'_, Mutex<ActiveFileState>>,
  edges: serde_json::Value
) -> Result<(), String> {
  let mut state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  if let Some(mind_map) = &mut state_mutex.current_mind_map {
    mind_map.edges = edges;
    mind_map.updated_at = Utc::now().to_rfc3339();
  } else {
    return Err("No active mind map".to_string());
  }

  Ok(())
}

// Tauri command to get the current mind map state
#[tauri::command]
pub fn get_mind_map(
  state: State<'_, Mutex<ActiveFileState>>
) -> Result<Option<MindMap>, String> {
  let state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  Ok(state_mutex.current_mind_map.clone())
}

// Tauri command to load a mind map and broadcast to all windows
// Use this when loading from database or file
#[tauri::command]
pub fn load_mind_map(
  state: State<'_, Mutex<ActiveFileState>>,
  app: AppHandle,
  mind_map: MindMap
) -> Result<(), String> {
  let mut state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  state_mutex.current_mind_map = Some(mind_map.clone());

  // Emit to all windows since this is an external change
  emit_state_update(&app, &mind_map)?;

  Ok(())
}

// Tauri command to create a new mind map
#[tauri::command]
pub fn create_mind_map(
  state: State<'_, Mutex<ActiveFileState>>,
  app: AppHandle,
  name: String,
  description: String
) -> Result<(), String> {
  let mut state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  let new_mind_map = MindMap {
    id: 0, // TODO: Generate proper ID or get from database
    name,
    description,
    nodes: serde_json::json!([]),
    edges: serde_json::json!([]),
    created_at: Utc::now().to_rfc3339(),
    updated_at: Utc::now().to_rfc3339(),
  };

  state_mutex.current_mind_map = Some(new_mind_map.clone());
  emit_state_update(&app, &new_mind_map)?;

  Ok(())
}

// Legacy command - kept for backwards compatibility
#[tauri::command]
pub fn add_node(
  state: State<'_, Mutex<ActiveFileState>>,
  app: AppHandle,
  node: serde_json::Value
) -> Result<(), String> {
  let mut state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  if let Some(mind_map) = &mut state_mutex.current_mind_map {
    if let Some(nodes_array) = mind_map.nodes.as_array_mut() {
      nodes_array.push(node);
      mind_map.updated_at = Utc::now().to_rfc3339();

      // Emit the update while we still have the lock
      emit_state_update(&app, mind_map)?;
    } else {
      return Err("Nodes is not an array".to_string());
    }
  } else {
    return Err("No active mind map".to_string());
  }

  Ok(())
}

// Legacy command - kept for backwards compatibility
#[tauri::command]
pub fn add_edge(
  state: State<'_, Mutex<ActiveFileState>>,
  app: AppHandle,
  edge: serde_json::Value
) -> Result<(), String> {
  let mut state_mutex = state.lock()
    .map_err(|e| format!("Failed to lock state: {}", e))?;

  if let Some(mind_map) = &mut state_mutex.current_mind_map {
    if let Some(edges_array) = mind_map.edges.as_array_mut() {
      edges_array.push(edge);
      mind_map.updated_at = Utc::now().to_rfc3339();

      emit_state_update(&app, mind_map)?;
    } else {
      return Err("Edges is not an array".to_string());
    }
  } else {
    return Err("No active mind map".to_string());
  }

  Ok(())
}