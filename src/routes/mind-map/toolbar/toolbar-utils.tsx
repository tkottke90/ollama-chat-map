import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";
import { forwardRef } from "preact/compat";

export const ToolbarButton = forwardRef<HTMLButtonElement, BaseProps>((props, ref) => {
  return (
    <button {...props} ref={ref} className={cn("w-full p-2 cursor-pointer! hover:bg-blue-100 rounded", props.className)} />
  )
})

export function ToolbarGroup({ children }: BaseProps) {
  
  return (
    <div className="shadow-lg bg-white rounded flex flex-col relative">{children}</div>
  );
}

export function ToolbarSeparator() {
  return (<hr className="border-zinc-800 w-10/12 m-auto" />)
}