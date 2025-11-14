

class NodeRegistry {
  private nodes: Record<string, any> = {};

  register(nodeName: string, node: any) {
    this.nodes[nodeName] = node;
  }

  toObject() {
    return this.nodes;
  }

}



export default new NodeRegistry();