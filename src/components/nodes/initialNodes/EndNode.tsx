import React from 'react';
import { Handle, Position } from 'reactflow';

interface EndNodeProps {
  data: { label?: string };
}

const EndNode: React.FC<EndNodeProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="b"
        style={{ background: '#555', width: 10, height: 10 }}
      />
      {/* Display the node */}
      <div className="w-14 h-14 rounded-full bg-red-500 border-2 border-red-500 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold">
          {data.label || 'End'}
        </div>
      </div>
    </div>
  );
};

export default EndNode;
