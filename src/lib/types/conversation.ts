

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool' | string
  content: string
}