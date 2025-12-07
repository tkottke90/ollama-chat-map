import {
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger
} from "@/components/ui/context-menu";
import { createChatHistory } from "@/lib/chat-parsing";
import { EnterHandler } from "@/lib/events/keyboard";
import { useTauriListener } from "@/lib/hooks/useTauriListener";
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { getOllamaStatus, OllamaStatus } from "@/lib/ollama.service";
import { BaseProps } from "@/lib/utility-types";
import { invoke } from "@tauri-apps/api/core";
import { Node, useReactFlow } from "@xyflow/react";
import { MessageSquareText, SendHorizonal } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { ChatNodeData } from "../../lib/models/chat-node.data";
import { MarkdownDisplay } from "../markdown";
import { GrabHandleVertical } from "../mouse-targets/grab-handles";
import { Small } from "../small";
import { SimpleNode } from "./base.node";

type LLMNodeProps = Node<ChatNodeData, "llm-prompt">;

/**
 * Creates a LLM Node Prompt Definition based on the schema
 * @param input
 * @returns
 */
export function llmPromptNodeFactory(input: NodeDefinitionInput<ChatNodeData>): LLMNodeProps {
  return {
    id: crypto.randomUUID(),
    type: "llm-prompt",
    position: { x: 0, y: 0 },
    dragHandle: ".drag-handle__custom",
    ...input,
    data: new ChatNodeData(input.data),
  };
}

export function LLMPromptNode(props: LLMNodeProps) {
  const [loading, setLoading] = useState(false);
  const { updateNodeData, getNodes, getEdges} = useReactFlow();

  return (
    <SimpleNode 
      nodeProps={props}
      customMenuItems={Menu}
      onEdit={() => {
        const currentState = ChatNodeData.toChatNodeData(props.data);
        updateNodeData(props.id, currentState.editUserMessage(), { replace: true });
      }}
      onToggle={(key) => {
        switch(key) {
          case 'showDebug': {
            const currentState = ChatNodeData.toChatNodeData(props.data);
            updateNodeData(props.id, currentState.set("showDebug", !currentState.showDebug), { replace: true });
          }
        }
      }}
    >
      <div className="node--text-input flex flex-col gap-4">
        <Header {...props} />

        <UserMessage
          locked={props.data.locked}
          message={props.data?.content ?? ""}
          onChange={(msg: string) => {
            const currentState = ChatNodeData.toChatNodeData({ ...props.data, content: msg });

            updateNodeData(props.id, currentState, { replace: true });
          }}
          onSubmit ={async (value: string) => {
            const currentState = ChatNodeData.toChatNodeData(props.data);

            const nextState = currentState.addUserMessage(value);

            try {
              // Step 1: Disable the input and show loading
              setLoading(true);

              // Step 2: Update the node data
              updateNodeData(props.id, nextState, { replace: true });

              const chatHistory = createChatHistory(props, nextState.toChatArray(), getNodes(), getEdges());

              // Step 4: Call Ollama
              const response = await invoke<{ role: string; content: string }>("ollama_chat", {
                model: props.data.model,
                messages: chatHistory,
              });

              updateNodeData(props.id, nextState.addAIMessage(response), { replace: true });
            } catch (error) {
              console.error("AI error:", error);
              updateNodeData(props.id, nextState.editUserMessage(), { replace: true });
            } finally {
              setLoading(false);
            }
          }}
        />

        <AssistantResponse message={props.data.aiResponse?.content} loading={loading} />

        <Debug {...props} />
      </div>
    </SimpleNode>
  );
}

function AssistantResponse({ message, loading }: BaseProps<{ message?: string, loading: boolean }>) {
  if (loading) {
    return (
      <Fragment>
        <hr />
        <p className="text-center animate-bounce mt-2">Loading</p>
      </Fragment>
    );
  }
  
  if (!message) return null;

  return (
    <Fragment>
      <hr />
      <h4 className="nodrag font-bold">Assistant:</h4>

      <MarkdownDisplay>{message}</MarkdownDisplay>
    </Fragment>
  );
}

function Debug(props: LLMNodeProps) {
  if (!props.data.showDebug) return null;
  
  return (
    <div className="absolute translate-x-full -translate-y-2 w-full transition-opacity duration-500 bg-blue-200 rounded p-4 border-blue-600 border opacity-0 group-hover:opacity-100">
      <pre className="overflow-scroll">
        <code>{JSON.stringify({...props.data, id: props.id}, null, 2)}</code>
      </pre>
    </div>
  )
}

function Header(props: LLMNodeProps) {

  return (
    <div className="flex justify-between items-center">
      <label htmlFor="text" className="font-bold text-lg nodrag flex items-center gap-2">
        <MessageSquareText />
        <span>Chat Message</span>
        <Small>({props.data.model})</Small>
      </label>
      <div className="flex w-fit justify-end gap-4">
        <GrabHandleVertical className="drag-handle__custom" />
      </div>
    </div>
  )
}

function Menu(props: Node<ChatNodeData, string>) {
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
  )
}

function UserMessage({ locked, message, onSubmit, onChange }: { locked: boolean; message: string; onSubmit: (value: string) => void, onChange?: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  
  if (!locked) {
    return (
      <div className="flex gap-2 nodrag">
        <textarea
          ref={ref}
          disabled={locked}
          id="text"
          name="text"
          onChange={(evt) => {
            onChange?.((evt.currentTarget as HTMLTextAreaElement).value ?? "");
          }}
          onKeyDown={EnterHandler(async (evt) => {
            if (!evt.currentTarget) return;

            const userInput = (evt.currentTarget as HTMLTextAreaElement).value ?? "";
            
            onSubmit(userInput);
          })}
          defaultValue={message}
          className="nodrag noscroll nowheel w-full rounded-md grow"
        />
        <button
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white flex items-center justify-center px-4 max-h-16"
          onClick={() => {
            if (ref.current?.value) {
              onSubmit(ref.current?.value);
            }
          }}
        >
          <SendHorizonal width={16} />
        </button>
      </div>
    );
  }

  return (
    <MarkdownDisplay>{message}</MarkdownDisplay>
  )
}
