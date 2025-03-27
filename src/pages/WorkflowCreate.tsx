import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Mail, Globe, TextIcon } from 'lucide-react';

const nodeTypes = {
  start: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-full bg-green-500 text-white">
      {data.label}
    </div>
  ),
  end: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-full bg-red-500 text-white">
      {data.label}
    </div>
  ),
  email: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-500 text-white flex items-center gap-2">
      <Mail size={16} />
      {data.label}
    </div>
  ),
  input: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-500 text-white flex items-center gap-2">
      <TextIcon size={16} />
      {data.label}
    </div>
  ),
  api: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-orange-500 text-white flex items-center gap-2">
      <Globe size={16} />
      {data.label}
    </div>
  ),
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'start',
    position: { x: 250, y: 5 },
    data: { label: 'Start' },
  },
];

function WorkflowCreate() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    // TODO: Implement save functionality with Firebase
    console.log('Saving workflow:', { workflowName, workflowDescription, nodes, edges });
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Create Workflow</h1>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Workflow Name"
              className="border p-2 rounded"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="border p-2 rounded"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addNode('email')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Mail size={16} /> Email
            </button>
            <button
              onClick={() => addNode('input')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              <TextIcon size={16} /> Input
            </button>
            <button
              onClick={() => addNode('api')}
              className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              <Globe size={16} /> API
            </button>
            <button
              onClick={() => addNode('end')}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              End
            </button>
            <button
              onClick={handleSave}
              className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save Workflow
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default WorkflowCreate;