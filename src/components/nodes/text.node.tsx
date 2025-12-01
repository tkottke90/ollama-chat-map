import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { TextNodeData } from "@/lib/models/text-node.data";
import { Node } from "@xyflow/react";
import { SimpleNode } from "./base.node";

type TextNodeProps = Node<TextNodeData, "text-node">;

/**
 * Creates a LLM Node Prompt Definition based on the schema
 * @param input
 * @returns
 */
export function textNodeFactory(input: NodeDefinitionInput<TextNodeData>): TextNodeProps {
  return {
    id: crypto.randomUUID(),
    type: "text-node",
    position: { x: 0, y: 0 },
    ...input,
    data: new TextNodeData(input.data),
  };
}


export function TextNode(props: TextNodeProps) {


  return (
    <SimpleNode nodeProps={props}>
      <div className="node--text-input flex flex-col gap-4">
        <Header {...props} />
        
        <DataInput {...props} />
      </div>
    </SimpleNode>
  )
}

function Header(props: TextNodeProps) {

  return (
    <div className="flex justify-between items-center">
      <label htmlFor="text" className="font-bold text-lg flex items-center gap-2">
        <props.data.icon /> 
        <span>Text</span>
      </label>
    </div>
  )
}

function DataInput(props: TextNodeProps) {


  return (
    <div className="flex gap-2 nodrag">
       <textarea
          id={props.id + '-content'}
          name="text"
          defaultValue={props.data.content}
          className="nodrag noscroll nowheel w-full rounded-md grow"
        />
    </div>
  )
}