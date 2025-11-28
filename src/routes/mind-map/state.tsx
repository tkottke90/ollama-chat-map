import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSaveState } from "@/lib/hooks/useSaveState";
import * as MindMapService from '@/lib/mindMap.service';
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { MindMap } from "@/lib/types/mind-map";
import { BaseProps, Nullable } from "@/lib/utility-types";
import { createContextWithHook } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { addEdge, Connection, Edge, EdgeChange, Node, NodeChange, OnDelete, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "preact/hooks";

export type AddNodeFn = (input: NodeDefinitionInput<any>) => Node;
export type AddNodeFactory = (factory: AddNodeFn) => void;

const { useHook, Provider } = createContextWithHook<{
  stateEvents: EventTarget;
  mindMap: Nullable<MindMap>;
  updateMindMap: (callback: (prev: MindMap) => MindMap) => void;
  onAddNode: AddNodeFactory;
  onSave: () => Promise<void>;
}>();

export function useMindMapState(initialNodes: Node[] = [], initialEdges: Edge[] = []) {
  const { getNodes, getEdges, toObject } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Save state management with auto-save
  const { markUnsaved, stateEvents, save } = useSaveState(
    getNodes,
    getEdges,
    3000 // 3 second auto-save delay
  );

  const updateNodes = useDebounce(500, () => {
    return invoke("update_nodes", { nodes: getNodes() }).then(() => markUnsaved());
  });

  const updateEdges = useDebounce(500, () => {
    return invoke("update_edges", { edges: getEdges() }).then(() => markUnsaved());
  });

  const onNodeUpdates = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes to get the new state
      onNodesChange(changes);

      updateNodes();
    },
    [onNodesChange, updateNodes]
  );

  /**
   * Use this event handler to add interactivity to a controlled flow. It is called on edge select and remove.
   * Handles both calling the onEdgesChange and calling the Rust backend to update the file
   */
  const onEdgeUpdates = useCallback(
    (changes: EdgeChange[]) => {
      // Apply changes to get the new state
      onEdgesChange(changes);

      updateEdges();
    },
    [onEdgesChange, updateEdges]
  );

  /**
   * Callback for when nodes are connected
   */
  const onConnect = useCallback((connection: Connection) => {
    setEdges((prev) => {
      return addEdge(connection, prev);
    });
  }, []);

  const onDelete = useCallback((params: Parameters<OnDelete>[0]) => {
    // For edges, filter out the edges that were removed
    setEdges((prev) => {
      return prev.filter((edge) => !params.edges.find((deleted) => deleted.id === edge.id));
    });

    // For nodes, filter out ones that were removed
    setNodes((prev) => {
      return prev.filter((node) => !params.nodes.find((deleted) => deleted.id === node.id));
    });

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
      y: (lastNode?.position.y ?? 0) + (lastNode?.measured?.height ?? 0) + 50,
    };

    // Create new node
    const newNode = nodeFactory({ showDebug: false, position: pos });

    // Check if we have a selectedNode
    const selected = getNodes();

    // Create edges
    const newEdges: Edge[] = selected
      .filter(
        (node) =>
          // Find nodes that are selected
          node.selected
      )
      .map((node) => ({
        id: crypto.randomUUID(),
        source: node.id,
        target: newNode.id,
      }));

    setNodes((prev) => prev.concat(newNode));
    setEdges((prev) => prev.concat(...newEdges));
  }, []);

  /**
   * Context for the mind map state
   */
  const StateContext = useCallback((props: BaseProps) => {


    const [mindMap, setMindMap] = useState<Nullable<MindMap>>({
      id: 1,
      name: "Untitled",
      fileName: "",
      description: "",
      nodes: initialNodes,
      edges: initialEdges,
      viewport: { x: 0, y: 0, zoom: 1 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Sets up the event listener to the backend and loads the mind map using the Tauri commands
    useEffect(() => {
      const unlisten = MindMapService.onMindMapUpdate(
        (nextMindMap) => {
          setMindMap(nextMindMap),
          setNodes(nextMindMap.nodes),
          setEdges(nextMindMap.edges)
        }
      );

      MindMapService.loadMindMap()
        .then(nextMindMap => {
          setMindMap(nextMindMap),
          setNodes(nextMindMap.nodes),
          setEdges(nextMindMap.edges)
        })

      return async () => {
        (await unlisten)();
      };
    }, []);

    return (
      <Provider
        value={{
          mindMap:
            mindMap !== null
              ? {
                  ...mindMap,
                  ...toObject(),
                }
              : null,
          stateEvents,
          onAddNode,
          onSave: save,
          updateMindMap:  MindMapService.onUpdateMindMap(({ clone, update }) => {
            // Create a clone from the current mind map variable
            let nextMindMap = clone(mindMap, toObject());

            // update the node 
            update(nextMindMap);
          })
        }}
        {...props}
      />
    );
  }, []);

  return {
    nodes,
    edges,
    onAddNode,
    onConnect,
    onDelete,
    onEdgesChange: onEdgeUpdates,
    onNodesChange: onNodeUpdates,
    StateContext,
  };
}

export const useMindMapStateContext = useHook;
