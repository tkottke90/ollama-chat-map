import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "preact/hooks";
import { useTauriListener } from "./useTauriListener";

export enum SavingStates {
  SAVED = 'saved',
  SAVING = 'saving',
  UNSAVED = 'unsaved'
}

export interface SaveState {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Hook to manage save state for the mind map
 * Provides save functionality, auto-save, and keyboard shortcuts
 */
export function useSaveState(
  getNodes: () => any[],
  getEdges: () => any[]
) {
  const savingState = useTauriListener<{ isSaving: boolean }>('aiMindMap://mindMap/saving', { isSaving: false });
  
  const [ stateEvents ] = useState(new EventTarget());

  const markUnsaved = useCallback(() => {
    stateEvents.dispatchEvent(new CustomEvent('unsaved'));
  }, [stateEvents]);

  const markSaved = useCallback(() => {
    stateEvents.dispatchEvent(new CustomEvent('saved'));
  }, [stateEvents]);

  const save = useCallback(async () => {
    if (savingState.isSaving) return; // Prevent concurrent saves

    stateEvents.dispatchEvent(new CustomEvent('saving'));

    await invoke('update_nodes', { nodes: getNodes() });
    await invoke('update_edges', { edges: getEdges() });

    await invoke('flush_mind_map');

    markSaved();
  }, [savingState, stateEvents, markSaved]);

  useEffect(() => {
    if (!savingState.isSaving) markSaved()
  }, [savingState])

  return {
    markUnsaved,
    markSaved,
    save,
    stateEvents
  }
}

