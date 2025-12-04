import { BaseProps } from "@/lib/utility-types";
import { cn, registerEventList } from "@/lib/utils";
import { useEffect, useRef } from "preact/hooks";

export function Resizeable({ children, minHeight }: BaseProps<{ minHeight?: number }>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current || !containerRef.current) return;

    const barEvents = registerEventList(barRef.current, [
      [ 'mousedown', () => { containerRef.current!.dataset.dragging = "true" } ],
      [ 'touchstart', () => { containerRef.current!.dataset.dragging = "true" } ],
    ]);

    const windowEvents = registerEventList(window, [
      [ 'mouseup', () => { containerRef.current!.dataset.dragging = "false" } ],
      [ 'touchend', () => { containerRef.current!.dataset.dragging = "false" } ],
      [ 'mousemove', (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (containerRef.current.dataset.dragging !== "true") return;

        const { height: windowHeight } = document.body.getBoundingClientRect();
        const { height: containerHeight } = containerRef.current.getBoundingClientRect();

        const calculatedHeight = containerHeight - Math.round((e.clientY - containerRef.current.getBoundingClientRect().top));

        // Calculate new height based on mouse position relative to the container's bottom
        const newHeight = Math.max(
          Math.min(
            calculatedHeight,
            windowHeight / 2
          ),
          minHeight ?? 100
        );

        containerRef.current.style.height = `${newHeight}px`;
      }]
    ])

    return () => {
      barEvents();
      windowEvents();
    }
  }, []);

  return (
    <div ref={containerRef} className="px-4 flex flex-col gap-4 select-none relative">
      <div ref={barRef} className="h-4 cursor-move">
        <hr className="" />
      </div>
      {children}
    </div>
  )
}

export function ResizeableContent({ children, className }: BaseProps) {
  return (
    <div className={cn("h-full", className)}>
      {children}
    </div>
  )
}