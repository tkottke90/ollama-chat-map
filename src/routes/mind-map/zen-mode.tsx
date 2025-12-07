import { FileDisplay } from "@/components/file-display";
import { MarkdownDisplay } from "@/components/markdown";
import Nodes from "@/components/nodes";
import { Button } from "@/components/ui/button";
import { Resizeable, ResizeableContent } from "@/components/ui/resize-container";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { NodeWithThread, selectNodeAndParents } from "@/lib/chat-parsing";
import { EnterHandler } from "@/lib/events/keyboard";
import { useTauriEvent } from "@/lib/hooks/useTauriListener";
import { BaseChatNodeData } from "@/lib/models/base-node.data";
import { ChatNodeData } from "@/lib/models/chat-node.data";
import { FileNodeData } from "@/lib/models/file-node.data";
import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";
import { Node, useReactFlow } from "@xyflow/react";
import { ClipboardIcon, FilePlus, NotebookText, Plus, SendHorizonal } from "lucide-preact";
import { forwardRef, Ref } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { useMindMapStateContext } from "./state";



const ICON_SIZE = 32;

export function ZenModeDrawer() {
  const { getNodes, getEdges, updateNode } = useReactFlow();
  const { onAddNode, unselectAll } = useMindMapStateContext();
  const scrollableContainer = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [chatNodes, setChatNodes] = useState<NodeWithThread[]>([]);
  const [message, setMessage] = useState("");


  useTauriEvent<any>("zen_mode_trigger", () => {
    const nodes = selectNodeAndParents(getNodes(), getEdges())

    setChatNodes(nodes);

    setIsOpen(true);
  });

  useEffect(() => {
    if (isOpen) {
      scrollableContainer.current?.scrollTo({
        behavior: "smooth",
        top: scrollableContainer.current?.scrollHeight,
      });
    } else {
      setChatNodes([]);
      setMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    // Skip when there are no chat nodes
    if (chatNodes.length === 0) return;

    // Unselect all current nodes
    unselectAll();

    // Then select the last node in chat
    const lastNode = chatNodes.at(-1);
    updateNode(lastNode!.id, { selected: true });

  }, [chatNodes]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal>
      <SheetContent side="right" className=" text-white h-full w-10/12 sm:max-w-full overflow-hidden grid grid-rows-[auto_1fr_auto] gap-4 z-999 pb-4">
        <SheetHeader className="shadow">
          <h2 className="text-2xl">Zen Mode</h2>
        </SheetHeader>

        <ChatMessages nodes={chatNodes} ref={scrollableContainer} />

        <Resizeable minHeight={150}>
          <ResizeableContent>
            <form
              action=""
              className="h-full flex gap-4 px-4"
              onSubmit={(e) => {
                e.preventDefault();

                console.log("Submitting message:", message);
                setMessage("");
              }}
              onKeyDown={EnterHandler((e) => {
                // Skips writing a new line character
                e.preventDefault();

                // Triggers the form's on-submit function
                e.currentTarget.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
              })}
            >
              <Textarea className="h-full resize-none" value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
              <div className="flex flex-col gap-2">
                <Button type="submit" variant="action" title="Send" disabled={!message}>
                  <SendHorizonal size={ICON_SIZE} />
                </Button>
                <Button type="button" variant="action" title="Add Text" disabled={!message} onClick={() => {
                  // Create an add the new node
                  const newNode = Nodes.textNodeFactory({ selected: true, data: { content: message } });
                  onAddNode(newNode);

                  // Update our local state
                  setChatNodes(chatNodes.concat(newNode))
                  setMessage('');
                }}>
                  <NotebookText size={ICON_SIZE} />
                </Button>
                <Button type="button" variant="action" title="Add File" onClick={() => {
                  
                }}>
                  <FilePlus size={ICON_SIZE} />
                </Button>
              </div>
            </form>
          </ResizeableContent>
        </Resizeable>
      </SheetContent>
    </Sheet>
  );
}

function Message({ children, className }: BaseProps) {
  return (
    <Fragment>
      <div className={cn("flex flex-col gap-1 px-6 py-4 rounded-lg max-w-10/12 select-text", className)}>{children}</div>
      <div className="flex justify-end gap-1 text-white">
        {/* Actions */}
        <Button variant="ghost" title="Copy" className="p-1 h-8 w-8">
          <ClipboardIcon size={14} />
        </Button>
        <Button variant="ghost" title="New Thread" className="p-1 h-8 w-8">
          <Plus size={14} />
        </Button>
      </div>
    </Fragment>
  );
}

type ChatMessagesProps = BaseProps<{ nodes: Node<BaseChatNodeData, string>[] }>;

const ChatMessages = forwardRef(({ nodes, children, className = "" }: ChatMessagesProps, ref: Ref<HTMLDivElement>) => {
  if (children) {
    console.warn('"children" are not used in the ChatMessages component.');
  }

  return (
    <div ref={ref} className={cn("select-none h-full overflow-y-auto px-4 flex flex-col gap-4 text-foreground", className)}>
      {nodes.map((node) => {
        // If the node is empty or not a chat node we skip it
        if (!node.data?.content) {
          console.warn(`Node ${node.id} [type: ${node.type}] has no content.`);
          return null;
        }

        switch (node.type) {
          case "file-node": {
            const file = (node.data as FileNodeData).toFile();

            if (!file) return null;

            return <FileMessage key={node.id} file={file} />;
          }

          case "llm-prompt": {
            const { aiResponse, userMessage } = node.data as ChatNodeData;

            return (
              <Fragment>
                {userMessage && <UserChatMessage key={`${node.id}-user`} message={userMessage?.content ?? ""} />}
                {aiResponse && <AIChatMessage key={`${node.id}-ai`} message={aiResponse?.content ?? ""} />}
              </Fragment>
            );
          }

          case "text-node": {
            return <TextMessage key={node.id} message={node.data.content} />;
          }

          default: {
            return null;
          }
        }
      })}
    </div>
  );
});

function AIChatMessage({ message }: BaseProps<{ message: string }>) {
  return (
    <Message>
      <MarkdownDisplay className="prose-invert">{message}</MarkdownDisplay>
    </Message>
  );
}

function UserInputMessage({ children, className }: BaseProps) {
  return <Message className={cn("ml-auto bg-slate-300/20 hover:bg-slate-300/30 border border-gray-600 rounded-tr-none transition-colors duration-700 ", className)}>{children}</Message>;
}

function FileMessage({ file }: BaseProps<{ file: File }>) {
  return (
    <UserInputMessage>
      <FileDisplay file={file} className="text-white" />
    </UserInputMessage>
  );
}

function TextMessage({ message }: BaseProps<{ message: string }>) {
  return (
    <UserInputMessage className="w-8/12">
      <MarkdownDisplay className="prose-invert">{message}</MarkdownDisplay>
    </UserInputMessage>
  );
}

function Thread({ children }: BaseProps) {
  
  return (
    <div>
      <Message className="translate-8" />
      <Message className="translate-4"/>

      {children}
    </div>
  )
}

function UserChatMessage({ message }: BaseProps<{ message: string }>) {
  return (
    <UserInputMessage className="max-w-8/12">
      <MarkdownDisplay className="prose-invert">{message}</MarkdownDisplay>
    </UserInputMessage>
  );
}
