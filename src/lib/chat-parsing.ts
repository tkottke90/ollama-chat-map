import { Edge, getIncomers, Node } from "@xyflow/react";
import { BaseChatNodeData } from "./models/base-node.data";
import { ChatMessage } from "./types/conversation";

export interface NodeWithThread extends Node { isThread?: boolean };

/**
 * Performs a recursive breath-first search on the node tree and collects all of the parent
 * nodes, plus their grandparents into arrays of nodes.  If a node is used by 
 * multiple grandparents, it is duplicated
 * @param target The node to start with
 * @param graphNodeArr The full array of nodes (used to parse the hierarchy)
 * @param graphEdgeArr The full array of edges (used to parse the hierarchy)
 */
function getLinearNodeHierarchy(target: Node, graphNodeArr: NodeWithThread[], graphEdgeArr: Edge[]) {
  const parents: Record<string, Node[]> = {}

  const parentNodes = getIncomers(target, graphNodeArr, graphEdgeArr);

  parentNodes.forEach(parent => {
    parents[parent.id] = [parent];

    const parentHistory = getLinearNodeHierarchy(parent, graphNodeArr, graphEdgeArr);

    for (const grandparent in parentHistory) {
      
    }
  });

  return parents;
}

function getNodeAndParents(target: Node, graphNodeArr: NodeWithThread[], graphEdgeArr: Edge[]) {
  const response: NodeWithThread[] = [];
  
  const parents = getIncomers(target, graphNodeArr, graphEdgeArr);

  parents.forEach(parent => {
    const grandParents = getIncomers(parent, graphNodeArr, graphEdgeArr);

    // If the parent node has parents, then
    // we mark nodes as a thread
    if (grandParents.length > 0) {
      response.push({ ...parent, isThread: true })
    } else {
      response.push({ ...parent, isThread: false })
    }
  });

  response.push({ ...target, isThread: true });

  return response;
}

export function selectNodeAndParents(graphNodeArr: Node[], graphEdgeArr: Edge[]) {
  const selected = graphNodeArr.find(node => node.selected);

  if (!selected) {
    return []
  }

  return getNodeAndParents(selected, graphNodeArr, graphEdgeArr)
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