import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface NodeExecutionResult {
  nodeId: string;
  type: string;
  success: boolean;
  timestamps: string[];
  data: Record<string, unknown>;
  error?: string;
}

interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'failed';
  results: NodeExecutionResult[];
}

type State = {
  executions: Record<string, WorkflowExecution[]>;
}

type Actions = {
  addExecution: (workflowId: string, execution: WorkflowExecution) => void;
  getExecutions: (workflowId: string) => WorkflowExecution[];
  clearExecutions: (workflowId: string) => void;
}

type WorkflowExecutionState = State & Actions;

export const useWorkflowExecutionStore = create<WorkflowExecutionState>()(persist(
  (set, get) => ({
    executions: {},
    addExecution: (workflowId: string, execution: WorkflowExecution) => 
      set((state) => ({
        executions: {
          ...state.executions,
          [workflowId]: [
            execution,
            ...(state.executions[workflowId] || [])
          ].slice(0, 50) // Keep only last 50 executions
        }
      })),
    getExecutions: (workflowId: string) => 
      get().executions[workflowId] || [],
    clearExecutions: (workflowId: string) =>
      set((state) => ({
        executions: {
          ...state.executions,
          [workflowId]: []
        }
      }))
  }),
  {
    name: 'workflow-execution-storage',
    storage: createJSONStorage(() => localStorage)
  }
));