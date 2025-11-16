import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { MindMap } from "@/lib/types/mind-map";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, Edge, EdgeChange, Node, NodeChange, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "preact/hooks";

export type AddNodeFn = (input: NodeDefinitionInput<any>) => Node;
export type AddNodeFactory = (factory: AddNodeFn) => void;

function addToMindMap(mindMap: MindMap | null, additions: {
  nodes?: Node[],
  edges?: Edge[],
  connection?: Connection
}) {
  if (!mindMap) return null;

  const updatedMap = {
    ...mindMap,
    updated_at: new Date().toISOString()
  }

  if (additions.nodes) {
    updatedMap.nodes = mindMap.nodes.concat(additions.nodes);
  }

  if (additions.edges) {
    updatedMap.edges = mindMap.edges.concat(additions.edges);
  }

  if (additions.connection) {
    updatedMap.edges = addEdge(additions.connection, mindMap.edges);
  }

  return updatedMap;
}

function updateMindMapNodes(mindMap: MindMap | null, changes: {
  nodes?: NodeChange<Node>[],
  edges?: EdgeChange<Edge>[]
}) {
  // No Mind Map setup - skip processing
  if (!mindMap) return null;

  // No Changes Needed
  if (!changes.edges && !changes.nodes) return mindMap;

  const updatedMap = {
    ...mindMap,
    updated_at: new Date().toISOString()
  }

  if (changes.nodes) {
    updatedMap.nodes = applyNodeChanges(changes.nodes, mindMap.nodes);
  }

  if (changes.edges) {
    updatedMap.edges = applyEdgeChanges(changes.edges, mindMap.edges)
  }

  return updatedMap;
}


export function useMindMapState(
  initialNodes: Node[] =  [],
  initialEdges: Edge[] = []
) {
  const [mindMap, setMindMap] = useState<MindMap | null>({
    id: 1,
    name: 'Untitled',
    description: 'No description',
    nodes: initialNodes,
    edges: initialEdges,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const { getNodes } = useReactFlow();


  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      
      
      setMindMap((prevMap) => {
        return updateMindMapNodes(prevMap, { nodes: changes })
      });
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setMindMap((prevMap) => {
        return updateMindMapNodes(prevMap, { edges: changes })
      });
    },
    [],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setMindMap((prevMap) => {
        return addToMindMap(prevMap, { connection })
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
    const edges: Edge[] = selected
      .filter(node => 
        // Find nodes that are selected
        node.selected
      ).map(node => ({
        id: crypto.randomUUID(),
        source: node.id,
        target: newNode.id
      }))

    setMindMap((prevMap) => {
      return addToMindMap(prevMap, {
        nodes: [newNode],
        edges
      })
    })
  }, []);

  return {
    nodes: mindMap?.nodes ?? [],
    edges: mindMap?.edges ?? [],
    mindMap,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onAddNode
  }
}