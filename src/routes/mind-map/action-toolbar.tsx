import { LlmPromptNodeDefinition } from "@/components/nodes/llm-prompt.node";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BaseProps } from "@/lib/utility-types";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Panel } from "@xyflow/react";
import { File, MessageSquareText, SparklesIcon, SquarePlus } from "lucide-preact";
import { useState } from "preact/hooks";
import { useMindMapStateContext } from "./state";

interface ActionMenuProps extends BaseProps {}

const iconSize = "w-8 h-8";

export function ActionsToolbar({}: ActionMenuProps) {
  return (
    <Panel position="top-left">
      <div className="my-12 shadow-lg bg-white rounded flex flex-col relative">
        <FileDrawer />
        <ToolbarSeparator />
        <AddNodeMenu />
      </div>
    </Panel>
  )
}

function ToolbarSeparator() {
  return (<hr className="border-zinc-800 w-10/12 m-auto" />)
}

function FileDrawer() {
  const { mindMap, updateMindMap } = useMindMapStateContext();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-full p-2 cursor-pointer! hover:bg-blue-100"><File className={iconSize} /></button>
      </SheetTrigger>
      <SheetContent side="left" className=" text-white h-full overflow-hidden grid grid-rows-[auto_1fr_auto] gap-4">
        <SheetHeader className={"h-fit"}>
          <SheetTitle className="text-white font-bold text-xl">Current Mind Map</SheetTitle>
          <SheetDescription>This file contains the details about your currently open mind map</SheetDescription>
        </SheetHeader>

        <ScrollArea className={"px-4"}>
          <div className="flex gap-4 justify-center items-center">
            <Item className="flex-col gap-1 min-w-32" variant={"outline"}>
                <h4>Nodes</h4>
                <p className="text-3xl">{mindMap?.nodes.length ?? 0}</p>
            </Item>
            <Item className="flex-col gap-1 min-w-32" variant={"outline"}>
                <h4>Edges</h4>
                <p className="text-3xl">{mindMap?.edges.length ?? 0}</p>
            </Item>
          </div>
          <br />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">
                  <span>Filename</span>
                  
                </FieldLabel>
                <FieldDescription>The name of your file</FieldDescription>
                <Input 
                  id="name"
                  autoComplete="off"
                  placeholder="Untitled"
                  defaultValue={mindMap?.name}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="desc" className="flex justify-between">
                  <span>Description</span>
                  <Button variant={"outline"}>
                    <SparklesIcon size={14}/>   
                  </Button>
                </FieldLabel>
                <Textarea
                  id="desc"
                  placeholder="Describe the conversation"
                  rows={10}
                  className="resize-none overflow-y-auto"
                />
                <FieldDescription>
                  Describe the conversation that you had with the AI
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </ScrollArea>

        <SheetFooter className={"h-fit"}>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function AddNodeMenu() {
  const [ showAddMenu, setShowAddMenu ] = useState(false);
  const { onAddNode } = useMindMapStateContext();

  return (
    <DropdownMenu open={showAddMenu}>
    <DropdownMenuTrigger className="w-full p-2 cursor-pointer! hover:bg-blue-100" onMouseEnter={() => {
      setShowAddMenu(true)
    }}>
      <SquarePlus className={iconSize} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" side="right" sideOffset={10} onMouseLeave={() => {
      setShowAddMenu(false)
    }}>
      <DropdownMenuLabel>
        <strong>Add Nodes</strong>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onAddNode(LlmPromptNodeDefinition)}>
        <MessageSquareText className={iconSize} />
        <span>Chat Message</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}