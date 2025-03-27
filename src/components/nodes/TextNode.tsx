// TextNode.tsx
import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import NodeWrapper from './NodeWrapper'; // Adjust the path as needed

interface TextNodeData {
  text?: string;
  onDelete?: (nodeId: string, event: React.MouseEvent) => void;
}

const TextNode: React.FC<NodeProps<TextNodeData>> = ({ id, data }) => (
  <NodeWrapper
    id={id}
    onDelete={data.onDelete}
    style={{
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      backgroundColor: '#fff8e1',
      minWidth: '150px',
    }}
  >
    {/* Input Handle */}
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    
    <strong>Text</strong>
    <p>{data?.text || 'Not configured'}</p>
    
    {/* Output Handle */}
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </NodeWrapper>
);

export default TextNode;
