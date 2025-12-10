import { Edge, getIncomers, Node } from "@xyflow/react";
import { BaseChatNodeData } from "./models/base-node.data";
import { ChatMessage } from "./types/conversation";

export interface NodeWithThread extends Node { isThread?: boolean };

/**
 * Categorize a parent as either a thread (has grandparents) or immediate parent
 */
export function categorizeParent(
  parent: Node,
  allNodes: Node[],
  allEdges: Edge[]
): { isThread: boolean; ancestors: Node[] } {
  // If parent is a Summary Node, it's always an immediate parent (boundary)
  if (parent.type === 'summary-node') {
    return { isThread: false, ancestors: [parent] };
  }

  const grandparents = getIncomers(parent, allNodes, allEdges);

  // No grandparents = immediate parent
  if (grandparents.length === 0) {
    return { isThread: false, ancestors: [parent] };
  }

  // Has grandparents = thread (collect full ancestry)
  const ancestors = collectAncestorThread(parent, allNodes, allEdges);
  return { isThread: true, ancestors };
}

/**
 * Recursively collect ancestors for a node, stopping at Summary Nodes
 *
 * This function traverses up the conversation tree from a target node to collect
 * all ancestor nodes in depth-first order (deepest/oldest first).
 *
 * IMPORTANT: This function assumes a tree structure where:
 * - Regular nodes have at most ONE parent (enforced by isValidConnection)
 * - Only Summary Nodes (preventDepthTraversal=true) can have multiple parents
 * - Summary Nodes act as boundaries and stop traversal
 *
 * @param node - The node to collect ancestors for
 * @param allNodes - All nodes in the graph
 * @param allEdges - All edges in the graph
 * @returns Array of ancestor nodes ordered by depth (deepest first)
 */
export function collectAncestorThread(
  node: Node,
  allNodes: Node[],
  allEdges: Edge[]
): Node[] {
  // Summary Nodes act as thread boundaries - include them but don't traverse deeper
  if (node.data?.preventDepthTraversal) {
    return [node];
  }

  const parents = getIncomers(node, allNodes, allEdges);

  // No parents - this is a root node
  if (parents.length === 0) {
    return [node];
  }

  // Due to tree structure constraint, regular nodes have exactly one parent
  // (only Summary Nodes can have multiple parents, and they stop traversal above)
  const parent = parents[0];
  const parentAncestors = collectAncestorThread(parent, allNodes, allEdges);

  // Return ancestors followed by current node (depth-first ordering)
  return [...parentAncestors, node];
}

export function selectNodeAndParents(graphNodeArr: Node[], graphEdgeArr: Edge[]) {
  const selected = graphNodeArr.find(node => node.selected);

  if (!selected) {
    return []
  }

  return collectAncestorThread(selected, graphNodeArr, graphEdgeArr)
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

/**
 * Collect all parent threads from a Summary Node
 *
 * Summary Nodes can have multiple parents (each representing a separate conversation thread).
 * This function collects each parent thread independently so they can be summarized separately.
 *
 * @param summaryNode - The Summary Node to collect parent threads from
 * @param allNodes - All nodes in the graph
 * @param allEdges - All edges in the graph
 * @returns Array of threads, where each thread is an array of nodes in depth-first order
 */
export function collectParentThreads(
  summaryNode: Node,
  allNodes: Node[],
  allEdges: Edge[]
): Node[][] {
  const parents = getIncomers(summaryNode, allNodes, allEdges);

  // Each parent represents a separate conversation thread
  // Collect the full ancestry for each parent thread
  return parents.map(parent => collectAncestorThread(parent, allNodes, allEdges));
}

/**
 * Convert a thread (array of nodes) into ChatMessage array
 *
 * Filters nodes to only include those with chat content (BaseChatNodeData instances)
 * and converts them to ChatMessage format for sending to LLM.
 *
 * @param thread - Array of nodes representing a conversation thread
 * @returns Array of ChatMessage objects
 */
export function threadToChatMessages(thread: Node[]): ChatMessage[] {
  const messages: ChatMessage[] = [];

  for (const node of thread) {
    if (node.data instanceof BaseChatNodeData) {
      messages.push(...node.data.toChatArray());
    }
  }

  return messages;
}