import { BaseProps } from "@/lib/utility-types";
import { cn } from "@/lib/utils";
import { Message } from "./message";

export function UserInputMessage({ children, className }: BaseProps) {
  return <Message className={cn("ml-auto bg-slate-300/20 hover:bg-slate-300/30 border border-gray-600 rounded-tr-none transition-colors duration-700 ", className)}>{children}</Message>;
}