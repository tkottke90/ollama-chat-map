import { LlmPromptNodeDefinition } from "@/components/nodes/llm-prompt.node";
import NodeRegistry from "@/lib/node-registry";
import { BaseProps } from "@/lib/utility-types";
import {
  Background,
  Controls,
  Edge,
  FitViewOptions,
  Node,
  ReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import '@xyflow/react/dist/base.css';
import { ActionsToolbar } from "./action-toolbar";
import { useMindMapState } from "./state";

type MindMapProps = BaseProps

const fitViewOptions: FitViewOptions = {
  padding: 1.5,
};

const initialNodes: Node[] = [
  LlmPromptNodeDefinition({
    id: 'demo1',
    position: { x: 0, y: 0 },
    data: {
      userMessage: { role: 'user', content: 'Hello, my name is Thomas.  I am a software engineer.  You are my assistant.' }
    }
  })
];
const initialEdges: Edge[] = [];

function ReactFlowCanvas() {
  const { nodes, edges, onAddNode, onNodesChange, onEdgesChange, onConnect, StateContext   } = useMindMapState(
    initialNodes,
    initialEdges
  );

  return (
    <StateContext>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NodeRegistry.toObject()}
        fitView
        fitViewOptions={fitViewOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls style={{ backgroundColor: '#efefef', padding: '0.25rem', borderRadius: '0.25rem'  }} />
        <ActionsToolbar addNode={onAddNode} />
      </ReactFlow>
    </StateContext>
  )
}

export function MindMap({}: MindMapProps) {

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlowProvider>
        <ReactFlowCanvas />
      </ReactFlowProvider>
    </div>
  )
}