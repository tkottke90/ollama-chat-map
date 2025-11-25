import { LucideIcon, Orbit } from "lucide-preact";


export class BaseNodeData {
  [key: string]: unknown;

  icon: LucideIcon = Orbit
  showDebug = false;
}

export type NodeDefinitionInput<TNode extends BaseNodeData> = Omit<Partial<TNode>, 'data'> & { data?: Record<keyof TNode['data'], unknown>} 