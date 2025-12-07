import { Node, XYPosition } from "@xyflow/react";
import { getElemDimensionsBySelector } from "./utils";

function getMedianPosition(nodes: Node[]) {
  const xPosSum = nodes
    .map(node => node.position.x)
    .reduce((acc, val) => acc + val, 0);

  return xPosSum / nodes.length;
}

function positionInViewport(screenToFlowPosition: (clientPosition: XYPosition, options?: { snapToGrid: boolean; }) => XYPosition) {
  const clientRect = getElemDimensionsBySelector('#canvas-container');

  return screenToFlowPosition({
    x: clientRect.width / 2,
    y: clientRect.height / 2
  });
}

export function calculateNextNodePos(
  nodes: Node[],
  screenToFlowPosition: (clientPosition: XYPosition, options?: { snapToGrid: boolean; }) => XYPosition
) {
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

    // Screen to flow not needed here because we are detailing with
    // dimensions in the react flow canvas and not the screen
    return {
      x: getMedianPosition(selected),
      y: maxY + 50
    }
  } else if (nodes.length > 0) {
    // When there are other nodes but none selected,
    // we position it under the last node

    // X Pos is based on median X of all the nodes
    const medianX = getMedianPosition(nodes);

    // Find the node with the highest Y value
    const nodeHeights = nodes
      .map((node) => (node.measured?.height ?? 0) + (node.position.y)) // Calculate the bottom of each node and store along with the original index
      .sort((aBottom, bBottom) => aBottom - bBottom)                   // Sort nodes by bottom position
      .reverse();

    // Add 50 for a gap between the newly created node and 
    // any other nodes
    const maxY = nodeHeights[0] + 50;

    // Screen to flow not needed here because we are detailing with
    // dimensions in the react flow canvas and not the screen
    return {
      x: medianX,
      y: maxY
    }
  } else { 
    // When there are no nodes, we can simply center in the viewport
    return positionInViewport(screenToFlowPosition)
  } 
}

export function clearSelections(nodes: Node[]) {
  return nodes.map(node => {
    node.selected = false;
    
    return node;
  })
}