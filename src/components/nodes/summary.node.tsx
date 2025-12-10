import { Button } from "@/components/ui/button";
import { ChangeHandler } from "@/lib/events/input";
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { SummaryNodeData } from "@/lib/models/summary-node.data";
import { Node, useReactFlow } from "@xyflow/react";
import { Loader2, Sparkles } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { toast } from "sonner";
import { ContextMenuItem } from "../ui/context-menu";
import { SimpleNode } from "./base.node";

type SummaryNodeProps = Node<SummaryNodeData, "summary-node">;

/**
 * Creates a Summary Node Definition based on the schema
 * @param input
 * @returns
 */
export function summaryNodeFactory(input: NodeDefinitionInput<SummaryNodeData>): SummaryNodeProps {
  return {
    id: crypto.randomUUID(),
    type: "summary-node",
    position: { x: 0, y: 0 },
    ...input,
    data: new SummaryNodeData(input.data),
  };
}


export function SummaryNode(props: SummaryNodeProps) {
  const { updateNodeData } = useReactFlow();

  return (
    <SimpleNode
      nodeProps={props}
      customMenuItems={SummaryMenuItems}
      onToggle={(key) => {
        switch(key) {
          case 'showDebug': {
            const nextState = new SummaryNodeData(props.data);
            nextState.showDebug = !nextState.showDebug;

            updateNodeData(props.id, nextState, { replace: true });
          }
        }
      }}  
    >
      <div className="node--summary-input flex flex-col gap-4">
        <Header {...props} />

        <DataInput {...props} />
      </div>
    </SimpleNode>
  )
}

function Header(props: SummaryNodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoGenerate = async () => {
    try {
      setIsGenerating(true);

      // Create a new instance to call generateSummary
      const summaryData = new SummaryNodeData(props.data);

      // Generate the summary
      const generatedSummary = await summaryData.generateSummary(
        props,
        getNodes(),
        getEdges()
      );

      if (generatedSummary === null) {
        toast.warning('No parent threads found to summarize. Connect some conversation nodes to this Summary Node first.');
        return;
      }

      // Update the node with the generated summary
      const updatedData = new SummaryNodeData(props.data);
      updatedData.content = generatedSummary;
      updateNodeData(props.id, updatedData, { replace: true });

      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <label htmlFor="summary" className="font-bold text-lg flex items-center gap-2">
        <props.data.icon />
        <span>Summary</span>
      </label>

      <Button
        variant="action"
        size="icon-sm"
        onClick={handleAutoGenerate}
        title="Auto-generate summary"
        className="nodrag"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
      </Button>
    </div>
  )
}

function DataInput(props: SummaryNodeProps) {
  const { updateNodeData } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Call autoResize when content changes (after generation)
  useEffect(() => {
    autoResize();
  }, [props.data.content]);

  return (
    <div className="flex gap-2 nodrag">
       <textarea
          ref={textareaRef}
          id={props.id + '-content'}
          name="summary"
          defaultValue={props.data.content}
          className="nodrag noscroll nowheel w-full rounded-md grow overflow-hidden min-h-32"
          placeholder="Enter summary or click the sparkle button to auto-generate..."
          onChange={ChangeHandler((value) => {
            const nextState = new SummaryNodeData(props.data);
            nextState.content = value;

            updateNodeData(props.id, nextState, { replace: true });
            autoResize();
          })}
        />
    </div>
  )
}

function SummaryMenuItems(props: Node<SummaryNodeData, string>) {
  const { updateNodeData } = useReactFlow();

  return (
    <Fragment>
      <ContextMenuItem
        variant="destructive"
        onClick={() => {
          const nextState = new SummaryNodeData(props.data);
            nextState.content = '';

            updateNodeData(props.id, nextState, { replace: true });
        }}
      >
        Clear
      </ContextMenuItem>
    </Fragment>
  )
}