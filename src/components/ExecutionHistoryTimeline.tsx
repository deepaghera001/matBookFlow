import React from 'react';
import { Link } from 'react-router-dom';
import { useWorkflowExecutionStore } from '../store/workflowExecutionStore';
import { Link2 } from 'lucide-react';

interface ExecutionHistoryTimelineProps {
  workflowId: string;
}

const ExecutionHistoryTimeline: React.FC<ExecutionHistoryTimelineProps> = ({ workflowId }) => {
  const executions = useWorkflowExecutionStore((state) => state.getExecutions(workflowId));

  if (!executions || executions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No execution history available
      </div>
    );
  }

  return (
    <div className="relative border-l border-gray-200 ml-4">
      {executions.map((execution, index) => {
        // Parse date/time
        const startTime = new Date(execution.startTime);
        const timeLabel = startTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const dateLabel = startTime.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        // Determine success/failure
        const isPassed = execution.status === 'completed';
        const bulletColor = isPassed ? 'bg-green-500' : 'bg-red-500';
        const rowColor = isPassed ? 'bg-green-50' : 'bg-red-50';
        const statusLabel = isPassed ? 'Passed' : 'Failed';

        // Calculate duration
        const durationSec = Math.round(
          (new Date(execution.endTime).getTime() -
            new Date(execution.startTime).getTime()) /
            1000
        );

        return (
          <div key={execution.executionId} className="mb-6 ml-6 last:mb-0 relative">
            {/* Vertical connecting line */}
            <span className="absolute -left-px top-0 h-full w-0.5 bg-gray-300" />

            {/* Colored bullet */}
            <div className={`absolute -left-3 w-5 h-5 rounded-full border-2 border-white ${bulletColor}`} />

            {/* Execution row */}
            <div className={`p-4 rounded-md ${rowColor}`}>
              <div className="flex items-center justify-between">
                {/* Left side: Date/time + status label */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {dateLabel} - {timeLabel} IST
                  </span>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                {/* Right side: Link icon navigates to ExecutionFlowPage with index */}
                <Link to={`/workflows/executionflow/${workflowId}/${index}`}>
                  <Link2 className="cursor-pointer text-gray-600" size={18} />
                </Link>
              </div>
              {/* Duration */}
              <div className="mt-1 text-sm text-gray-500">
                Duration: {durationSec}s
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExecutionHistoryTimeline;
