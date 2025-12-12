/**
 * Local API Server - Express-based server for local development
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { Orchestrator } from './orchestrator';
import { AgentInterface, LLMAgentInterface, MockAgentInterface } from './agent-interface';
import { AgentName } from './types';
import { projectManager } from './project-manager';

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

// Serve static files from public directory
const fs = require('fs');
const publicPath = path.join(__dirname, '../public');
const publicPathSrc = path.join(process.cwd(), 'public');
const publicPathDist = path.join(process.cwd(), 'dist/public');

// Determine which public path exists (check in order of preference)
let staticPath = null;
if (fs.existsSync(publicPathDist)) {
  staticPath = publicPathDist;
  console.log(`Serving static files from: ${staticPath}`);
} else if (fs.existsSync(publicPathSrc)) {
  staticPath = publicPathSrc;
  console.log(`Serving static files from: ${staticPath}`);
} else if (fs.existsSync(publicPath)) {
  staticPath = publicPath;
  console.log(`Serving static files from: ${staticPath}`);
}

if (staticPath) {
  app.use(express.static(staticPath));
  console.log(`Static files configured from: ${staticPath}`);
} else {
  console.warn('⚠️  No public directory found. Web interface will not be available.');
}

// Serve the web interface (dark 90s style)
app.get('/', (req: Request, res: Response) => {
  if (!staticPath) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Vader AI Orchestrator</title></head>
        <body style="font-family: -apple-system; padding: 40px; background: #1a1a1a; color: #00ff00;">
          <h1>Vader AI Orchestrator API</h1>
          <p>Web interface not found. API is available at:</p>
          <ul>
            <li>POST /workflows - Start workflow</li>
            <li>GET /workflows/:id - Get workflow status</li>
            <li>GET /projects - List projects</li>
            <li>GET /agents - List agents</li>
          </ul>
        </body>
      </html>
    `);
  }
  
  // Try dark 90s style first, then fallback to regular
  const darkIndexPath = path.join(staticPath, 'index-dark-90s.html');
  const indexPath = path.join(staticPath, 'index.html');
  
  if (fs.existsSync(darkIndexPath)) {
    res.sendFile(darkIndexPath);
  } else if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Try projects.html as fallback
    const projectsPath = path.join(staticPath, 'projects.html');
    if (fs.existsSync(projectsPath)) {
      res.sendFile(projectsPath);
    } else {
      res.status(404).send('Web interface not found');
    }
  }
});

// Start a new workflow
app.post('/workflows', async (req: Request, res: Response) => {
  try {
    const { prompt, startingAgent, projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const orch = initializeOrchestrator();
    const result = await orch.startWorkflow(
      prompt,
      (startingAgent as AgentName) || 'crystal',
      projectId
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

// ===== PROJECT MANAGEMENT ENDPOINTS =====

// Create project
app.post('/projects', (req: Request, res: Response) => {
  try {
    const { name, description, directories, githubRepos } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = projectManager.createProject({
      name,
      description: description || '',
      directories: directories || [],
      githubRepos: githubRepos || [],
    });

    res.json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all projects
app.get('/projects', (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const projects = activeOnly
      ? projectManager.getActiveProjects()
      : projectManager.getAllProjects();
    res.json({ projects });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get project
app.get('/projects/:id', (req: Request, res: Response) => {
  try {
    const project = projectManager.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const progress = projectManager.getProjectProgress(req.params.id);
    res.json({ project, progress });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update project
app.put('/projects/:id', (req: Request, res: Response) => {
  try {
    const project = projectManager.updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add directory to project
app.post('/projects/:id/directories', (req: Request, res: Response) => {
  try {
    const project = projectManager.addDirectory(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error adding directory:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add GitHub repo to project
app.post('/projects/:id/github-repos', (req: Request, res: Response) => {
  try {
    const project = projectManager.addGitHubRepo(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error adding GitHub repo:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add task to project
app.post('/projects/:id/tasks', (req: Request, res: Response) => {
  try {
    const project = projectManager.addTask(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update task
app.put('/projects/:id/tasks/:taskId', (req: Request, res: Response) => {
  try {
    const project = projectManager.updateTask(req.params.id, req.params.taskId, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project or task not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add milestone to project
app.post('/projects/:id/milestones', (req: Request, res: Response) => {
  try {
    const project = projectManager.addMilestone(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add note to project
app.post('/projects/:id/notes', (req: Request, res: Response) => {
  try {
    const project = projectManager.addNote(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user action items
app.get('/user-actions', (req: Request, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.projectId) filters.projectId = req.query.projectId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.type) filters.type = req.query.type;

    const items = projectManager.getUserActionItems(filters);
    res.json({ items });
  } catch (error) {
    console.error('Error getting user action items:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Complete user action item
app.post('/user-actions/:id/complete', (req: Request, res: Response) => {
  try {
    const { userNotes, triggerWorkflow } = req.body;
    const item = projectManager.completeUserActionItem(
      req.params.id,
      userNotes,
      triggerWorkflow !== false
    );

    if (!item) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    // If workflow should be triggered, continue the workflow
    if (triggerWorkflow !== false && item.workflowId) {
      const orch = initializeOrchestrator();
      orch.continueWorkflow(item.workflowId, true).catch((err) => {
        console.error('Error continuing workflow:', err);
      });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error completing action item:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get project progress
app.get('/projects/:id/progress', (req: Request, res: Response) => {
  try {
    const progress = projectManager.getProjectProgress(req.params.id);
    if (!progress) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ progress });
  } catch (error) {
    console.error('Error getting project progress:', error);
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
