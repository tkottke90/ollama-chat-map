import { BaseProps } from "@/lib/utility-types";
import { GripHorizontal, GripVertical } from "lucide-preact";

export function GrabHandleVertical({ className }: BaseProps) {
  return (
    <GripVertical
      width={16}
      className={`${className} cursor-grab active:cursor-grabbing`}
    />
  )
}

export function GrabHandleHorizontal({ className }: BaseProps) {
  return (
    <GripHorizontal
      width={16}
      className={`${className} cursor-grab active:cursor-grabbing`}
    />
  )
}