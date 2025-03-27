import React from 'react';
import { Handle, Position } from 'reactflow';

interface StartNodeProps {
  data: { label?: string };
}

const StartNode: React.FC<StartNodeProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Display the node */}
      <div className="w-14 h-14 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white font-bold">
          {data.label || 'Start'}
        </div>
      </div>
      {/* Output handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ background: '#555', width: 10, height: 10 }}
      />
    </div>
  );
};

export default StartNode;
