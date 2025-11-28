import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Edge, Node, ReactFlowJsonObject } from "@xyflow/react";
import nodeRegistry from "./node-registry";
import { MindMap, PersistentMindMap } from "./types/mind-map";
import { Nullable } from "./utility-types";


function cloneMindMap(mindMap: Nullable<MindMap>, flowElements: ReactFlowJsonObject<Node, Edge>) {
  let nextMindMap = mindMap ? structuredClone(mindMap) : null;

  // No mind map setup, so we need to create one
  if (!nextMindMap) {
    nextMindMap = {
      id: Date.now(),
      name: "Untitled",
      fileName: "",
      description: "",
      edges: [],
      nodes: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  nextMindMap.nodes = flowElements.nodes;
  nextMindMap.edges = flowElements.edges;
  nextMindMap.viewport = flowElements.viewport;
  nextMindMap.updated_at = new Date().toISOString();

  return nextMindMap;
}

export async function onMindMapUpdate(callback: (mindMap: MindMap) => void) {
  console.debug('Received mind map update event');

  return await listen<PersistentMindMap>('aiMindMap://mindMap/update', (event) => callback(
    toMindMap(event.payload)
  ));
}

export async function loadMindMap() {
  return await invoke<PersistentMindMap>("get_mind_map").then(toMindMap);
}

function toMindMap(persistence: PersistentMindMap): MindMap {
  return {
    ...persistence,
    edges: (persistence?.edges ?? []) as Edge[],
    nodes: nodeRegistry.restoreNodes(persistence?.nodes ?? []),
  };
}

interface UpdateMindMapHelpers {
  clone: (mindMap: Nullable<MindMap>, flowElements: ReactFlowJsonObject<Node, Edge>) => MindMap
  update: (mindMap: MindMap) => void;
}

export function onUpdateMindMap(setupCallback: (helpers: UpdateMindMapHelpers) => void) {
  return (triggerCallback: (prev: MindMap) => MindMap) => {
    
    // Execute the setup callback to pull in
    // the most recent changes from the context
    setupCallback({
      /**
       * Helper method for updating the mind map OR
       * creating one if it does not exist before
       * trying to save
       */
      clone: cloneMindMap,

      /**
       * Triggers an update of the mind map on the backend
       * @param mindMap 
       */
      update: (mindMap) => {
        // Trigger the tauri command to update the mind map
        // and apply any changes made by the triggering component
        invoke('save_mind_map', {
          mindMap: triggerCallback(mindMap)
        })
      }
    })
  }
  
}