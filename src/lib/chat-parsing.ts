import { Edge, getIncomers, Node } from "@xyflow/react";
import { BaseChatNodeData } from "./models/base-node.data";
import { ChatMessage } from "./types/conversation";



export function createChatHistory(targetNode: Node, targetNodeChat: ChatMessage[], graphNodeArr: Node[], graphEdgeArr: Edge[]) {
  const parents = getIncomers(targetNode, graphNodeArr, graphEdgeArr);

  const chatArr: ChatMessage[] = [...targetNodeChat]

  parents.forEach(parent => {
    if (parent.data instanceof BaseChatNodeData) {
      return parent.data.toChatArray();
    }
  })

  return chatArr;
}