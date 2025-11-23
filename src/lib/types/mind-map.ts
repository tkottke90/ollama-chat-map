import { Edge, Node, Viewport } from "@xyflow/react";

export interface MindMap {
  id: number;
  name: string;
  fileName: string;
  description: string;

  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;

  created_at: string;
  updated_at: string;
}

/**
 * Data structure of the stored JSON Mind Map before it has been ingested into 
 * the React Flow Elements
 */
export interface PersistentMindMap extends Omit<MindMap, 'nodes' | 'edges'> {
  nodes: Record<string, any>[];
  edges: Record<string, any>[];  
}