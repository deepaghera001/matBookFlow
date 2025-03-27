import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

interface EmailNodeData {
  email?: string;
}

const EmailNode: React.FC<NodeProps<EmailNodeData>> = ({ data }) => (
  <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px', 
      backgroundColor: '#f0f0f0', 
      position: 'relative' 
    }}>
    {/* Input Handle */}
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    
    <strong>Email</strong>
    <p>Email: {data?.email || 'Not configured'}</p>
    
    {/* Output Handle */}
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

export default EmailNode;
