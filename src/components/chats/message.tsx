import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";
import { ClipboardIcon, Plus } from "lucide-preact";
import { Fragment } from "preact/jsx-runtime";
import { Button } from "../ui/button";

export function MessageBody({ children, className }: BaseProps) {
  return (
    <div className={cn("flex flex-col gap-1 px-6 py-4 rounded-lg max-w-10/12 select-text", className)}>{children}</div>
  )
}

export function Message({ children, className }: BaseProps) {
  return (
    <Fragment>
      <MessageBody className={className}>{children}</MessageBody>
      <div className="flex justify-end gap-1 text-white">
        {/* Actions */}
        <Button variant="ghost" title="Copy" className="p-1 h-8 w-8">
          <ClipboardIcon size={14} />
        </Button>
        <Button variant="ghost" title="New Thread" className="p-1 h-8 w-8">
          <Plus size={14} />
        </Button>
      </div>
    </Fragment>
  );
}