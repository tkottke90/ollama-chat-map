import Nodes from "@/components/nodes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, MessageSquareText, SquarePlus } from "lucide-preact";
import { useMindMapStateContext } from "../state";
import { iconStyle } from "./toolbar-constants";
import { ToolbarButton } from "./toolbar-utils";


export function AddNodeMenu() {
  const { onAddNode } = useMindMapStateContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton>
          <SquarePlus className={iconStyle} />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={10} >
        <DropdownMenuLabel>
          <strong>Add Nodes</strong>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAddNode(Nodes.textNodeFactory)} className="cursor-pointer">
          <FileText className={iconStyle} />
          <span>Text Node</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddNode(Nodes.llmPromptNodeFactory)} className="cursor-pointer">
          <MessageSquareText className={iconStyle} />
          <span>Chat Message</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}