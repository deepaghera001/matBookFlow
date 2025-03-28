import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowExecutionStore } from '../store/workflowExecutionStore';
import ReactFlow, { Node, Edge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft } from 'lucide-react';

interface ExecutionResult {
  nodeId: string;
  type: string; // e.g. "start", "api", "email", etc.
  success: boolean;
  error?: string;
}

interface Execution {
  executionId: string;
  workflowId: string;
  startTime: string;
  endTime: string;
  status: 'failed' | 'completed';
  results: ExecutionResult[];
}

const ExecutionFlowPage: React.FC = () => {
  const { workflowId, executionIndex } = useParams<{ workflowId: string; executionIndex?: string }>();
  const navigate = useNavigate();

  // Fetch executions for the given workflowId from your store
  const executions = useWorkflowExecutionStore((state) => state.getExecutions(workflowId || ''));

  if (!executions || executions.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col bg-gray-50">
        <div className="p-4 bg-white shadow-sm flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No executions found for workflow: {workflowId}
        </div>
      </div>
    );
  }

  // If an executionIndex is provided, use it; otherwise, use the last one.
  const index = executionIndex !== undefined ? parseInt(executionIndex, 10) : executions.length - 1;
  const execution: Execution = executions[index];

  const statusLabel = execution.status === 'failed' ? 'Failed' : 'Passed';
  const statusColor =
    execution.status === 'failed'
      ? 'text-red-600 bg-red-100 border border-red-300'
      : 'text-green-600 bg-green-100 border border-green-300';

  // Helper to style each node based on success and node type
  const getNodeStyle = (res: ExecutionResult): React.CSSProperties => {
    const isStartOrEnd = res.type === 'start' || res.type === 'end';
    const success = res.success;
    return {
      background: success ? '#ECFDF5' : '#FEF2F2',
      border: `2px solid ${success ? '#10B981' : '#EF4444'}`,
      color: success ? '#065F46' : '#B91C1C',
      width: isStartOrEnd ? 70 : 100,
      height: isStartOrEnd ? 70 : 40,
      borderRadius: isStartOrEnd ? '50%' : '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
    };
  };

  // Build nodes array from execution results
  const nodes: Node[] = useMemo(() => {
    return execution.results.map((res, idx) => {
      const positionY = 50 + idx * 150;
      let labelText = res.type;
      if (res.type === 'start') labelText = 'Start';
      if (res.type === 'end') labelText = 'End';
      return {
        id: res.nodeId,
        position: { x: 300, y: positionY },
        data: { label: labelText },
        style: getNodeStyle(res),
      };
    });
  }, [execution.results]);

  // Build edges between consecutive nodes
  const edges: Edge[] = useMemo(() => {
    const arr: Edge[] = [];
    for (let i = 0; i < execution.results.length - 1; i++) {
      const currentNode = execution.results[i];
      const nextNode = execution.results[i + 1];
      arr.push({
        id: `edge-${currentNode.nodeId}-${nextNode.nodeId}`,
        source: currentNode.nodeId,
        target: nextNode.nodeId,
        type: 'smoothstep',
      });
    }
    return arr;
  }, [execution.results]);

  return (
    <div className="h-screen w-full bg-[#FAF8F5] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center p-4 gap-4 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
        <span className="font-semibold">Workflow: {workflowId}</span>
        <span className={`px-2 py-1 text-sm rounded-md ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Flow Container */}
      <div className="flex-1" style={{ minHeight: 0 }}>
        <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.2 }}>
          <Background variant="dots" gap={12} size={1} color="#E5E7EB" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ExecutionFlowPage;
