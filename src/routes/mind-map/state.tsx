import { MindMap } from "@/lib/types/mind-map";
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "preact/hooks";

function addToMindMap(mindMap: MindMap | null, additions: {
  nodes?: Node[],
  edges?: Edge[]
}) {
  if (!mindMap) return null;

  const updatedMap = {
    ...mindMap,
    updated_at: new Date().toISOString()
  }

  if (additions.nodes) {
    updatedMap.nodes = mindMap.nodes.concat(additions.nodes)
  }

  if (additions.edges) {
    updatedMap.edges = mindMap.edges.concat(additions.edges)
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
  const [ abort, setAbort ] = useState<AbortController | null>(null)

  const [mindMap, setMindMap] = useState<MindMap | null>({
    id: 1,
    name: 'Untitled',
    description: 'No description',
    nodes: initialNodes,
    edges: initialEdges,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const { screenToFlowPosition } = useReactFlow();

  // Listen for state updates from Tauri backend
  // useEffect(() => {
  //   const unlisten = listen<MindMap>('state-updated', (event) => {
  //     console.log('Mind map state updated from backend:', event.payload);
  //     setMindMap(event.payload);
  //   });

  //   // Load initial state from backend
  //   invoke<MindMap | null>('get_mind_map')
  //     .then((loadedMap) => {
  //       if (loadedMap) {
  //         setMindMap(loadedMap);
  //       } else {
  //         // Create a new mind map with initial nodes/edges
  //         const newMap: MindMap = {
  //           id: 0,
  //           name: 'Untitled',
  //           description: 'No description',
  //           nodes: initialNodes,
  //           edges: initialEdges,
  //           created_at: new Date().toISOString(),
  //           updated_at: new Date().toISOString(),
  //         };

  //         // Initialize backend state with the new mind map
  //         invoke('load_mind_map', { mindMap: newMap })
  //           .then(() => {
  //             console.log('Backend state initialized with new mind map');
  //             setMindMap(newMap);
  //           })
  //           .catch((error) => {
  //             console.error('Failed to initialize backend state:', error);
  //             // Still set local state even if backend fails
  //             setMindMap(newMap);
  //           });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Failed to load mind map:', error);
  //     });

  //   // Cleanup listener on unmount
  //   return () => {
  //     unlisten.then(fn => fn());
  //   };
  // }, []);

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
    (params: any) => {
      setMindMap((prevMap) => {
        return updateMindMapNodes(prevMap, { edges: params })
      });
    },
    [],
  );

  const onConnectStart = useCallback(() => {
    setAbort(new AbortController());
  }, [abort]);

  const onConnectEnd = useCallback((event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = crypto.randomUUID();
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode: Node = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          type: 'llm-prompt',
          data: { locked: false },
          origin: [0.5, 0.0],
        };

        setMindMap((prevMap) => {
          return addToMindMap(prevMap, { 
            nodes: [newNode],
            edges: [{ id, source: connectionState.fromNode.id, target: id }]
          })
        });
      }
    }, [abort]);

  return {
    nodes: mindMap?.nodes ?? [],
    edges: mindMap?.edges ?? [],
    mindMap,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd
  }
}