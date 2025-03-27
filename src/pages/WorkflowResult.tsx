import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Check, AlertTriangle, Mail, Globe, TextIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { IWorkflow, IWorkflowExecution } from '../types/workflow';

const nodeTypes = {
  start: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-full ${data.status === 'passed' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
      {data.status === 'passed' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {data.label}
      {data.message && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
          {data.message}
        </span>
      )}
    </div>
  ),
  end: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-full ${data.status === 'passed' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
      {data.status === 'passed' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {data.label}
      {data.message && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
          {data.message}
        </span>
      )}
    </div>
  ),
  email: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-md ${data.status === 'passed' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
      <Mail size={16} />
      {data.status === 'passed' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {data.label}
      {data.message && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
          {data.message}
        </span>
      )}
    </div>
  ),
  input: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-md ${data.status === 'passed' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
      <TextIcon size={16} />
      {data.status === 'passed' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {data.label}
      {data.message && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
          {data.message}
        </span>
      )}
    </div>
  ),
  api: ({ data }) => (
    <div className={`px-4 py-2 shadow-md rounded-md ${data.status === 'passed' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-2`}>
      <Globe size={16} />
      {data.status === 'passed' ? <Check size={16} /> : <AlertTriangle size={16} />}
      {data.label}
      {data.message && (
        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
          {data.message}
        </span>
      )}
    </div>
  ),
};

function WorkflowResult() {
  const { id, executionId } = useParams<{ id: string; executionId: string }>();
  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [execution, setExecution] = useState<IWorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && executionId) {
      loadWorkflowAndExecution(id, executionId);
    }
  }, [id, executionId]);

  const loadWorkflowAndExecution = async (workflowId: string, execId: string) => {
    try {
      const [workflowDoc, executionDoc] = await Promise.all([
        getDoc(doc(db, 'workflows', workflowId)),
        getDoc(doc(db, 'workflow-executions', execId))
      ]);

      if (workflowDoc.exists() && executionDoc.exists()) {
        const workflowData = { id: workflowDoc.id, ...workflowDoc.data() } as IWorkflow;
        const executionData = { id: executionDoc.id, ...executionDoc.data() } as IWorkflowExecution;
        
        setWorkflow(workflowData);
        setExecution(executionData);
      }
    } catch (error) {
      console.error('Error loading workflow and execution:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!workflow || !execution) {
    return <div className="flex items-center justify-center h-screen">Workflow or execution not found</div>;
  }

  const nodes = workflow.nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      status: execution.nodeResults[node.id]?.status || 'pending',
      message: execution.nodeResults[node.id]?.message
    }
  }));

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{workflow.name}</h1>
              <p className="text-gray-600">{workflow.description}</p>
            </div>
            <div className={`px-4 py-2 rounded ${execution.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {execution.status === 'passed' ? (
                <span className="flex items-center gap-2">
                  <Check size={16} /> Execution Passed
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={16} /> Execution Failed
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Executed at: {new Date(execution.executedAt).toLocaleString()}
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

export default WorkflowResult;