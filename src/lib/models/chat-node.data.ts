import { MessageSquareText } from "lucide-preact";
import { ChatMessage } from "../types/conversation";
import { BaseChatNodeData } from "./base-node.data";

export class ChatNodeData extends BaseChatNodeData {
  /**
   * Controls if the node can be edited.  This is disabled after
   * the llm message is generated to maintain the conversational
   * history. Unlocking a locked node should remove the aiResponse
   * message
   */
  locked: boolean = false;
  
  /**
   * The AI's response to a users message
   */
  aiResponse?: ChatMessage;

  icon = MessageSquareText

  constructor(data?: Partial<ChatNodeData>) {
    super();
    Object.assign(this, data);
  }

  get userMessage() {
    return this.toChatMessage();
  }

  /**
   * Helper method which locks the user message
   * when the user submits a message.  This ensures
   * that the AI Response is directly aligned with
   * the user message
   */
  addAIMessage(message: string | ChatMessage) {
    this.aiResponse = typeof message === 'string' ? { role: 'assistant', content: message } : message

    return this;
  }

  /**
   * Helper method which locks the user message
   * when the user submits a message.  This ensures
   * that the AI Response is directly aligned with
   * the user message
   */
  addUserMessage(message: string | ChatMessage) {
    this.locked = true;
    this.content = typeof message === 'string' ? message : message.content;

    return this;
  }
  
  /**
   * Helper method which unlocks the user message
   * and clears the aiResponse
   */
  editUserMessage() {
    this.locked = false;
    this.aiResponse = undefined;

    return this;
  }

  set<TKey extends keyof ChatNodeData>(key: TKey, value: ChatNodeData[TKey]) {
    this[key] = value as this[TKey];

    return this;
  }

  /**
   * Utility method which returns an array of messages to send to the LLM
   * @returns An array of ChatMessage objects
   */
  toChatArray(): ChatMessage[] {
    return [
      this.toChatMessage(),
      this.aiResponse
    ].filter(Boolean) as ChatMessage[];
  }

  static toChatNodeData(data: Record<string, unknown>) {
    return data instanceof ChatNodeData
      ? data
      : new ChatNodeData(data as Partial<ChatNodeData>);
  }
}