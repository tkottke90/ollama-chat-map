import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { PanelRightOpen, SparklesIcon } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { useMindMapStateContext } from "../state";
import { iconStyle } from "./toolbar-constants";
import { ToolbarButton } from "./toolbar-utils";

export function FileDrawer() {
  const { mindMap, updateMindMap } = useMindMapStateContext();

  const [open, setOpen] = useState(false);
  const [ hasChanges, setHasChanges ] = useState(false);
  const [ title, setTitle ] = useState(mindMap?.name ?? '');
  const [ desc, setDesc ] = useState(mindMap?.description ?? '');

  useEffect(() => {
    setTitle(mindMap?.name ?? '');
    setDesc(mindMap?.description ?? '');
  }, [mindMap])
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <ToolbarButton title="File Details"><PanelRightOpen className={iconStyle} /></ToolbarButton>
      </SheetTrigger>
      <SheetContent side="left" className=" text-white h-full overflow-hidden grid grid-rows-[auto_1fr_auto] gap-4 z-100">
        <SheetHeader className={"h-fit"}>
          <SheetTitle className="text-white font-bold text-xl">Current Mind Map</SheetTitle>
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
                <FieldLabel htmlFor="name">Filename</FieldLabel>
                <Input 
                  tabIndex={0}
                  id="name"
                  autoComplete="off"
                  placeholder="Untitled"
                  defaultValue={title}
                  onChange={(e) => {
                    setTitle(e.currentTarget.value);
                    setHasChanges(true);
                  }}
                />

                <FieldDescription>{mindMap?.fileName}</FieldDescription>
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
                  defaultValue={desc}
                  onChange={(e) => {
                    setDesc(e.currentTarget.value);
                    setHasChanges(true);
                  }}
                />
                <FieldDescription>
                  Describe the conversation that you had with the AI
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </ScrollArea>

        <SheetFooter className={"h-fit"}>
          <Button 
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 cursor-pointer"
            variant="secondary"
            type="submit"
            disabled={!hasChanges}
            onClick={() => {
              updateMindMap(prev => ({
                ...prev,
                name: title ?? prev.name,
                description: desc ?? prev.description,
                updated_at: new Date().toISOString()
              }))

              setHasChanges(false);
            }}
          >Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}