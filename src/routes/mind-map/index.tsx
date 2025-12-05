import NodeRegistry from "@/lib/node-registry";
import { BaseProps } from "@/lib/utility-types";
import {
  Background,
  ConnectionLineType,
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
import { ZenModeDrawer } from "./zen-mode";

type MindMapProps = BaseProps

const fitViewOptions: FitViewOptions = {
  padding: 1.5
};

// Empty initial state - backend will provide the actual data
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function ReactFlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, StateContext, onDelete, isValidConnection } = useMindMapState(
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
        maxZoom={1.5}
        minZoom={0.1}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        isValidConnection={isValidConnection}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background />
        <ActionsToolbar />
        <ViewportLogger />
        <ZenModeDrawer />
      </ReactFlow>
    </StateContext>
  )
}

export function MindMap({}: MindMapProps) {

  return (
    <div
      className="h-full w-full"
    >
      <ReactFlowProvider>
        <ReactFlowCanvas />
      </ReactFlowProvider>
    </div>
  )
}