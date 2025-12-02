import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";


export function Small({ children, className }: BaseProps) {
  return <span className={cn("text-xs opacity-50", className)}>{children}</span>
}