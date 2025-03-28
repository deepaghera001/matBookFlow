// NodeWrapper.tsx
import { Trash2 } from 'lucide-react';
import React from 'react';

interface NodeWrapperProps {
  id: string;
  onDelete?: (nodeId: string, event: React.MouseEvent) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const NodeWrapper: React.FC<NodeWrapperProps> = ({ id, onDelete, children, style }) => {
  return (
    <div style={{ position: 'relative', ...style }}>
      {onDelete && (
        <button
          className="nodrag"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(id, event);
          }}
          style={{
            position: 'absolute',
            top: '25px',
            right: '5px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 9999,
            pointerEvents: 'auto',
            padding: 0,
          }}
          title="Delete Node"
        >
          <Trash2 size={16} color="#f44336" />
        </button>
      )}
      {children}
    </div>
  );
};

export default NodeWrapper;
