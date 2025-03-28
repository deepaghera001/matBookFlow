import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import NodeWrapper from './NodeWrapper';

interface EmailNodeData {
  email?: string;
  onDelete?: (nodeId: string, event: React.MouseEvent) => void;
}

const EmailNode: React.FC<NodeProps<EmailNodeData>> = ({ id, data }) => (
  <NodeWrapper
    id={id}
    onDelete={data.onDelete}
    style={{
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: '#f0f0f0',
      minWidth: '150px',
      position: 'relative',
    }}
  >
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    
    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
      <strong>Email Node</strong>
      <p style={{ fontSize: '12px', margin: '4px 0' }}>
        Email: {data?.email || 'Not configured'}
      </p>
    </div>
    
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </NodeWrapper>
);

export default EmailNode;