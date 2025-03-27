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
import TextNode from '../components/nodes/TextNode';
import NodeSelectionModal from '../components/NodeSelectionModal';
import SaveOption from '../components/ui/SaveOption';

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
  const [x, y] = [(sourceX + targetX) / 2, (sourceY + targetY) / 2];

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
        markerEnd={`url(#arrow)`}
      />
      <foreignObject x={x - 12} y={y - 12} width={24} height={24} className="edgebutton-foreignobject">
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
          +
        </button>
      </foreignObject>
    </>
  );
};

const edgeTypes = {
  plusicon: PlusIconEdge,
};

interface WorkflowNode extends Node {
  data: EmailNodeData | ApiNodeData | TextNodeData | { label?: string };
}

const initialNodes: WorkflowNode[] = [
  { id: 'start', type: 'input', data: { label: 'Start' }, position: { x: 50, y: 50 }, style: { borderRadius: '50%', width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' } },
  { id: 'end', type: 'output', data: { label: 'End' }, position: { x: 500, y: 200 }, style: { borderRadius: '50%', width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' } },
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

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'plusicon' }, eds));
  }, [setEdges]);

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setIsNodeSelectionModalOpen(true);
  }, []);

  const handleNodeSelect = useCallback((type: NodeType) => {
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
          type: type,
          position: newPosition,
          data: {}, // Initial empty data, will be configured
        };

        setNodes((nds) => [...nds, newNode]);

        // Replace the existing edge with two new edges connecting the new node
        setEdges((eds) =>
          eds
            .filter((e) => e.id !== selectedEdge.id)
            .concat(
              { id: `e-${selectedEdge.source}-${newId}`, source: selectedEdge.source, target: newId, type: 'plusicon' },
              { id: `e-${newId}-${selectedEdge.target}`, source: newId, target: selectedEdge.target, type: 'plusicon' }
            )
        );

        // Open configuration modal for the newly added node
        setSelectedNodeConfig(newNode);
        setIsNodeConfigModalOpen(true);
        setSelectedEdge(null); // Reset selected edge
      }
    }
  }, [nodes, setNodes, setEdges, selectedEdge, setIsNodeSelectionModalOpen]);

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
        prevConfig
          ? {
            ...prevConfig,
            data: {
              ...prevConfig.data,
              [name]: value,
            },
          }
          : null
      );
    },
    [setSelectedNodeConfig]
  );

  const handleSaveNodeConfig = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeConfig?.id ? { ...node, data: selectedNodeConfig.data } : node
      )
    );
    setIsNodeConfigModalOpen(false);
    setSelectedNodeConfig(null);
  }, [setNodes, selectedNodeConfig, setIsNodeConfigModalOpen]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeConfig(node as WorkflowNode);
    setIsNodeConfigModalOpen(true);
  }, [setIsNodeConfigModalOpen, setSelectedNodeConfig]);

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
        <SaveOption
          onSave={() => console.log("Saving...")}
          onBack={() => console.log("Going back...")}
        />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
        <defs>
          <marker id="arrow" viewBox="0 -5 10 10" refX={5} refY={0} orient="auto" markerWidth={6} markerHeight={6} fill="#888">
            <path d="M0,-5 L10,0 L0,5" />
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
        nodeConfig={selectedNodeConfig}
        onConfigChange={handleNodeConfigChange}
      />
    </div>
  );
};

export default WorkflowCreate;