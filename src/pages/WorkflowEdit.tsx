import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import NodeConfigurationModal from '../components/NodeConfigurationModal';
import ApiNode from '../components/nodes/ApiNode';
import EmailNode from '../components/nodes/EmailNode';
import EndNode from '../components/nodes/initialNodes/EndNode';
import StartNode from '../components/nodes/initialNodes/StartNode';
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
  data: EmailNodeData | ApiNodeData | TextNodeData | { label?: string; onDelete?: (nodeId: string, event: React.MouseEvent) => void };
}

const WorkflowEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isNodeSelectionModalOpen, setIsNodeSelectionModalOpen] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isNodeConfigModalOpen, setIsNodeConfigModalOpen] = useState(false);
  const [selectedNodeConfig, setSelectedNodeConfig] = useState<WorkflowNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for workflow metadata
  const [workflowName, setWorkflowName] = useState<string>("Untitled");
  const [workflowDescription, setWorkflowDescription] = useState<string>("");

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    if (!id) return;
    try {
      const workflowDoc = await getDoc(doc(db, 'workflows', id));
      if (!workflowDoc.exists()) {
        setError('Workflow not found');
        return;
      }
      const workflowData = workflowDoc.data();
      // Set workflow metadata from Firestore
      setWorkflowName(workflowData.name || "Untitled");
      setWorkflowDescription(workflowData.description || "");
      // Load nodes and edges
      setNodes(
        workflowData.nodes.map((node: WorkflowNode) => ({
          ...node,
          data: {
            ...node.data,
            onDelete: (nodeId: string) => handleDeleteNodeById(nodeId),
          },
        }))
      );
      setEdges(workflowData.edges);
    } catch (error) {
      console.error('Error loading workflow:', error);
      setError('Error loading workflow');
    } finally {
      setLoading(false);
    }
  };

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
          data: { 
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
            onDelete: (nodeId: string, event: React.MouseEvent) => handleDeleteNodeById(nodeId)
          },
        };

        const verticalOffset = 100;
        const updatedNodes = nodes.map((node) => {
          if (node.id !== 'start' && node.id !== 'end' && node.position.y > newPosition.y) {
            return { ...node, position: { ...node.position, y: node.position.y + verticalOffset } };
          }
          return node;
        });

        setNodes([...updatedNodes, newNode]);

        setEdges((eds) =>
          eds
            .filter((e) => e.id !== selectedEdge.id)
            .concat(
              {
                id: `e-${selectedEdge.source}-${newId}`,
                source: selectedEdge.source,
                target: newId,
                type: 'plusicon'
              },
              {
                id: `e-${newId}-${selectedEdge.target}`,
                source: newId,
                target: selectedEdge.target,
                type: 'plusicon'
              }
            )
        );

        setSelectedNodeConfig(newNode);
        setIsNodeConfigModalOpen(true);
        setSelectedEdge(null);
      }
    }
  }, [nodes, setNodes, setEdges, selectedEdge]);

  const handleDeleteNodeById = useCallback((nodeId: string) => {
    if (nodeId === 'start' || nodeId === 'end') return;

    setNodes((nds) => {
      const nodeToDelete = nds.find((node) => node.id === nodeId);
      if (!nodeToDelete) return nds;
      const deletedNodeY = nodeToDelete.position.y;
      const verticalOffset = 100;
      const filteredNodes = nds.filter((node) => node.id !== nodeId);
      return filteredNodes.map((node) => {
        if (node.position.y > deletedNodeY) {
          return { ...node, position: { ...node.position, y: node.position.y - verticalOffset } };
        }
        return node;
      });
    });

    setEdges((eds) => {
      const incomingEdges = eds.filter((edge) => edge.target === nodeId);
      const outgoingEdges = eds.filter((edge) => edge.source === nodeId);
      let updatedEdges = eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

      if (incomingEdges.length === 1 && outgoingEdges.length === 1) {
        const parentEdge = incomingEdges[0];
        const childEdge = outgoingEdges[0];
        const newEdge = {
          id: `e-${parentEdge.source}-${childEdge.target}`,
          source: parentEdge.source,
          target: childEdge.target,
          type: 'plusicon'
        };
        updatedEdges = [...updatedEdges, newEdge];
      }
      return updatedEdges;
    });
  }, [setNodes, setEdges]);

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
        node.id === selectedNodeConfig?.id ? { ...node, data: selectedNodeConfig.data } : node
      )
    );
    setIsNodeConfigModalOpen(false);
    setSelectedNodeConfig(null);
  }, [setNodes, selectedNodeConfig]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeConfig(node as WorkflowNode);
    setIsNodeConfigModalOpen(true);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading workflow...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

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
          nodes={nodes}
          edges={edges}
          onBack={() => navigate('/workflows')}
          isEditMode={true}
          initialName={workflowName}
          initialDescription={workflowDescription}
        />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            refX={5}
            refY={0}
            orient="auto"
            markerWidth={6}
            markerHeight={6}
            fill="#888"
          >
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
        onConfigChange={handleNodeConfigChange}
        nodeConfig={selectedNodeConfig}
      />
    </div>
  );
};

export default WorkflowEdit;
