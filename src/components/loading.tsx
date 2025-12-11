import { BaseProps } from "@/lib/utility-types"
import { cn } from "@/lib/utils"

export function Circle({ size = 16, className }: BaseProps<{ size?: number }>) {

  return (<div className={cn("rounded-full border-emerald-500 bg-emerald-300 border", className)} style={{ width: size, height: size }} />)
}

export function Loading({ size }: { size?: number }) {
  return (
    <div className="flex gap-2 my-4 items-center justify-center">
      <Circle size={size} className="animate-bounce" />
      <Circle size={size} className="animate-bounce delay-75" />
      <Circle size={size} className="animate-bounce delay-150" />
    </div>
  )
}