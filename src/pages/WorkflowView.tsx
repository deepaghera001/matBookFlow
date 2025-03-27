import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Check, AlertTriangle, Mail, Globe, TextIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { IWorkflow, IWorkflowExecution } from '../types/workflow';

const nodeTypes = {
  start: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-full ${data.status === 'passed' ? 'bg-green-500' : data.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'} text-white flex items-center gap-2`}>
      {data.status === 'passed' && <Check size={16} />}
      {data.status === 'failed' && <AlertTriangle size={16} />}
      {data.label}
    </div>
  ),
  end: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-full ${data.status === 'passed' ? 'bg-green-500' : data.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'} text-white flex items-center gap-2`}>
      {data.status === 'passed' && <Check size={16} />}
      {data.status === 'failed' && <AlertTriangle size={16} />}
      {data.label}
    </div>
  ),
  email: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-md ${data.status === 'passed' ? 'bg-green-500' : data.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'} text-white flex items-center gap-2`}>
      <Mail size={16} />
      {data.status === 'passed' && <Check size={16} />}
      {data.status === 'failed' && <AlertTriangle size={16} />}
      {data.label}
    </div>
  ),
  input: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-md ${data.status === 'passed' ? 'bg-green-500' : data.status === 'failed' ? 'bg-red-500' : 'bg-purple-500'} text-white flex items-center gap-2`}>
      <TextIcon size={16} />
      {data.status === 'passed' && <Check size={16} />}
      {data.status === 'failed' && <AlertTriangle size={16} />}
      {data.label}
    </div>
  ),
  api: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-md ${data.status === 'passed' ? 'bg-green-500' : data.status === 'failed' ? 'bg-red-500' : 'bg-orange-500'} text-white flex items-center gap-2`}>
      <Globe size={16} />
      {data.status === 'passed' && <Check size={16} />}
      {data.status === 'failed' && <AlertTriangle size={16} />}
      {data.label}
    </div>
  ),
};

function WorkflowView() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [execution, setExecution] = useState<IWorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    try {
      const workflowDoc = await getDoc(doc(db, 'workflows', workflowId));
      if (workflowDoc.exists()) {
        const workflowData = { id: workflowDoc.id, ...workflowDoc.data() } as IWorkflow;
        setWorkflow(workflowData);
        
        // Load the latest execution
        const executionDoc = await getDoc(doc(db, 'workflow-executions', `${workflowId}-latest`));
        if (executionDoc.exists()) {
          setExecution(executionDoc.data() as IWorkflowExecution);
        }
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!workflow) {
    return <div className="flex items-center justify-center h-screen">Workflow not found</div>;
  }

  const nodes = workflow.nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      status: execution?.nodeResults[node.id]?.status || 'pending'
    }
  }));

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{workflow.name}</h1>
            <p className="text-gray-600">{workflow.description}</p>
          </div>
          <div className={`px-4 py-2 rounded ${execution?.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {execution?.status === 'passed' ? (
              <span className="flex items-center gap-2">
                <Check size={16} /> Passed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} /> Failed
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={workflow.edges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default WorkflowView;