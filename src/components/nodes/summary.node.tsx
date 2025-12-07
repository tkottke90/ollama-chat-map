import { Button } from "@/components/ui/button";
import { ChangeHandler } from "@/lib/events/input";
import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { SummaryNodeData } from "@/lib/models/summary-node.data";
import { Node, useReactFlow } from "@xyflow/react";
import { Sparkles } from "lucide-preact";
import { toast } from "sonner";
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
  const { updateNodeData } = useReactFlow();

  const handleAutoGenerate = () => {
    // Placeholder for Ollama integration
    toast.info('Auto-generate summary feature coming soon!');
    
    // TODO: Implement Ollama integration to generate summary
    // This will involve:
    // 1. Collecting parent node content
    // 2. Sending to Ollama with a summarization prompt
    // 3. Updating the node content with the generated summary
  };

  return (
    <div className="flex justify-between items-center">
      <label htmlFor="summary" className="font-bold text-lg flex items-center gap-2">
        <props.data.icon /> 
        <span>Summary</span>
      </label>
      
      <Button 
        variant="outline" 
        size="icon-sm"
        onClick={handleAutoGenerate}
        title="Auto-generate summary"
        className="nodrag"
      >
        <Sparkles size={16} />
      </Button>
    </div>
  )
}

function DataInput(props: SummaryNodeProps) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className="flex gap-2 nodrag">
       <textarea
          id={props.id + '-content'}
          name="summary"
          defaultValue={props.data.content}
          className="nodrag noscroll nowheel w-full rounded-md grow"
          placeholder="Enter summary or click the sparkle button to auto-generate..."
          onChange={ChangeHandler((value) => {
            const nextState = new SummaryNodeData(props.data);
            nextState.content = value;

            updateNodeData(props.id, nextState, { replace: true });
          })}
        />
    </div>
  )
}

