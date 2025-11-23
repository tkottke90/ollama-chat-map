import { Node } from "@xyflow/react";
import { NodeDefinitionInput } from "./models/base-node.data";

type NodeFactory = (input: NodeDefinitionInput<any>) => Node;

class NodeRegistry {
  private nodes: Record<string, any> = {};
  private nodeFactories: Map<string, NodeFactory> = new Map();

  register(nodeName: string, node: any, factory: NodeFactory) {
    this.nodes[nodeName] = node;
    this.nodeFactories.set(nodeName, factory);
  }

  toObject() {
    return this.nodes;
  }

  restoreNodes(nodes: Array<NodeDefinitionInput<any>>) {
    return nodes
      // Filter only nodes that have a type
      .filter(node => node.type)
      // Create nodes via the associated factory
      .map(node => {
        const factory = this.nodeFactories.get(node.type);
  
        if (!factory) {
          throw new Error('Missing factory for ' + node.type);
        }

        return factory(node);
      });
      
  }

}

export default new NodeRegistry();