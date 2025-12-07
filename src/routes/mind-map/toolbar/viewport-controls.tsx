import { useDebounceEffect } from "@/lib/hooks/useDebounce";
import { useTauriListener } from "@/lib/hooks/useTauriListener";
import { getElemDimensionsBySelector } from "@/lib/utils";
import { Panel, ViewportHelperFunctionOptions, useReactFlow, useViewport } from "@xyflow/react";
import { Fullscreen, MonitorDot, ZoomInIcon, ZoomOutIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { iconStyle } from "./toolbar-constants";
import { ToolbarButton } from "./toolbar-utils";

const zoomAnimations: ViewportHelperFunctionOptions = {
  interpolate: 'smooth',
  duration: 500,
}


export function ZoomIn() {
  const { zoomIn } = useReactFlow();

  return (
    <ToolbarButton title="Zoom In" onClick={() => zoomIn(zoomAnimations)}>
      <ZoomInIcon className={iconStyle} />
    </ToolbarButton>
  )
}

export function ZoomOut() {
  const { zoomOut } = useReactFlow();

  return (
    <ToolbarButton title="Zoom Out" className="relative" onClick={() => zoomOut(zoomAnimations)}>
      <ZoomOutIcon className={iconStyle} />
    </ToolbarButton>
  )
}

export function ZoomToFit() {
  const { fitView } = useReactFlow();

  return (
    <ToolbarButton title="Zoom to Fit" className="relative" onClick={() => fitView({ padding: 0.2, ...zoomAnimations })}>
      <Fullscreen className={iconStyle} />
    </ToolbarButton>
  )
}

export function ResetViewport() {
  const { setViewport } = useReactFlow();

  return (
    <ToolbarButton title="Reset Viewport" className="relative" onClick={() => setViewport({ x: 0, y: 0, zoom: 1, ...zoomAnimations})}>
      <MonitorDot className={iconStyle} />
    </ToolbarButton>
  )
}

 
export default function ViewportLogger() {
  const showViewportDebug = useTauriListener('aiMindMap://window/updateViewportDisplay', false)
  const { x, y, zoom } = useViewport();
  const [dimensions, setDimensions] = useState(() => getElemDimensionsBySelector('#canvas-container'))

  useDebounceEffect(1000, () => {
    setDimensions(getElemDimensionsBySelector('#canvas-container'))
  })

  if (!showViewportDebug) return null;

  return <Panel position="bottom-left" className="text-white">
    <p>
      <strong>
        <u>Viewport:</u>
      </strong>
    </p>
    <p>Position: {x.toFixed(2)},{y.toFixed(2)}</p>
    <p>Dimensions: w: {dimensions.width}, h: {dimensions.height}</p>
    <p>Zoom: {zoom.toFixed(2)}</p>
  </Panel>;
}