import { useDebounce } from "@/lib/hooks/useDebounce";
import { SaveState, useSaveState } from "@/lib/hooks/useSaveState";
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import nodeRegistry from "@/lib/node-registry";
import { MindMap, PersistentMindMap } from "@/lib/types/mind-map";
import { BaseProps, Nullable } from "@/lib/utility-types";
import { createContextWithHook } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';
import { addEdge, Connection, Edge, EdgeChange, Node, NodeChange, OnDelete, ReactFlowJsonObject, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "preact/hooks";

export type AddNodeFn = (input: NodeDefinitionInput<any>) => Node;
export type AddNodeFactory = (factory: AddNodeFn) => void;

const {
  useHook,
  Provider
} = createContextWithHook<{
  mindMap: Nullable<MindMap>,
  updateMindMap: (callback: (prev: MindMap) => MindMap) => void,
  onAddNode: AddNodeFactory,
  saveState: SaveState,
  onSave: () => Promise<void>
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

  const updateNodes = useDebounce(500, () => {
    return invoke('update_nodes', { nodes: getNodes() })
      .then(() => markUnsaved());
  });

  const updateEdges = useDebounce(500, () => {
    return invoke('update_edges', { edges: getEdges() })
      .then(() => markUnsaved());
  });

  // Save state management with auto-save
  const { isSaved, lastSavedAt, isSaving, save, markUnsaved } = useSaveState(
    getNodes,
    getEdges,
    3000 // 3 second auto-save delay
  );

  const onNodeUpdates = useCallback((changes: NodeChange[]) => {
    // Apply changes to get the new state
    onNodesChange(changes)

    updateNodes();
  }, [onNodesChange, updateNodes])

  /**
   * Use this event handler to add interactivity to a controlled flow. It is called on edge select and remove.
   * Handles both calling the onEdgesChange and calling the Rust backend to update the file
   */
  const onEdgeUpdates = useCallback((changes: EdgeChange[]) => {
    // Apply changes to get the new state
    onEdgesChange(changes)

    updateEdges();
  }, [onEdgesChange, updateEdges])

  /**
   * Callback for when nodes are connected
   */
  const onConnect = useCallback((connection: Connection) => {
    setEdges((prev) => {
      return addEdge(connection, prev)
    });
  }, [],);

  const onDelete = useCallback((params: Parameters<OnDelete>[0] ) => {
    // For edges, filter out the edges that were removed
    setEdges((prev) => {
      return prev.filter(edge => !params.edges.find(deleted => deleted.id === edge.id))
    });

    // For nodes, filter out ones that were removed
    setNodes((prev) => {
      return prev.filter(node => !params.nodes.find(deleted => deleted.id === node.id))
    })

    // Note: No need to manually call update_nodes/update_edges here
    // The useEffect hooks for nodes and edges will automatically trigger
    // when the state updates, ensuring we send the correct (updated) data
  }, []);

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
        description: '',
        nodes: initialNodes,
        edges: initialEdges,
        viewport: { x: 0, y: 0, zoom: 1 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      useEffect(() => {
        const unlisten = listen<PersistentMindMap>('aiMindMap://mindMap/update', (event) => {
          const nodes = nodeRegistry.restoreNodes(event.payload?.nodes ?? []);
          const edges = (event.payload?.edges ?? []) as Edge[];

          setMindMap({
            ...event.payload,
            edges: edges,
            nodes: nodes
          })

          setNodes(nodes);
          setEdges(edges);
        });

        invoke<PersistentMindMap>('get_mind_map').then(mapFromDisk => {
          const nextMindMap = {
            ...mapFromDisk,
            edges: (mapFromDisk?.edges ?? []) as Edge[],
            nodes: nodeRegistry.restoreNodes(mapFromDisk?.nodes ?? [])
          }
          
          console.dir(nextMindMap)

          setMindMap(nextMindMap);
          setNodes(nextMindMap.nodes);
          setEdges(nextMindMap.edges);
        })

        return async () => {
          (await unlisten)();
        }
      }, [])


      return (<Provider value={{
        mindMap: mindMap !== null ? {
          ...mindMap,
          ...toObject()
        } : null,
        onAddNode,
        saveState: { isSaved, lastSavedAt, isSaving },
        onSave: save,
        updateMindMap: (callback) => {
          let nextMindMap = mindMap ? structuredClone(mindMap) : null;

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
          nextMindMap.updated_at = new Date().toISOString();

          // Trigger the Rust backend to update the file
          invoke('save_mind_map', { 
            mindMap: callback(persistChanges(flowObj, nextMindMap))
          });
        }
      }} {...props} />)
    },
    []
  );

  return {
    nodes,
    edges,
    onAddNode,
    onConnect,
    onDelete,
    onEdgesChange: onEdgeUpdates,
    onNodesChange: onNodeUpdates,
    StateContext
  }
}

export const useMindMapStateContext = useHook;