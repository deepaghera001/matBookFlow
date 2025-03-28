import React from 'react';
import { useWorkflowExecutionStore } from '../store/workflowExecutionStore';

interface WorkflowExecutionHistoryProps {
  workflowId: string;
}

const WorkflowExecutionHistory: React.FC<WorkflowExecutionHistoryProps> = ({ workflowId }) => {
  const executions = useWorkflowExecutionStore(state => state.getExecutions(workflowId));
console.log(executions)
  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No execution history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => (
        <div key={execution.executionId} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-500">
                {new Date(execution.startTime).toLocaleString()}
              </span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                execution.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {execution.status}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Duration: {Math.round(
                (new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000
              )}s
            </span>
          </div>

          <div className="space-y-2">
            {execution.results.map((result) => (
              <div 
                key={result.nodeId} 
                className={`flex items-center p-2 rounded-lg ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.type}</span>
                    <span className="text-xs text-gray-500">{result.nodeId}</span>
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowExecutionHistory;