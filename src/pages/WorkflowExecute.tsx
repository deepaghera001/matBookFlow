import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { WorkflowExecutionService } from '../services/workflowExecutionService';

interface ExecutionResult {
  success: boolean;
  data: any;
  error?: string;
}

const WorkflowExecute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<Map<string, ExecutionResult>>(new Map());
  const [workflow, setWorkflow] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      setWorkflow(workflowData);
      executeWorkflow(workflowData.nodes, workflowData.edges);
    } catch (error) {
      console.error('Error loading workflow:', error);
      setError('Error loading workflow');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (nodes: any[], edges: any[]) => {
    setExecuting(true);
    try {
      const executionService = new WorkflowExecutionService();
      const executionResults = await executionService.executeWorkflow(id, nodes, edges);
      setResults(executionResults);
    } catch (error) {
      console.error('Error executing workflow:', error);
      setError('Error executing workflow');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading workflow...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => navigate('/workflows')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Workflows
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Executing Workflow: {workflow?.name}</h1>
        <button
          onClick={() => navigate('/workflows')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Workflows
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {executing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Executing workflow...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(results.entries()).map(([nodeId, result]) => (
              <div
                key={nodeId}
                className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      Node: {workflow.nodes.find((n: any) => n.id === nodeId)?.type}
                    </h3>
                    <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? 'Success' : 'Failed'}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  {result.success ? (
                    <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-red-600">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowExecute;