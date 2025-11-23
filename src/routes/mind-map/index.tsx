import NodeRegistry from "@/lib/node-registry";
import { BaseProps } from "@/lib/utility-types";
import {
  Background,
  Edge,
  FitViewOptions,
  Node,
  ReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import '@xyflow/react/dist/base.css';
import { ActionsToolbar } from "./action-toolbar";
import { useMindMapState } from "./state";
import ViewportLogger from "./toolbar/viewport-controls";

type MindMapProps = BaseProps

const fitViewOptions: FitViewOptions = {
  padding: 1.5,
};

// Empty initial state - backend will provide the actual data
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function ReactFlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, StateContext, onDelete } = useMindMapState(
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
        onDelete={onDelete}
      >
        <Background />
        <ActionsToolbar />
        <ViewportLogger />
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