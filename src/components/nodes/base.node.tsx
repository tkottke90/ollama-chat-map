import { BaseNodeData } from "@/lib/models/base-node.data";
import { Edge, Handle, Node, useReactFlow } from "@xyflow/react";
import { JSXInternal } from "node_modules/preact/src/jsx";
import { BaseProps } from "../../lib/utility-types";
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../ui/context-menu";

export function BaseNode({
  children,
  className,
}: BaseProps<{ className?: string }>) {
  return <div className={`node relative ${className ?? ""}`}>{children}</div>;
}


type SimpleNodeProps<TNodeDataType extends BaseNodeData> = BaseProps<{
  nodeProps: Node<TNodeDataType, string>;
  customMenuItems?: (props: Node<TNodeDataType, string>) => JSXInternal.Element;

  /**
   * Event triggers whenever the context menu's `Edit`
   * item is selected
   */
  onEdit?: () => void;

  /**
   * Event triggers whenever the context menu's `Delete`
   * item is selected
   */
  onDelete?: (result: {
    deletedNodes: Node[];
    deletedEdges: Edge[];
  }) => void;

  /**
   * Event triggers whenever a toggleable property is toggled.
   * For example, the `showDebug` toggle
   */
  onToggle?: (key: keyof TNodeDataType) => void
}>

export function SimpleNode<TNodeDataType extends BaseNodeData>({ children, nodeProps, onToggle, customMenuItems, onEdit, onDelete }: SimpleNodeProps<TNodeDataType>) {
  const { deleteElements } = useReactFlow();
  
  return (
    <BaseNode className="cursor-default group">
      <Handle type="target" position={nodeProps.data.topHandlePos} />
      <Handle type="source" position={nodeProps.data.bottomHandlePos} />
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
         <ContextMenuContent>
          <ContextMenuItem
            disabled={!nodeProps.data.locked}
            onClick={() => {
              if (onEdit) {
                onEdit()
              }
            }}
          >
            Edit
          </ContextMenuItem>
          <ContextMenuItem
            variant="destructive"
            onClick={() => {
              deleteElements({
                nodes: [{ id: nodeProps.id }]
              }).then((result) => {
                if (onDelete) {
                  onDelete(result)
                }
              });
            }}
          >
            Delete
          </ContextMenuItem>
          { customMenuItems && <ContextMenuSeparator /> }
          {customMenuItems && customMenuItems(nodeProps)}
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem 
            checked={nodeProps.data.showDebug} 
            onClick={() => {
              if (onToggle) {
                onToggle('showDebug');
              }
            }}
          >
            Show Debug
          </ContextMenuCheckboxItem>
         </ContextMenuContent>
      </ContextMenu>
    </BaseNode>
  )
}