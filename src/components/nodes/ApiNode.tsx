// ApiNode.tsx
import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import NodeWrapper from './NodeWrapper'; // Adjust the import path as needed

interface ApiNodeData {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  onDelete?: (nodeId: string, event: React.MouseEvent) => void;
}

const ApiNode: React.FC<NodeProps<ApiNodeData>> = ({ id, data }) => (
  <NodeWrapper
    id={id}
    onDelete={data.onDelete}
    style={{
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: '#e0f7fa',
      minWidth: '150px',
      position: 'relative',
    }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    
    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
      <strong>API Node</strong>
      <p style={{ fontSize: '12px', margin: '4px 0' }}>
        URL: {data?.url || 'Not configured'}
      </p>
      <p style={{ fontSize: '12px', margin: '4px 0' }}>
        Method: {data?.method || 'Not configured'}
      </p>
    </div>
    
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </NodeWrapper>
);

export default ApiNode;
