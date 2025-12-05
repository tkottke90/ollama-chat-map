import { FileDisplay } from "@/components/file-display";
import { MarkdownDisplay } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Resizeable, ResizeableContent } from "@/components/ui/resize-container";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";
import { ClipboardIcon, FilePlus, NotebookText, Plus, SendHorizonal } from "lucide-preact";
import { useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";

const ICON_SIZE = 32;

const dummyFile: File = new File(
  ['# This is my dummy markdown file'], 'test.md', { type: 'text/markdown' }
)

export function ZenModeDrawer() {
  const [isOpen, setIsOpen] = useState(true);
  const [ message, setMessage ] = useState('');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal>
      <SheetContent side="right" className=" text-white h-full w-10/12 sm:max-w-full overflow-hidden grid grid-rows-[auto_1fr_auto] gap-4 z-999 pb-4">
        <SheetHeader className="shadow">
          <h2 className="text-2xl">Zen Mode</h2>
        </SheetHeader>

        <div className="select-none h-full overflow-y-auto px-4 flex flex-col gap-4">
          <UserChatMessage message="Hello, how are you?" />
          <AIChatMessage message="I'm doing great, thanks for asking!" />
          <FileMessage file={dummyFile} />
          <TextMessage message="Important documents I found on the internet" />
        </div>

        <Resizeable minHeight={150}>
          <ResizeableContent className="flex gap-4 px-4">
            <Textarea className="h-full resize-none" value={message} onChange={e => setMessage(e.currentTarget.value)} />
            <div className="flex flex-col gap-2">
              <Button variant="action" title="Send">
                <SendHorizonal size={ICON_SIZE} />
              </Button>
              <Button variant="action" title="Add Text">
                <NotebookText size={ICON_SIZE} />
              </Button>
              <Button variant="action" title="Add File">
                <FilePlus size={ICON_SIZE} />
              </Button>
            </div>
            </ResizeableContent>
          </Resizeable>
      </SheetContent>
    </Sheet>
  );
}

function Message({ children, className }: BaseProps) {

  return (
    <Fragment>
      <div className={cn("flex flex-col gap-1 px-6 py-4 rounded-lg max-w-10/12 select-text", className)}>
        {children}
      </div>
      <div className="flex justify-end gap-1">
        {/* Actions */}
        <Button variant="ghost" title="Copy" className="p-1 h-8 w-8">
          <ClipboardIcon size={14} />
        </Button>
        <Button variant="ghost" title="New Thread" className="p-1 h-8 w-8">
          <Plus size={14} />
        </Button>
      </div>
    </Fragment>
  )
}

function AIChatMessage({ message }: BaseProps<{ message: string }>) {
  return (
    <Message>
      { message }
    </Message>
  )
}

function UserInputMessage({ children, className }: BaseProps) {

  return (
    <Message className={cn("ml-auto bg-slate-300/20 hover:bg-slate-300/30 border border-gray-600 rounded-tr-none transition-colors duration-700 ", className)}>
      {children}
    </Message>
  )
}

function FileMessage({ file }: BaseProps<{ file: File }>) {
  
  return (
    <UserInputMessage>
      <FileDisplay file={file} />
    </UserInputMessage>
  )
}

function TextMessage({ message }: BaseProps<{ message: string }>) {
  return (
    <UserInputMessage className="w-8/12">
      <MarkdownDisplay>{message}</MarkdownDisplay>
    </UserInputMessage>
  )
}




function UserChatMessage({ message }: BaseProps<{ message: string }>) {
  return (
    <UserInputMessage className="max-w-8/12">
      <MarkdownDisplay>{message}</MarkdownDisplay>
    </UserInputMessage>
  )
}