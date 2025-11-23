import { Panel, useReactFlow } from "@xyflow/react";
import { ZoomInIcon, ZoomOutIcon } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { iconStyle } from "./toolbar-constants";
import { ToolbarButton } from "./toolbar-utils";

export function ZoomIn() {
  const { getZoom, zoomIn } = useReactFlow();

  return (
    <ToolbarButton>
      <ZoomInIcon className={iconStyle} onClick={() => zoomIn()} />
    </ToolbarButton>
  )
}

export function ZoomOut() {
  const { getZoom, zoomOut } = useReactFlow();

  console.dir({
    zoom: getZoom()
  });

  return (
    <ToolbarButton className="relative">
      <ZoomOutIcon className={iconStyle} onClick={() => zoomOut()} />
    </ToolbarButton>
  )
}

export function ZoomToFit() {

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