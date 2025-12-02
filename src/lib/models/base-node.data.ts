import { Position } from "@xyflow/react";
import { LucideIcon, Orbit } from "lucide-preact";
import { ChatMessage } from "../types/conversation";


export class BaseNodeData {
  [key: string]: unknown;

  label: string = 'Node'
  icon: LucideIcon = Orbit
  showDebug = false;
  direction: 'TB' | 'LR' = 'TB'


  get topHandlePos() {
    return this.direction === 'TB' ? Position.Top : Position.Left
  }

  get bottomHandlePos() {
    return this.direction === 'TB' ? Position.Bottom : Position.Right
  }
}

/**
 * Node Data type for any node which should be included
 * when creating chat history or calling the `/chat` endpoint
 * of the LLM Engine API (ex: Ollama)
 */
export class BaseChatNodeData extends BaseNodeData {
  model: string = 'mistral:7b';
  content: string = '';

  toChatMessage(): ChatMessage {
    return {
      role: 'user',
      content: this.content
    }
  }

  toChatArray(): ChatMessage[] {
    return [this.toChatMessage()];
  }
}


export type NodeDefinitionInput<TNode extends BaseNodeData> = Omit<Partial<TNode>, 'data'> & { data?: Record<keyof TNode['data'], unknown>} 