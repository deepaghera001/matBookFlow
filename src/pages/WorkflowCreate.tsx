import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Edge,
  EdgeProps,
  Node,
  OnConnect,
  useEdgesState,
  useNodesState,
  XYPosition
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import NodeConfigurationModal from '../components/NodeConfigurationModal';
import ApiNode from '../components/nodes/ApiNode';
import EmailNode from '../components/nodes/EmailNode';
import EndNode from '../components/nodes/initialNodes/EndNode';
import StartNode from '../components/nodes/initialNodes/StartNode';
import TextNode from '../components/nodes/TextNode';
import NodeSelectionModal from '../components/NodeSelectionModal';
import SaveOption from '../components/ui/SaveOption';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react'; // <--- Lucide icon

interface EmailNodeData {
  email?: string;
}

interface ApiNodeData {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

interface TextNodeData {
  text?: string;
}

type NodeType = 'email' | 'api' | 'text';

const nodeTypes = {
  email: EmailNode,
  api: ApiNode,
  text: TextNode,
  start: StartNode,
  end: EndNode,
};

interface PlusIconEdgeProps extends EdgeProps {
  onClick?: (event: React.MouseEvent, edge: Edge) => void;
}

const PlusIconEdge: React.FC<PlusIconEdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  onClick,
}) => {
  // Calculate midpoint for the plus button
  const [x, y] = [(sourceX + targetX) / 2, (sourceY + targetY) / 2];

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
        markerEnd="url(#downArrow)" // <--- our custom marker
        style={{ stroke: '#888', strokeWidth: 2 }} // Thicker stroke
      />
      <foreignObject
        x={x - 12}
        y={y - 12}
        width={24}
        height={24}
        className="edgebutton-foreignobject"
        style={{ overflow: 'visible' }}
      >
        <button
          className="edgebutton"
          onClick={(event) => onClick?.(event, { id, source, target })}
          style={{
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#555',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          }}
        >
          <Plus size={16} />
        </button>
      </foreignObject>
    </>
  );
};

const edgeTypes = {
  plusicon: PlusIconEdge,
};

interface WorkflowNode extends Node {
  data:
  | EmailNodeData
  | ApiNodeData
  | TextNodeData
  | {
    label?: string;
    onDelete?: (nodeId: string, event: React.MouseEvent) => void;
  };
}

// Fixed start/end nodes
const initialNodes: WorkflowNode[] = [
  {
    id: 'start',
    type: 'start',
    data: { label: 'Start' },
    position: { x: 300, y: 50 },
  },
  {
    id: 'end',
    type: 'end',
    data: { label: 'End' },
    position: { x: 300, y: 600 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'start', target: 'end', type: 'plusicon' },
];

const WorkflowCreate: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isNodeSelectionModalOpen, setIsNodeSelectionModalOpen] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isNodeConfigModalOpen, setIsNodeConfigModalOpen] = useState(false);
  const [selectedNodeConfig, setSelectedNodeConfig] = useState<WorkflowNode | null>(null);
  const navigate = useNavigate();

  const ITEMS_VERTICAL_SPACING = 100;

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'plusicon' }, eds)),
    [setEdges]
  );

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setIsNodeSelectionModalOpen(true);
  }, []);

  const handleNodeSelect = useCallback(
    (type: NodeType) => {
      setNewNodeType(type);
      setIsNodeSelectionModalOpen(false);

      if (selectedEdge) {
        const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
        const targetNode = nodes.find((node) => node.id === selectedEdge.target);

        if (sourceNode && targetNode) {
          const newId = uuidv4();
          const newPosition: XYPosition = {
            x: (sourceNode.position.x + targetNode.position.x) / 2,
            y: (sourceNode.position.y + targetNode.position.y) / 2,
          };

          const newNode: WorkflowNode = {
            id: newId,
            type,
            position: newPosition,
            data: {
              label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
              onDelete: (nodeId: string, event: React.MouseEvent) => handleDeleteNodeById(nodeId),
            },
          };

          // Shift nodes below
          const updatedNodes = nodes.map((node) => {
            if (node.id !== 'start' && node.id !== 'end' && node.position.y > newPosition.y) {
              return {
                ...node,
                position: {
                  ...node.position,
                  y: node.position.y + ITEMS_VERTICAL_SPACING,
                },
              };
            }
            return node;
          });

          setNodes([...updatedNodes, newNode]);

          // Replace the existing edge with two new edges
          setEdges((eds) =>
            eds
              .filter((e) => e.id !== selectedEdge.id)
              .concat(
                {
                  id: `e-${selectedEdge.source}-${newId}`,
                  source: selectedEdge.source,
                  target: newId,
                  type: 'plusicon',
                },
                {
                  id: `e-${newId}-${selectedEdge.target}`,
                  source: newId,
                  target: selectedEdge.target,
                  type: 'plusicon',
                }
              )
          );

          // Optionally open config
          setSelectedNodeConfig(newNode);
          setIsNodeConfigModalOpen(true);
          setSelectedEdge(null);
        }
      }
    },
    [nodes, setNodes, setEdges, selectedEdge]
  );

  // Delete node by id with edge reconnection if applicable
  const handleDeleteNodeById = useCallback(
    (nodeId: string) => {
      if (nodeId === 'start' || nodeId === 'end') return; // don't delete these

      setNodes((nds) => {
        const nodeToDelete = nds.find((node) => node.id === nodeId);
        if (!nodeToDelete) return nds;

        const deletedNodeY = nodeToDelete.position.y;
        // Remove the node and shift nodes below it up
        const filteredNodes = nds.filter((node) => node.id !== nodeId);
        return filteredNodes.map((node) => {
          if (node.position.y > deletedNodeY) {
            return {
              ...node,
              position: {
                ...node.position,
                y: node.position.y - ITEMS_VERTICAL_SPACING,
              },
            };
          }
          return node;
        });
      });

      // Reconnect edges
      setEdges((eds) => {
        const incomingEdges = eds.filter((edge) => edge.target === nodeId);
        const outgoingEdges = eds.filter((edge) => edge.source === nodeId);

        let updatedEdges = eds.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        );

        // If exactly one incoming and one outgoing, reconnect them
        if (incomingEdges.length === 1 && outgoingEdges.length === 1) {
          const parentEdge = incomingEdges[0];
          const childEdge = outgoingEdges[0];
          const newEdge: Edge = {
            id: `e-${parentEdge.source}-${childEdge.target}`,
            source: parentEdge.source,
            target: childEdge.target,
            type: 'plusicon',
          };
          updatedEdges = [...updatedEdges, newEdge];
        }
        return updatedEdges;
      });
    },
    [setNodes, setEdges]
  );

  const handleCloseNodeSelectionModal = () => {
    setIsNodeSelectionModalOpen(false);
    setSelectedEdge(null);
  };

  const handleCloseNodeConfigModal = () => {
    setIsNodeConfigModalOpen(false);
    setSelectedNodeConfig(null);
  };

  const handleNodeConfigChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setSelectedNodeConfig((prevConfig) =>
        prevConfig ? { ...prevConfig, data: { ...prevConfig.data, [name]: value } } : null
      );
    },
    []
  );

  const handleSaveNodeConfig = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeConfig?.id
          ? { ...node, data: selectedNodeConfig.data }
          : node
      )
    );
    setIsNodeConfigModalOpen(false);
    setSelectedNodeConfig(null);
  }, [setNodes, selectedNodeConfig]);

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeConfig(node as WorkflowNode);
      setIsNodeConfigModalOpen(true);
    },
    []
  );

  return (
    <div style={{ width: '100%', height: '730px' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        onEdgeClick={handleEdgeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        attributionPosition="top-right"
      >
        {/* SaveOption handles saving */}
        <SaveOption nodes={nodes} edges={edges} onBack={() => navigate('/workflows')} />
        <Controls />
        <Background variant="dots" gap={12} size={1} />

        {/* Custom arrow marker */}
        <defs>
          <marker
            id="downArrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            {/* A triangular path that points in the direction of the edge */}
            <path d="M0,0 L0,10 L10,5 z" fill="#888" />
          </marker>
        </defs>
      </ReactFlow>

      <NodeSelectionModal
        isOpen={isNodeSelectionModalOpen}
        onClose={handleCloseNodeSelectionModal}
        onSelect={handleNodeSelect}
      />

      <NodeConfigurationModal
        isOpen={isNodeConfigModalOpen}
        onClose={handleCloseNodeConfigModal}
        onSave={handleSaveNodeConfig}
        onConfigChange={handleNodeConfigChange}
        nodeConfig={selectedNodeConfig}
      />
    </div>
  );
};

export default WorkflowCreate;
