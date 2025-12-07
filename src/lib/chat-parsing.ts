import { Edge, getIncomers, Node } from "@xyflow/react";
import { BaseChatNodeData } from "./models/base-node.data";
import { ChatMessage } from "./types/conversation";

export function selectNodeAndParents(graphNodeArr: Node[], graphEdgeArr: Edge[]) {
  const selected = graphNodeArr.find(node => node.selected);

  if (!selected) {
    return []
  }

  const parents = getIncomers(selected, graphNodeArr, graphEdgeArr);

  return parents.concat(selected);
}

export function createChatHistory(targetNode: Node, targetNodeChat: ChatMessage[], graphNodeArr: Node[], graphEdgeArr: Edge[]) {
  const parents = getIncomers(targetNode, graphNodeArr, graphEdgeArr);

  const chatArr: ChatMessage[] = [...targetNodeChat]

  parents.forEach(parent => {
    if (parent.data instanceof BaseChatNodeData) {
      chatArr.push(...parent.data.toChatArray());
    }
  })

  return chatArr;
}