// Documentation: https://crates.io/crates/ollama-rs
use ollama_rs::Ollama;
use ollama_rs::generation::chat::ChatMessage as OllamaChatMessage;
use ollama_rs::generation::chat::request::ChatMessageRequest;

use tauri::Manager;
use serde::{Deserialize, Serialize};

use crate::state::AppState;

/// Configuration for connecting to Ollama server
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct OllamaConfig {
  pub domain: String,
  pub port: u16
}

impl Default for OllamaConfig {
  fn default() -> Self {
    Self {
      domain: "http://localhost".into(),
      port: 11434,
    }
  }
}

/// Represents an available Ollama model
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OllamaModel {
  pub name: String,
  pub size: u64,
  pub modified_at: String,
}

/// Runtime status of Ollama server (not persisted to disk)
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OllamaStatus {
  pub is_available: bool,
  pub models: Vec<OllamaModel>,
  pub last_checked: String,
  pub error_message: Option<String>,
}

impl Default for OllamaStatus {
  fn default() -> Self {
    Self {
      is_available: false,
      models: vec![],
      last_checked: chrono::Utc::now().to_rfc3339(),
      error_message: None,
    }
  }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
  pub role: String,
  pub content: String
}

// ============================================================================
// Tauri Commands
// ============================================================================

#[tauri::command]
pub fn get_ollama_config(app: tauri::AppHandle) -> OllamaConfig {
  let app_state = app.state::<AppState>();
  app_state.get_ollama_config()
}

#[tauri::command]
pub async fn set_ollama_config(
  app: tauri::AppHandle,
  config: OllamaConfig
) {
  let app_state = app.state::<AppState>();
  app_state.set_ollama_config(&app, config);
}

/// Get the current Ollama status (availability and models)
#[tauri::command]
pub fn get_ollama_status(app: tauri::AppHandle) -> OllamaStatus {
  let app_state = app.state::<AppState>();
  app_state.get_ollama_status()
}

#[tauri::command]
pub async fn ollama_chat(
  app: tauri::AppHandle,
  model: String,
  messages: Vec<ChatMessage>
) -> Result<ChatMessage, String> {
  println!("Ollama Chat Called");

  // Check if Ollama is available first
  let status = app.state::<AppState>().get_ollama_status();
  if !status.is_available {
    return Err("Ollama server is not available. Please check your connection settings.".to_string());
  }

  // Pull Ollama API Base URL from config
  let ollama = {
    let config = app.state::<AppState>().get_ollama_config();
    Ollama::new(config.domain, config.port)
  };

  // Convert ChatMessage to ollama-rs ChatMessage format
  let ollama_messages: Vec<OllamaChatMessage> = messages
    .iter()
    .map(|msg| {
      match msg.role.as_str() {
        "user" => OllamaChatMessage::user(msg.content.clone()),
        "assistant" => OllamaChatMessage::assistant(msg.content.clone()),
        "system" => OllamaChatMessage::system(msg.content.clone()),
        _ => OllamaChatMessage::user(msg.content.clone()), // default to user
      }
    })
    .collect();

  // Make HTTP Request to Ollama with Chat messages
  let request = ChatMessageRequest::new(model, ollama_messages);

  // Handle Success/Failure Response
  let response = ollama
    .send_chat_messages(request)
    .await
    .map_err(|e| format!("Ollama API error: {}", e))?;

  // Respond with a Chat Message struct
  Ok(ChatMessage {
    role: "assistant".to_string(),
    content: response.message.content,
  })
}

// ============================================================================
// Background Health Check
// ============================================================================

/// Check Ollama availability and update status
/// Returns the new status
pub async fn check_ollama_health<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> OllamaStatus {
  let config = app.state::<AppState>().get_ollama_config();
  let ollama = Ollama::new(config.domain.clone(), config.port);

  let status = match ollama.list_local_models().await {
    Ok(models) => {
      let model_list: Vec<OllamaModel> = models
        .into_iter()
        .map(|m| OllamaModel {
          name: m.name,
          size: m.size,
          modified_at: m.modified_at,
        })
        .collect();

      OllamaStatus {
        is_available: true,
        models: model_list,
        last_checked: chrono::Utc::now().to_rfc3339(),
        error_message: None,
      }
    }
    Err(e) => {
      OllamaStatus {
        is_available: false,
        models: vec![],
        last_checked: chrono::Utc::now().to_rfc3339(),
        error_message: Some(format!("{}", e)),
      }
    }
  };

  // Update the app state
  app.state::<AppState>().set_ollama_status(status.clone());

  status
}

/// Start the background health check task
/// Checks Ollama every `interval_secs` seconds and emits status events
pub fn start_health_check_task<R: tauri::Runtime + 'static>(
  app: tauri::AppHandle<R>,
  interval_secs: u64
) {
  use std::time::Duration;
  use tauri::Emitter;
  use crate::app_menu;

  tauri::async_runtime::spawn(async move {
    // Small initial delay to let the app fully start
    tokio::time::sleep(Duration::from_secs(1)).await;

    let mut interval = tokio::time::interval(Duration::from_secs(interval_secs));
    let mut last_available: Option<bool> = None;

    loop {
      interval.tick().await;

      let config = app.state::<AppState>().get_ollama_config();
      let status = check_ollama_health(&app).await;

      // Emit status change event to frontend
      if let Err(e) = app.emit("ollama-status-changed", &status) {
        eprintln!("⚠️  Failed to emit ollama status event: {}", e);
      }

      // Update tray menu with current config and status
      app_menu::update_tray_ollama_info(&app, &config, &status);

      // Log only when status changes
      let availability_changed = last_available != Some(status.is_available);
      if availability_changed {
        if status.is_available {
          println!("✅ Ollama is available ({} models)", status.models.len());
        } else {
          println!("❌ Ollama is unavailable: {:?}", status.error_message);
        }
        last_available = Some(status.is_available);

        // Update tray icon based on availability
        update_tray_icon(&app, status.is_available);
      }
    }
  });
}

/// Update the tray icon based on Ollama availability
fn update_tray_icon<R: tauri::Runtime>(app: &tauri::AppHandle<R>, is_available: bool) {
  use tauri::tray::TrayIconId;

  // Load the appropriate icon using Tauri's icon loading
  let icon = if is_available {
    tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))
  } else {
    tauri::image::Image::from_bytes(include_bytes!("../icons/robot-dead/32x32.png"))
  };

  let icon = match icon {
    Ok(img) => img,
    Err(e) => {
      eprintln!("⚠️  Failed to load tray icon: {}", e);
      return;
    }
  };

  // Get the tray icon and update it
  if let Some(tray) = app.tray_by_id(&TrayIconId::new("main")) {
    if let Err(e) = tray.set_icon(Some(icon)) {
      eprintln!("⚠️  Failed to set tray icon: {}", e);
    }
  }
}