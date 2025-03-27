import React, { useState } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  // Calculate the edge path and label (midpoint) coordinates.
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // State to show/hide dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePlusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const handleSelectNode = (nodeType: string) => {
    // Callback provided via edge data from the parent
    if (data && data.onAddNode) {
      data.onAddNode({ nodeType, edgeId: id, labelX, labelY });
    }
    setShowDropdown(false);
  };

  return (
    <>
      {/* Render the edge path */}
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Plus icon placed at the midpoint */}
      <foreignObject
        width={40}
        height={40}
        x={labelX - 20}
        y={labelY - 20}
        onClick={handlePlusClick}
      >
        <div className="w-full h-full flex items-center justify-center cursor-pointer text-xl text-blue-500">
          ➕
        </div>
      </foreignObject>

      {/* Dropdown menu for selecting node type */}
      {showDropdown && (
        <foreignObject width={120} height={100} x={labelX - 60} y={labelY - 100}>
          <div className="bg-white shadow-lg rounded p-2 flex flex-col">
            <button
              className="text-sm text-gray-800 hover:bg-gray-200 rounded p-1 text-left"
              onClick={() => handleSelectNode("email")}
            >
              Email Node
            </button>
            <button
              className="text-sm text-gray-800 hover:bg-gray-200 rounded p-1 text-left"
              onClick={() => handleSelectNode("text")}
            >
              Text Node
            </button>
            <button
              className="text-sm text-gray-800 hover:bg-gray-200 rounded p-1 text-left"
              onClick={() => handleSelectNode("api")}
            >
              API Node
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default CustomEdge;
