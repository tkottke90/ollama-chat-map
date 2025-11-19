import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { MindMap } from "@/lib/types/mind-map";
import { BaseProps, Nullable } from "@/lib/utility-types";
import { createContextWithHook } from "@/lib/utils";
import { addEdge, Connection, Edge, Node, ReactFlowJsonObject, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "preact/hooks";

export type AddNodeFn = (input: NodeDefinitionInput<any>) => Node;
export type AddNodeFactory = (factory: AddNodeFn) => void;

const {
  useHook,
  Provider
} = createContextWithHook<{ 
  mindMap: Nullable<MindMap>,
  updateMindMap: (callback: (prev: MindMap) => MindMap) => void, 
  onAddNode: AddNodeFactory
}>();

function persistChanges(flowElements: ReactFlowJsonObject<Node, Edge>, mindMap: Nullable<MindMap>) {
  return ({
    // Default values
    id: Date.now(),
    name: 'Untitled',
    fileName: '',
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Copy the mind map properties
    ...mindMap,
    // Overwrite with the flow elements
    ...flowElements
  });
}

export function useMindMapState(
  initialNodes: Node[] =  [],
  initialEdges: Edge[] = []
) {
  const { getNodes, getEdges, toObject } = useReactFlow();
  const [ nodes, setNodes, onNodesChange ] = useNodesState(initialNodes);
  const [ edges, setEdges, onEdgesChange ] = useEdgesState(initialEdges);

  /**
   * Callback for when nodes are connected
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((prev) => {
        return addEdge(connection, prev)
      });
    },
    [],
  );

  /**
   * Callback for when nodes are added
   */
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

  /**
   * Context for the mind map state
   */
  const StateContext = useCallback(
    (props: BaseProps) => {
      const [ mindMap, setMindMap ] = useState<Nullable<MindMap>>({
        id: 1,
        name: 'Untitled',
        fileName: '',
        description: 'No description',
        nodes: initialNodes,
        edges: initialEdges,
        viewport: { x: 0, y: 0, zoom: 1 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });


      return (<Provider value={{
        mindMap: mindMap !== null ? {
          ...mindMap,
          ...toObject()
        } : null,
        onAddNode,
        updateMindMap: (callback) => {
          setMindMap(prev => {
            let nextMindMap = prev ? { ...prev } : null;
            
            // No mind map setup, so we need to create one
            if (!nextMindMap) {
              nextMindMap = {
                id: Date.now(),
                name: 'Untitled',
                fileName: '',
                description: '',
                edges: getEdges(),
                nodes: getNodes(),
                viewport: { x: 0, y: 0, zoom: 1 },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }

            const flowObj = toObject();

            nextMindMap.nodes = flowObj.nodes;
            nextMindMap.edges = flowObj.edges;
            nextMindMap.viewport = flowObj.viewport;

            // Update the mind map
            return callback(
              persistChanges(flowObj, nextMindMap)
            );
          })
        }
      }} {...props} />)
    },
    []
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onAddNode,
    StateContext
  }
}

export const useMindMapStateContext = useHook;