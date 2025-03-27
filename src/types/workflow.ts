export interface INode {
  id: string;
  type: 'start' | 'end' | 'email' | 'input' | 'api';
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface IEdge {
  id: string;
  source: string;
  target: string;
}

export interface IWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: INode[];
  edges: IEdge[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface IWorkflowExecution {
  id: string;
  workflowId: string;
  status: 'passed' | 'failed';
  nodeResults: {
    [nodeId: string]: {
      status: 'passed' | 'failed';
      message?: string;
    };
  };
  executedAt: Date;
}