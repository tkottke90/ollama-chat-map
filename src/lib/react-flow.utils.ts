import { Node, Viewport } from "@xyflow/react";
import { getElemDimensionsBySelector } from "./utils";

export function calculateNextNodePos(nodes: Node[], viewport: Viewport) {
  // Create a default position
  const nextPos = { x: 0, y: 0};

  // Check for nodes that are selected.  This is used for positioning
  // and auto-generating edges
  const selected = nodes.filter(node => node.selected);

  if (selected.length > 0) { // If there are selected nodes
    // Get the max bottom position from all selected elements
    // by calculating it's y position plus it's height.  This gives
    // us the bottom of the node so we do not overlap with other nodes
    const maxY = Math.max(
      ...selected.map(node => node.position.y + (node.measured?.height ?? 0))
    );

    nextPos.y = maxY + 50;

    // Get the median x position of each node by calculating
    // its current X position plus 1/2 of its width.  This gives
    // us the middle of node in the X Direction
    const xPositions = selected.map(node => node.position.x)

    // Calculate the median X position
    const medianXPos = xPositions.reduce((acc, val) => acc + val, 0) / xPositions.length;

    nextPos.x = medianXPos;
  } else { // Else add it to the middle of the current viewport
    // Get the window dimensions
    const clientRect = getElemDimensionsBySelector('#canvas-container')

    // Add to the middle of the current viewport
    nextPos.x = viewport.x + clientRect.width / 2;
    nextPos.y = viewport.y + clientRect.height / 2;
  }

  return nextPos;
}