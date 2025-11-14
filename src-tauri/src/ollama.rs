use ollama_rs::Ollama;
use ollama_rs::generation::chat::ChatMessage as OllamaChatMessage;
use ollama_rs::generation::chat::request::ChatMessageRequest;

use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OllamaConfig {
  domain: String,
  port: u16
}

impl Default for OllamaConfig {
  fn default() -> Self {
    Self {
      domain: "http://localhost".into(),
      port: 11434,
    }
  }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
  role: String,
  content: String
}

#[tauri::command]
pub async fn set_ollama_config(
  app: tauri::AppHandle,
  domain: String,
  port: u16
) {
  let state_mutex = app.state::<Mutex<OllamaConfig>>();
  let mut state = state_mutex.lock().unwrap();
  
  state.domain = domain;
  state.port = port;
}

#[tauri::command]
pub async fn ollama_chat(
  app: tauri::AppHandle,
  model: String,
  messages: Vec<ChatMessage>
) -> Result<ChatMessage, String> {
  println!("Ollama Chat Called");

  // Pull Ollama API Base URL from config
  let ollama = {
    let state_mutex = app.state::<Mutex<OllamaConfig>>();
    let state = state_mutex.lock().unwrap();
    Ollama::new(state.domain.clone(), state.port)
  }; // MutexGuard is dropped here

  println!("Ollama Chat Called");

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