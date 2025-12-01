import { invoke } from "@tauri-apps/api/core";
import { ChatMessage } from "./types/conversation";

export interface OllamaConfig {
  domain: string;
  port: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface OllamaStatus {
  isAvailable: boolean;
  models: OllamaModel[];
  lastChecked: string;
  errorMessage: string | null;
}

export function getOllamaConfig() {
  return invoke<OllamaConfig>("get_ollama_config");
}

export function setOllamaConfig(config: OllamaConfig) {
  return invoke<void>("set_ollama_config", { config });
}

export function getOllamaStatus() {
  return invoke<OllamaStatus>("get_ollama_status");
}

export function ollamaChat(model: string, messages: ChatMessage[]) {
  return invoke<ChatMessage>("ollama_chat", { model, messages });
}
