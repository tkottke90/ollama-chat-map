import { useWarningToast } from "@/components/ui/sonner";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSaveState } from "@/lib/hooks/useSaveState";
import * as MindMapService from '@/lib/mindMap.service';
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { calculateNextNodePos, clearSelections } from "@/lib/react-flow.utils";
import { MindMap } from "@/lib/types/mind-map";
import { BaseProps, Nullable } from "@/lib/utility-types";
import { createContextWithHook } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { addEdge, Connection, Edge, EdgeChange, getIncomers, getOutgoers, Node, NodeChange, OnDelete, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "preact/hooks";
import { toast } from "sonner";

export type AddNodeFn = (input: NodeDefinitionInput<any>) => Node;
export type AddNodeFactory = (factory: AddNodeFn | Node) => void;

const { useHook, Provider } = createContextWithHook<{
  stateEvents: EventTarget;
  mindMap: Nullable<MindMap>;
  unselectAll: () => void;
  updateMindMap: (callback: (prev: MindMap) => MindMap) => void;
  onAddNode: AddNodeFactory;
  onSave: () => Promise<void>;
}>();

export function useMindMapState(initialNodes: Node[] = [], initialEdges: Edge[] = []) {
  const { getNodes, getEdges, toObject, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Save state management
  const { markUnsaved, stateEvents, save } = useSaveState(
    getNodes,
    getEdges
  );

  const triggerWarningToast = useWarningToast();

  const unselectAll = useCallback(() => {
    setNodes(clearSelections(getNodes()));
  }, [getNodes]);

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

  /**
   * Callback for when a node is deleted
   */
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
  const onAddNode = useCallback((nodeOrNodeFactory: AddNodeFn | Node) => {
    const nodes = getNodes();
    
    // Calculate where the node should go on the canvas
    const nextPos = calculateNextNodePos(nodes, screenToFlowPosition);

    // Create new node
    let newNode;

    if (typeof nodeOrNodeFactory === 'function') {
      // When we are provided a node factory function
      // we trigger that factory
      newNode = nodeOrNodeFactory({ showDebug: false, position: nextPos });
    } else {
      // Otherwise we can simply manage the node
      newNode = nodeOrNodeFactory;

      // Update the position based on our selection and
      // viewport calculations
      newNode.position.x = nextPos.x;
      newNode.position.y = nextPos.y;
    }

    // Create edges
    const newEdges: Edge[] = nodes
      .filter(node => node.selected)
      .filter(node => node.id !== newNode.id)
      .map((node) => ({
        id: crypto.randomUUID(),
        source: node.id,
        target: newNode.id,
      }));

    console.log('Creating new node')
    setNodes((prev) => prev.concat(newNode));
    setEdges((prev) => prev.concat(...newEdges));
  }, []);

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = getNodes();
      const edges = getEdges();
      const target = nodes.find((node) => node.id === connection.target);

      // If we do not have a target, we cannot check
      // for the circular dependency
      if (!target) return false;

      // We do not allow self-connections
      if (target.id === connection.source) {
        toast.warning('Nodes can not connect to themselves');
        return false;
      }

      // Only nodes with preventDepthTraversal (e.g., Summary Nodes) can have multiple parents
      // This enforces a tree structure where regular nodes have single parents,
      // and only Summary Nodes can act as merge points for multiple conversation threads
      if (!target.data?.preventDepthTraversal) {
        const existingParents = getIncomers(target, nodes, edges);

        if (existingParents.length > 0) {
          triggerWarningToast(<span>Only <strong>Summary Nodes</strong> can have multiple parents. Convert this node to a Summary Node to merge conversation threads.</span>);
          return false;
        }
      }

      // Loop over the downstream nodes from the current node
      for (const node of getOutgoers(target, nodes, edges)) {
        // If we find a node that is the same as the source, we have a cycle
        if (node.id === connection.source) {
          return false;
        }
      }

      // If no cycle is detected, then we can connect the nodes
      return true;
    },
    [getNodes, getEdges],
  );

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
          unselectAll,
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
    isValidConnection,
    onAddNode,
    onConnect,
    onDelete,
    onEdgesChange: onEdgeUpdates,
    onNodesChange: onNodeUpdates,
    StateContext,
  };
}

export const useMindMapStateContext = useHook;
