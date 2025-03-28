import emailjs from '@emailjs/browser';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowExecutionStore } from '../store/workflowExecutionStore';

interface NodeData {
  id: string;
  type: string;
  data: any;
}

interface ExecutionResult {
  success: boolean;
  data: any;
  error?: string;
}

export class WorkflowExecutionService {
  constructor() {
    // Initialize EmailJS with public key from environment variables
    const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!emailJsPublicKey) {
      console.error('EmailJS Public Key not found in environment variables. Email functionality will not work.');
      return;
    }
    try {
      emailjs.init(emailJsPublicKey);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async executeEmailNode(node: NodeData, parentData?: any): Promise<ExecutionResult> {
    try {
      // Validate recipient email
      if (!node.data.email) {
        throw new Error('Recipient email address is required');
      }

      // Get EmailJS configuration
      const serviceId = node.data.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = node.data.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = node.data.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Validate EmailJS configuration
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Missing required EmailJS configuration. Please check your environment variables for VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY');
      }

      // Prepare email template data
      const templateData = {
        to_email: node.data.email,
        subject: node.data.subject || 'Workflow Email',
        message: node.data.message || '',
        parent_data: typeof parentData === 'string' ? parentData : JSON.stringify(parentData, null, 2),
        timestamp: new Date().toISOString()
      };  

      // Validate template data
      if (!templateData.message && !templateData.parent_data) {
        throw new Error('Email message or parent data is required');
      }

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateData,
        publicKey
      );

      if (response.status !== 200) {
        throw new Error(`Email sending failed with status: ${response.status} - ${response.text}`);
        }

      return {
        success: true,
        data: { 
          to_email: templateData.to_email,
          subject: templateData.subject,
          message: templateData.message,
          parent_data: templateData.parent_data,
          status: response.status,
          text: response.text,
          timestamp: templateData.timestamp
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      console.error('Email node execution failed:', errorMessage);
      return {
        success: false,
        data: null,
        error: errorMessage
      };
    }
  }

  private async executeApiNode(node: NodeData, parentData?: any): Promise<ExecutionResult> {
    try {
      const { url, method = 'GET', headers = {} } = node.data;
      
      // Prepare request configuration
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(parentData) : undefined
      };

      // For GET requests with query params
      const finalUrl = method === 'GET' && parentData
        ? `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(parentData)}`
        : url;

      console.log('Making API request:', { url: finalUrl, ...config });
      const response = await fetch(finalUrl, config);
      const data = await response.json();

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'API call failed'
      };
    }
  }

  private executeTextNode(node: NodeData, parentData?: any): ExecutionResult {
    if (!node.data || typeof node.data.text !== 'string') {
      return {
        success: false,
        data: null,
        error: 'Invalid text node data: text property is required and must be a string'
      };
    }
    const text = node.data.text;
    const processedText = text.includes('{{parentData}}') && parentData
      ? text.replace('{{parentData}}', typeof parentData === 'string' ? parentData : JSON.stringify(parentData))
      : text;

    return {
      success: true,
      data: {
        text: processedText,
        originalText: text,
        parentData: parentData,
        timestamp: new Date().toISOString()
      }
    };
  }

  private executeStartNode(node: NodeData): ExecutionResult {
    return {
      success: true,
      data: {
        message: 'Workflow started',
        timestamp: new Date().toISOString()
      }
    };
  }

  private executeEndNode(node: NodeData, parentData?: any): ExecutionResult {
    return {
      success: true,
      data: {
        message: 'Workflow completed',
        finalData: parentData,
        timestamp: new Date().toISOString()
      }
    };
  }

  public async executeNode(node: NodeData, parentData?: any): Promise<ExecutionResult> {
    switch (node.type) {
      case 'start':
        return this.executeStartNode(node);
      case 'end':
        return this.executeEndNode(node, parentData);
      case 'api':
        return this.executeApiNode(node, parentData);
      case 'email':
        return this.executeEmailNode(node, parentData);
      case 'text':
        return this.executeTextNode(node, parentData);
      default:
        return {
          success: false,
          data: null,
          error: `Unsupported node type: ${node.type}`
        };
    }
  }

  public async executeWorkflow(workflowId: string, nodes: NodeData[], edges: any[]): Promise<Map<string, ExecutionResult>> {
    const executionId = uuidv4();
    const startTime = new Date().toISOString();
    const results = new Map<string, ExecutionResult>();
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const nodeResults: Array<{
      nodeId: string;
      type: string;
      success: boolean;
      timestamps: string[];
      data: Record<string, unknown>;
      error?: string;
    }> = [];
    
    // Create a map of parent-child relationships
    const childrenMap = new Map<string, string[]>();
    edges.forEach(edge => {
      const parentId = edge.source;
      const childId = edge.target;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(childId);
    });

    // Find start nodes (nodes with no incoming edges)
    const startNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    // Execute nodes in topological order
    const executeNode = async (nodeId: string, parentResult?: any) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const result = await this.executeNode(node, parentResult);
      results.set(nodeId, result);

      // Store node execution result
      const existingResult = nodeResults.find(r => r.nodeId === node.id);
      const currentTimestamp = new Date().toISOString();
      
      if (existingResult) {
        existingResult.timestamps.push(currentTimestamp);
        existingResult.success = result.success;
        existingResult.data = result.data;
        existingResult.error = result.error;
      } else {
        nodeResults.push({
          nodeId: node.id,
          type: node.type,
          success: result.success,
          timestamps: [currentTimestamp],
          data: result.data,
          error: result.error
        });
      }

      // Execute children
      const children = childrenMap.get(nodeId) || [];
      for (const childId of children) {
        await executeNode(childId, result.data);
      }
    };

    // Start execution from each start node
    for (const startNode of startNodes) {
      await executeNode(startNode.id);
    }

    const endTime = new Date().toISOString();
    const status = nodeResults.every(result => result.success) ? 'completed' : 'failed';

    // Store execution history
    useWorkflowExecutionStore.getState().addExecution(workflowId, {
      executionId,
      workflowId,
      startTime,
      endTime,
      status,
      results: nodeResults
    });

    return results;
  }
}