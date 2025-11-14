

export class BaseNodeData {
  [key: string]: unknown;

  showDebug = false;
}

export type NodeDefinitionInput<TNode extends BaseNodeData> = Omit<Partial<TNode>, 'data'> & { data?: Record<keyof TNode['data'], unknown>} 