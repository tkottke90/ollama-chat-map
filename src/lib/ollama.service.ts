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

/**
 * Generate a completion using Ollama's generate API (non-chat mode)
 *
 * This is useful for single-shot text generation without conversation history.
 * Unlike chat mode, this doesn't maintain message history and is simpler for
 * tasks like summarization, text generation, or one-off completions.
 *
 * @param model - The model to use for generation (e.g., "llama2:latest")
 * @param prompt - The prompt text to generate from
 * @returns The generated text
 */
export function ollamaGenerate(model: string, prompt: string) {
  return invoke<string>("ollama_generate", { model, prompt });
}

export function ollamaChat(model: string, messages: ChatMessage[]) {
  return invoke<ChatMessage>("ollama_chat", { model, messages });
}
