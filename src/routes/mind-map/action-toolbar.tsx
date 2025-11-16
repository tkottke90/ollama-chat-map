import { LlmPromptNodeDefinition } from "@/components/nodes/llm-prompt.node";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Panel } from "@xyflow/react";
import { MessageSquareText, SquarePlus } from "lucide-preact";
import { useState } from "preact/hooks";
import { AddNodeFactory } from "./state";

interface ActionMenuProps {
  addNode: AddNodeFactory
}

const iconSize = 20;

export function ActionsToolbar({ addNode }: ActionMenuProps) {
  const [ showAddMenu, setShowAddMenu ] = useState(false);

  return (
    <Panel position="top-left">
      <div className="my-12 shadow-lg bg-white rounded overflow-hidden">
        <DropdownMenu open={showAddMenu}>
          <DropdownMenuTrigger className="w-full p-2 cursor-pointer! hover:bg-blue-100" onMouseEnter={() => {
            setShowAddMenu(true)
          }}>
            <SquarePlus size={iconSize} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={10} onMouseLeave={() => {
            setShowAddMenu(false)
          }}>
            <DropdownMenuLabel>
              <strong>Add Nodes</strong>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => addNode(LlmPromptNodeDefinition)}>
              <MessageSquareText />
              <span>Chat Message</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Panel>
  )
}