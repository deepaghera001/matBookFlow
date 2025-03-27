import React, { useEffect } from 'react';
import { Edge, XYPosition } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { Node as WorkflowNode } from './WorkflowCreateTypes';

interface NodeInsertionHandlerProps {
  selectedEdge: Edge;
  nodes: WorkflowNode[];
  edges: Edge[];
  newNodeType: string;
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onOpenNodeConfig: (node: WorkflowNode) => void;
}

const NodeInsertionHandler: React.FC<NodeInsertionHandlerProps> = ({
  selectedEdge,
  nodes,
  edges,
  newNodeType,
  onNodesChange,
  onEdgesChange,
  onOpenNodeConfig,
}) => {
  useEffect(() => {
    // Find source and target nodes for the selected edge
    const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
    const targetNode = nodes.find((node) => node.id === selectedEdge.target);

    if (sourceNode && targetNode) {
      // Calculate the new node's position between source and target
      const newPosition: XYPosition = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };

      // Create the new node with an empty data object; this can be updated later
      const newId = uuidv4();
      const newNode: WorkflowNode = {
        id: newId,
        type: newNodeType,
        position: newPosition,
        data: {},
      };

      // Update the nodes state: add the new node
      onNodesChange([...nodes, newNode]);

      // Update the edges:
      // Remove the original edge and add two new edges that connect the new node
      const updatedEdges = edges.filter((edge) => edge.id !== selectedEdge.id);
      updatedEdges.push(
        {
          id: `e-${selectedEdge.source}-${newId}`,
          source: selectedEdge.source,
          target: newId,
          type: 'plusicon',
        },
        {
          id: `e-${newId}-${selectedEdge.target}`,
          source: newId,
          target: selectedEdge.target,
          type: 'plusicon',
        }
      );
      onEdgesChange(updatedEdges);

      // Open the node configuration modal for the new node so the user can edit its details
      onOpenNodeConfig(newNode);
    }
    // The dependency array intentionally omits functions that do not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This component does not render anything
};

export default NodeInsertionHandler;
