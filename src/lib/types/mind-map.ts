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