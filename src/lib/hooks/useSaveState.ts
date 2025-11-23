import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export interface SaveState {
  isSaved: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
}

export interface UseSaveStateReturn extends SaveState {
  save: () => Promise<void>;
  markUnsaved: () => void;
}

/**
 * Hook to manage save state for the mind map
 * Provides save functionality, auto-save, and keyboard shortcuts
 */
export function useSaveState(
  getNodes: () => any[],
  getEdges: () => any[],
  autoSaveDelay: number = 3000
): UseSaveStateReturn {
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual save function
  const save = useCallback(async () => {
    if (isSaving) return; // Prevent concurrent saves

    setIsSaving(true);
    try {
      // Update backend with current state
      await invoke('update_nodes', { nodes: getNodes() });
      await invoke('update_edges', { edges: getEdges() });
      
      // Flush to disk
      await invoke('flush_mind_map');
      
      // Update save state
      setIsSaved(true);
      setLastSavedAt(new Date());
      
      console.log('💾 Mind map saved successfully');
    } catch (error) {
      console.error('Failed to save mind map:', error);
      // TODO: Show error notification to user
    } finally {
      setIsSaving(false);
    }
  }, [getNodes, getEdges, isSaving]);

  // Mark as unsaved (called when nodes/edges change)
  const markUnsaved = useCallback(() => {
    setIsSaved(false);
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (!isSaved) {
        console.log('🔄 Auto-saving...');
        save();
      }
    }, autoSaveDelay);
  }, [autoSaveDelay, save, isSaved]);

  // Keyboard shortcut (Cmd/Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [save]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Fetch initial save state from backend
  useEffect(() => {
    invoke<{ isSaved: boolean; lastSavedAt: string | null }>('get_save_state')
      .then((state) => {
        setIsSaved(state.isSaved);
        setLastSavedAt(state.lastSavedAt ? new Date(state.lastSavedAt) : null);
      })
      .catch((error) => {
        console.error('Failed to fetch save state:', error);
      });
  }, []);

  return {
    isSaved,
    lastSavedAt,
    isSaving,
    save,
    markUnsaved,
  };
}

