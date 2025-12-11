/**
 * Local API Server - Express-based server for local development
 */

import express, { Request, Response } from 'express';
import { Orchestrator } from './orchestrator';
import { AgentInterface, LLMAgentInterface, MockAgentInterface } from './agent-interface';
import { AgentName } from './types';

const app = express();
app.use(express.json());

// CORS middleware for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize orchestrator
let orchestrator: Orchestrator | null = null;

function initializeOrchestrator() {
  if (orchestrator) return orchestrator;

  // Check for LLM configuration
  const llmProvider = process.env.LLM_PROVIDER as 'openai' | 'anthropic' | undefined;
  const llmApiKey = process.env.LLM_API_KEY;
  const llmModel = process.env.LLM_MODEL;

  let agentInterface: AgentInterface;

  if (llmProvider && llmApiKey) {
    // Use real LLM provider
    if (llmProvider === 'openai') {
      agentInterface = new LLMAgentInterface({
        apiKey: llmApiKey,
        provider: 'openai',
        model: llmModel || 'gpt-4',
      });
    } else if (llmProvider === 'anthropic') {
      agentInterface = new LLMAgentInterface({
        apiKey: llmApiKey,
        provider: 'anthropic',
        model: llmModel || 'claude-3-5-sonnet-20241022',
      });
    } else {
      throw new Error(`LLM provider ${llmProvider} not supported. Use 'openai' or 'anthropic'.`);
    }
  } else {
    // Use mock interface for testing
    console.warn('⚠️  No LLM_API_KEY found. Using MockAgentInterface for testing.');
    console.warn('   Set LLM_PROVIDER and LLM_API_KEY environment variables to use real agents.');
    agentInterface = new MockAgentInterface();
  }

  orchestrator = new Orchestrator(
    {
      autoApprove: process.env.AUTO_APPROVE === 'true',
      maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
      timeout: parseInt(process.env.TIMEOUT || '300000', 10),
    },
    agentInterface
  );

  return orchestrator;
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'vader-ai-orchestrator' });
});

// Start a new workflow
app.post('/workflows', async (req: Request, res: Response) => {
  try {
    const { prompt, startingAgent } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const orch = initializeOrchestrator();
    const result = await orch.startWorkflow(
      prompt,
      (startingAgent as AgentName) || 'crystal'
    );

    res.json(result);
  } catch (error) {
    console.error('Error starting workflow:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get workflow status
app.get('/workflows/:id', (req: Request, res: Response) => {
  try {
    const orch = initializeOrchestrator();
    const result = orch.getWorkflowStatus(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Approve and continue workflow
app.post('/workflows/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approved = true } = req.body;
    const orch = initializeOrchestrator();
    const result = await orch.continueWorkflow(req.params.id, approved);
    res.json(result);
  } catch (error) {
    console.error('Error approving workflow:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Reject workflow (blocks it)
app.post('/workflows/:id/reject', async (req: Request, res: Response) => {
  try {
    const orch = initializeOrchestrator();
    const result = await orch.continueWorkflow(req.params.id, false);
    res.json(result);
  } catch (error) {
    console.error('Error rejecting workflow:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get workflow history
app.get('/workflows/:id/history', (req: Request, res: Response) => {
  try {
    const orch = initializeOrchestrator();
    const workflowState = orch.getWorkflowState(req.params.id);
    
    if (!workflowState) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({
      workflowId: workflowState.workflowId,
      status: workflowState.status,
      currentAgent: workflowState.currentAgent,
      history: workflowState.history,
      approvals: workflowState.approvals,
      metadata: workflowState.metadata,
      createdAt: workflowState.createdAt,
      updatedAt: workflowState.updatedAt,
    });
  } catch (error) {
    console.error('Error getting workflow history:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List all workflows
app.get('/workflows', (req: Request, res: Response) => {
  try {
    const orch = initializeOrchestrator();
    // Access stateManager through orchestrator's internal reference
    const { stateManager } = require('./state-manager');
    const workflows = req.query.active === 'true' 
      ? stateManager.getActiveWorkflows()
      : stateManager.getAllWorkflows();
    
    res.json({ workflows });
  } catch (error) {
    console.error('Error listing workflows:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List available agents
app.get('/agents', (req: Request, res: Response) => {
  try {
    const { AgentRegistry } = require('./agent-registry');
    const agents = AgentRegistry.getAllAgents();
    res.json({ agents });
  } catch (error) {
    console.error('Error listing agents:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log('🚀 Vader AI Orchestrator API Server');
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   POST   /workflows              - Start a new workflow`);
  console.log(`   GET    /workflows/:id          - Get workflow status`);
  console.log(`   POST   /workflows/:id/approve  - Approve and continue`);
  console.log(`   POST   /workflows/:id/reject   - Reject and block`);
  console.log(`   GET    /workflows/:id/history  - Get workflow history`);
  console.log(`   GET    /workflows              - List all workflows`);
  console.log(`   GET    /agents                 - List available agents`);
  console.log(`   GET    /health                 - Health check`);
  console.log('');
  
  if (!process.env.LLM_API_KEY) {
    console.log('⚠️  Running in MOCK mode (no LLM API key configured)');
    console.log('   Set LLM_PROVIDER and LLM_API_KEY to use real agents');
    console.log('   Example: LLM_PROVIDER=openai LLM_API_KEY=sk-...');
  } else {
    const provider = process.env.LLM_PROVIDER || 'openai';
    const model = process.env.LLM_MODEL || (provider === 'openai' ? 'gpt-4' : 'claude-3-5-sonnet-20241022');
    console.log(`✅ Using ${provider} LLM provider (model: ${model})`);
  }
  console.log('');
});
