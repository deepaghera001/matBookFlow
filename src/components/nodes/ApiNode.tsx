import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

interface ApiNodeData {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

const ApiNode: React.FC<NodeProps<ApiNodeData>> = ({ data }) => (
  <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', backgroundColor: '#e0f7fa', position: 'relative' }}>
    {/* Input Handle */}
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    
    <strong>API</strong>
    <p>URL: {data?.url || 'Not configured'}</p>
    <p>Method: {data?.method || 'Not configured'}</p>
    
    {/* Output Handle */}
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

export default ApiNode;
