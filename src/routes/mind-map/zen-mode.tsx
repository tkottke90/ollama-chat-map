import { MessageBody } from "@/components/chats/message";
import Nodes from "@/components/nodes";
import { Button } from "@/components/ui/button";
import { Resizeable, ResizeableContent } from "@/components/ui/resize-container";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { categorizeParent, NodeWithThread, selectNodeAndParents } from "@/lib/chat-parsing";
import { EnterHandler } from "@/lib/events/keyboard";
import { useTauriEvent } from "@/lib/hooks/useTauriListener";
import { BaseChatNodeData } from "@/lib/models/base-node.data";
import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";
import { Node, useReactFlow } from "@xyflow/react";
import { FilePlus, NotebookText, SendHorizonal } from "lucide-preact";
import { forwardRef, Ref } from "preact/compat";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
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

type ChatMessagesProps = BaseProps<{ nodes: Node<BaseChatNodeData, string>[] }>;

const ChatMessages = forwardRef(({ nodes, children, className = "" }: ChatMessagesProps, ref: Ref<HTMLDivElement>) => {
  if (children) {
    console.warn('"children" are not used in the ChatMessages component.');
  }

  const parents = nodes.length > 1 ? nodes.slice(0, -1) : [];
  const child = nodes.length > 0 ? nodes.at(-1) : undefined;

  return (
    <div ref={ref} className={cn("select-none h-full overflow-y-auto px-4 flex flex-col gap-4 text-foreground", className)}>
      {parents.map((node) => {
        return <ChatMessage key={node.id} node={node} />
      })}
      
      {child && <ChatMessage key={child.id} node={child} />}
    </div>
  );
});

function ChatMessage({ node }: BaseProps<{node: Node<BaseChatNodeData, string>}>) {
  const { getNodes, getEdges } = useReactFlow();
  
  if (!(node.data instanceof BaseChatNodeData)) {
    console.warn(`Node ${node.id} [type: ${node.type}] has no content.`);
    return null;
  }

  // If the node is empty or not a chat node we skip it
  if (!node.data?.content) {
    console.warn(`Node ${node.id} [type: ${node.type}] has no content.`);
    return null;
  }


  const { isThread } = useMemo(() => {
    return categorizeParent(node, getNodes(), getEdges())
  }, [ node ])

  // If the node is a thread, we show the thread
  if (isThread) {
    return <Thread>
      {node.data.toChatView()}
    </Thread>;
  }

  // If the node not a thread
  return node.data.toChatView();
}

function Thread({ children }: BaseProps) {
  
  return (
    <div className="overflow-x-hidden relative">
      <MessageBody className="ml-auto translate-8 h-8 absolute" />
      <MessageBody className="ml-auto translate-4 h-8 absolute"/>

      {children}
    </div>
  )
}
