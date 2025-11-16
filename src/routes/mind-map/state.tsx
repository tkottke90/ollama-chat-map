import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { MindMap } from "@/lib/types/mind-map";
import { BaseProps, Nullable } from "@/lib/utility-types";
import { addEdge, Connection, Edge, Node, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { createContext } from "preact";
import { useCallback, useContext, useState } from "preact/hooks";

export type AddNodeFn = (input: NodeDefinitionInput<any>) => Node;
export type AddNodeFactory = (factory: AddNodeFn) => void;


const stateContext = createContext<{ mindMap: Nullable<MindMap> }>({} as any);

export function useMindMapState(
  initialNodes: Node[] =  [],
  initialEdges: Edge[] = []
) {
  const { getNodes } = useReactFlow();
  const [ nodes, setNodes, onNodesChange ] = useNodesState(initialNodes);
  const [ edges, setEdges, onEdgesChange ] = useEdgesState(initialEdges);

  const [ mindMap, setMindMap ] = useState<Nullable<MindMap>>({
    id: 1,
    name: 'Untitled',
    description: 'No description',
    nodes: initialNodes,
    edges: initialEdges,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const StateContext = useCallback(
    (props: BaseProps) => <stateContext.Provider value={{ mindMap }} {...props} />,
    [ mindMap ]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((prev) => {
        return addEdge(connection, prev)
      });
    },
    [],
  );

  const onAddNode = useCallback((nodeFactory: AddNodeFn) => {
    // Get the position of the last node
    const nodes = getNodes();
    const lastNode = nodes.at(-1);

    // Create next node position 100 below the last node
    const pos = {
      x: lastNode?.position.x ?? 0,
      y: (lastNode?.position.y ?? 0) + (lastNode?.measured?.height ?? 0) + 50
    }

    // Create new node
    const newNode = nodeFactory({ showDebug: false, position: pos })

    // Check if we have a selectedNode
    const selected = getNodes();

    // Create edges
    const newEdges: Edge[] = selected
      .filter(node => 
        // Find nodes that are selected
        node.selected
      ).map(node => ({
        id: crypto.randomUUID(),
        source: node.id,
        target: newNode.id
      }))

    setNodes((prev) => prev.concat(newNode));
    setEdges((prev) => prev.concat(...newEdges))
  }, []);

  return {
    nodes,
    edges,
    mindMap,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onAddNode,
    StateContext
  }
}

export function useMindMapStateContext() {
  const ctx = useContext(stateContext);
  
  if (!ctx) {
    throw new Error ('No Mind Map Context Found.  Make sure there is a StateContext parent element')
  }

  return ctx;
}