import { Panel, ViewportHelperFunctionOptions, useReactFlow } from "@xyflow/react";
import { Fullscreen, ZoomInIcon, ZoomOutIcon } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { iconStyle } from "./toolbar-constants";
import { ToolbarButton } from "./toolbar-utils";

const zoomAnimations: ViewportHelperFunctionOptions = {
  interpolate: 'smooth',
  duration: 500,
}


export function ZoomIn() {
  const { zoomIn } = useReactFlow();

  return (
    <ToolbarButton onClick={() => zoomIn(zoomAnimations)}>
      <ZoomInIcon className={iconStyle} />
    </ToolbarButton>
  )
}

export function ZoomOut() {
  const { zoomOut } = useReactFlow();

  return (
    <ToolbarButton className="relative" onClick={() => zoomOut(zoomAnimations)}>
      <ZoomOutIcon className={iconStyle} />
    </ToolbarButton>
  )
}

export function ZoomToFit() {
  const { fitView } = useReactFlow();

  return (
    <ToolbarButton className="relative" onClick={() => fitView({ padding: 0.2, ...zoomAnimations })}>
      <Fullscreen className={iconStyle} />
    </ToolbarButton>
  )
}

 
export default function ViewportLogger() {
  const { getViewport } = useReactFlow();
  const [ { x, y, zoom }, setViewport ] = useState(getViewport())

  useEffect(() => {
    setViewport(getViewport())
  });

  return <Panel position="bottom-left" className="text-white">
    <p>Position: {x.toFixed(2)},{y.toFixed(2)}</p>
    <p>Zoom: {zoom.toFixed(2)}</p>
  </Panel>;
}