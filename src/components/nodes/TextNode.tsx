import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

interface TextNodeData {
  text?: string;
}

const TextNode: React.FC<NodeProps<TextNodeData>> = ({ data }) => (
  <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px', 
      backgroundColor: '#fff8e1', 
      position: 'relative' 
    }}>
    {/* Input Handle */}
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    
    <strong>Text</strong>
    <p>{data?.text || 'Not configured'}</p>
    
    {/* Output Handle */}
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

export default TextNode;
