import { LlmPromptNodeDefinition } from "@/components/nodes/llm-prompt.node";
import { Drawer } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Panel } from "@xyflow/react";
import { File, MessageSquareText, SquarePlus } from "lucide-preact";
import { useState } from "preact/hooks";
import { AddNodeFactory, useMindMapStateContext } from "./state";

interface ActionMenuProps {
  addNode: AddNodeFactory
}

const iconSize = 20;

export function ActionsToolbar({ addNode }: ActionMenuProps) {
  const [ showAddMenu, setShowAddMenu ] = useState(false);
  const { mindMap } = useMindMapStateContext();

  return (
    <Panel position="top-left">
      <div className="my-12 shadow-lg bg-white rounded overflow-hidden flex flex-col">
        
        <Drawer trigger={<button className="w-full p-2 cursor-pointer! hover:bg-blue-100"><File /></button>}>
          <h2>File: {mindMap?.name}</h2>
          <pre>{JSON.stringify(mindMap, null, 2)}</pre>
        </Drawer>

       
        <hr className="border-zinc-800 w-10/12 m-auto" />

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