import { Edge, getIncomers, Node } from "@xyflow/react";
import { ChatNodeData } from "./models/chat-node.data";
import { ChatMessage } from "./types/conversation";



export function createChatHistory(node: Node, nodes: Node[], edges: Edge[]) {
  const parents = getIncomers(node, nodes, edges);

  const chatArr: ChatMessage[] = []

  parents.forEach(parent => {
    if (parent.data instanceof ChatNodeData) {

      if (parent.data.userMessage)
          chatArr.push(parent.data.userMessage)

      if (parent.data.aiResponse) 
        chatArr.push(parent.data.aiResponse)
    }
  })

  return chatArr;
}