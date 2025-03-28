import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowExecutionStore } from '../store/workflowExecutionStore';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, CheckCircle2, AlertCircle, Settings2, Mail } from 'lucide-react';
import SaveOptionBar from '../components/SaveOptionBar';
// ^-- import icons as needed (check, exclamation, gear, mail, etc.)

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
  const { workflowId, executionIndex } = useParams<{
    workflowId: string;
    executionIndex?: string;
  }>();
  const navigate = useNavigate();

  // Fetch executions for the given workflowId from your store
  const executions = useWorkflowExecutionStore((state) =>
    state.getExecutions(workflowId || '')
  );

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
  const index =
    executionIndex !== undefined
      ? parseInt(executionIndex, 10)
      : executions.length - 1;
  const execution: Execution = executions[index];

  const statusLabel = execution.status === 'failed' ? 'Failed' : 'Passed';
  const statusColor =
    execution.status === 'failed'
      ? 'text-red-600 bg-red-100 border border-red-300'
      : 'text-green-600 bg-green-100 border border-green-300';

  /**
   * Returns a small icon indicating success or failure, plus an icon
   * relevant to the node type (gear for API, mail for Email, etc.).
   */
  const getNodeIcon = (type: string, success: boolean) => {
    // Base icon for the node type
    let BaseIcon = Settings2; // default
    if (type === 'email') BaseIcon = Mail;
    if (type === 'api') BaseIcon = Settings2;
    // ... add more if you have other node types

    // Success/failure overlay icon
    const StatusIcon = success ? CheckCircle2 : AlertCircle;
    const statusColor = success ? '#10B981' : '#EF4444';

    // For start/end, we might not show an overlay icon
    if (type === 'start' || type === 'end') {
      return null;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <BaseIcon size={16} color="#555" />
        <StatusIcon size={16} color={statusColor} />
      </div>
    );
  };

  /**
   * Returns a custom label component that includes the text and icons
   * for each node.
   */
  const getNodeLabel = (res: ExecutionResult): JSX.Element => {
    let labelText = res.type;
    if (res.type === 'start') labelText = 'Start';
    if (res.type === 'end') labelText = 'End';
    if (res.type === 'api') labelText = 'API Call';
    if (res.type === 'email') labelText = 'Email';

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        <span>{labelText}</span>
        {getNodeIcon(res.type, res.success)}
      </div>
    );
  };

  /**
   * Styles each node to match the screenshot:
   * - Start node: green circle, white text
   * - End node: red circle, white text
   * - Intermediate nodes: white rectangle with gray border, black text
   */
  const getNodeStyle = (res: ExecutionResult): React.CSSProperties => {
    const isStart = res.type === 'start';
    const isEnd = res.type === 'end';
    const success = res.success;

    // START node style
    if (isStart) {
      return {
        background: '#45B36B',
        color: '#fff',
        borderRadius: '50%',
        width: 60,
        height: 60,
        border: '1px solid #45B36B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
      };
    }

    // END node style
    if (isEnd) {
      return {
        background: '#EB5757',
        color: '#fff',
        borderRadius: '50%',
        width: 60,
        height: 60,
        border: '1px solid #EB5757',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
      };
    }

    // INTERMEDIATE nodes (API, Email, etc.)
    // If failure, border is red; if success, border is gray
    const borderColor = success ? '#A3A3A3' : '#EF4444';

    return {
      background: '#fff',
      color: '#333',
      borderRadius: 8,
      width: 120,
      height: 40,
      border: `1px solid ${borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 400,
    };
  };

  // Build nodes array from execution results
  const nodes: Node[] = useMemo(() => {
    return execution.results.map((res, idx) => {
      const positionY = 50 + idx * 150;

      return {
        id: res.nodeId,
        position: { x: 300, y: positionY },
        data: { label: getNodeLabel(res) },
        style: getNodeStyle(res),
        // We can place the label in the center
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
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
        type: 'smoothstep', // or 'default'
        markerEnd: {
          type: 'arrowclosed',
        },
        style: {
          stroke: '#999',
          strokeWidth: 1.5,
        },
      });
    }
    return arr;
  }, [execution.results]);

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: '#F9F5F0' }}>
      {/* Top Bar */}
      <SaveOptionBar initialTitle={workflowId} onBack={() => navigate(-1)} status={execution.status}></SaveOptionBar>
      {/* <div className="flex items-center justify-start p-4 gap-4 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
        <span className="text-gray-800 font-medium">Workflow: {workflowId}</span>
        <span className={`px-2 py-1 text-sm rounded-md ${statusColor}`}>
          {statusLabel}
        </span>
      </div> */}

      {/* Flow Container */}
      <div className="flex-1" style={{ minHeight: 0 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          {/* Dotted background, close to the screenshot style */}
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#E4E0DA" // a subtle gray/beige
          />
          {/* Zoom/Pan controls in bottom-right */}
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ExecutionFlowPage;
