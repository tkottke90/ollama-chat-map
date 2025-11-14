import { Edge, Node } from "@xyflow/react";

export interface MindMap {
  id: number;
  name: string;
  description: string;

  nodes: Node[];
  edges: Edge[];

  created_at: string;
  updated_at: string;
}