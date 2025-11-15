import { createChatHistory } from "@/lib/chat-parsing";
import { EnterHandler } from "@/lib/events/keyboard";
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { BaseProps } from "@/lib/utility-types";
import { invoke } from "@tauri-apps/api/core";
import { Handle, Node, Position, useReactFlow } from "@xyflow/react";
import { Code2, Pencil, SendHorizonal } from "lucide-preact";
import { useRef, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatNodeData } from "../../lib/models/chat-node.data";
import { GrabHandleVertical } from "../mouse-targets/grab-handles";
import { BaseNode } from "./base.node";

type LLMNodeProps = Node<ChatNodeData, "llm-prompt">;

const onConnect = (params: unknown) => console.log("handle onConnect", params);

/**
 * Creates a LLM Node Prompt Definition based on the schema
 * @param input
 * @returns
 */
export function LlmPromptNodeDefinition(input: NodeDefinitionInput<ChatNodeData>): LLMNodeProps {
  return {
    id: crypto.randomUUID(),
    type: "llm-prompt",
    position: { x: 0, y: 0 },
    dragHandle: ".drag-handle__custom",
    ...input,
    data: new ChatNodeData(input.data),
  };
}

function UserMessage({ locked, message, onSubmit }: { locked: boolean; message: string; onSubmit: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  
  if (!locked) {
    return (
      <div className="flex gap-2 nodrag">
        <textarea
          ref={ref}
          disabled={locked}
          id="text"
          name="text"
          onKeyDown={EnterHandler(async (evt) => {
            if (!evt.currentTarget) return;

            const userInput = (evt.currentTarget as HTMLTextAreaElement).value ?? "";
            
            onSubmit(userInput);
          })}
          defaultValue={message}
          className="nodrag noscroll w-full rounded-md grow"
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
    <div className="nodrag prose orderList unorderList list">
      <Markdown>{message}</Markdown>
    </div>
  )
}

function AssistantThinking({ loading }: BaseProps<{ loading: boolean }>) {
  if (!loading) return null;

  return <p className="text-center animate-bounce mt-2">Loading</p>;
}

function AssistantResponse({ message }: BaseProps<{ message?: string }>) {
  if (!message) return null;

  return (
    <Fragment>
      <h4 className="nodrag font-bold">Assistant:</h4>

      <div className="nodrag prose orderList unorderList list">
        <Markdown remarkPlugins={[remarkGfm]}>{message}</Markdown>
      </div>
    </Fragment>
  );
}

export function LLMPromptNode(props: LLMNodeProps) {
  const [loading, setLoading] = useState(false);
  const { updateNodeData, getNodes, getEdges } = useReactFlow();

  return (
    <BaseNode className="cursor-default group">
      <Handle type="target" position={Position.Top} onConnect={onConnect} />
      <Handle type="source" position={Position.Bottom} onConnect={onConnect} />
      <div className="node--text-input flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label htmlFor="text" className="font-bold text-lg nodrag">
            Message:
          </label>
          <div className="flex w-fit justify-end gap-4">
            <button
              disabled={!props.data.locked}
              className="nodrag rounded-full hover:bg-zinc-400 w-8 h-8 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-default"
              onClick={() => {
                const currentState = ChatNodeData.toChatNodeData(props.data);
                const nextState = currentState.editUserMessage();

                updateNodeData(props.id, nextState, { replace: true });
              }}
            >
              <Pencil width={16} />
            </button>

            <button
              className={`nodrag rounded-full hover:bg-zinc-400 w-8 h-8 flex items-center justify-center cursor-pointer ${props.data.showDebug ? "bg-blue-500 hover:bg-blue:600" : ""}`}
              onClick={() => {
                const currentState = ChatNodeData.toChatNodeData(props.data);
                const nextState = currentState.set("showDebug", !currentState.showDebug);

                updateNodeData(props.id, nextState, { replace: true });
              }}
            >
              <Code2 width={16} />
            </button>

            <GrabHandleVertical className="drag-handle__custom" />
          </div>
        </div>

        <UserMessage
          locked={props.data.locked}
          message={props.data.userMessage?.content ?? ""}
          onSubmit ={async (value: string) => {
            const currentState = ChatNodeData.toChatNodeData(props.data);

            const nextState = currentState.addUserMessage(value);

            try {
              // Step 1: Disable the input and show loading
              setLoading(true);

              // Step 2: Update the node data
              updateNodeData(props.id, nextState, { replace: true });

              const chatHistory = createChatHistory(props, getNodes(), getEdges()).concat(...nextState.toChatArray());

              // Step 4: Call Ollama
              const response = await invoke<{ role: string; content: string }>("ollama_chat", {
                model: "llama2",
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

        {loading || (props.data.aiResponse?.content && <hr />)}

        <AssistantThinking loading={loading} />

        <AssistantResponse message={props.data.aiResponse?.content} />

        {props.data.showDebug && (
          <div className="absolute translate-x-full -translate-y-2 w-full transition-opacity duration-500 bg-blue-200 rounded p-4 border-blue-600 border opacity-0 group-hover:opacity-100">
            <pre className="overflow-scroll">
              <code>{JSON.stringify(props.data, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
