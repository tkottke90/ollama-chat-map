import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { useTauriListener } from "@/lib/hooks/useTauriListener";
import { ChatNodeData } from "@/lib/models/chat-node.data";
import { getOllamaStatus, OllamaStatus } from "@/lib/ollama.service";
import { BaseProps } from "@/lib/utility-types";
import { useReactFlow } from "@xyflow/react";
import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";


export function NodeMenu({children}: BaseProps<{customItems: ComponentChildren}>) {
  const [models, setModels] = useState<OllamaStatus["models"]>([]);
  const { updateNodeData } = useReactFlow();

  // Listen for real-time Ollama status updates
  const ollamaStatus = useTauriListener<OllamaStatus | null>("ollama-status-changed", null);

  // Fetch initial Ollama status on mount
  useEffect(() => {
    getOllamaStatus().then((status) => setModels(status.models));
  }, []);

  // Update models when status changes via event
  useEffect(() => {
    if (ollamaStatus?.models) {
      setModels(ollamaStatus.models);
    }
  }, [ollamaStatus]);

  return (
    <ContextMenu>
        <ContextMenuTrigger asChild>{ children }</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger
              disabled={!ollamaStatus?.isAvailable || props.data.locked}
              className="disabled:text-zinc-300"
            >
              Model: {props.data.model}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup
                value={props.data.model}
                onValueChange={(model) => {
                  const currentState = ChatNodeData.toChatNodeData(props.data);
                  updateNodeData(props.id, currentState.set("model", model), { replace: true });
                }}
              >
                {models.map((model) => (
                  <ContextMenuRadioItem key={model.name} value={model.name}>
                    {model.name}
                  </ContextMenuRadioItem>
                ))}
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem disabled={!props.data.locked}>Edit</ContextMenuItem>
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          <ContextMenuItem></ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={props.data.showDebug} onClick={() => {
            const currentState = ChatNodeData.toChatNodeData(props.data);

            updateNodeData(props.id, currentState.set("showDebug", !currentState.showDebug), { replace: true });
          }}>
            Show Debug
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
  )
}