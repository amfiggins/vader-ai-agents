/**
 * API Server - REST API for the orchestration service
 * 
 * This provides an HTTP interface to interact with the orchestrator
 */

import { Orchestrator } from './orchestrator';
import { AgentInterface } from './agent-interface';
import { AgentName } from './types';

export interface APIServerConfig {
  port?: number;
  orchestrator: Orchestrator;
}

export class APIServer {
  private config: APIServerConfig;

  constructor(config: APIServerConfig) {
    this.config = {
      port: 3000,
      ...config,
    };
  }

  /**
   * Start the API server
   * 
   * This is a placeholder - in a real implementation, you would use
   * Express, Fastify, or another HTTP framework
   */
  async start(): Promise<void> {
    // Example API routes:
    // 
    // POST /workflows - Start a new workflow
    // GET /workflows/:id - Get workflow status
    // POST /workflows/:id/approve - Approve and continue
    // POST /workflows/:id/reject - Reject and block
    // GET /workflows/:id/history - Get workflow history
    // GET /agents - List available agents
    // 
    // Example implementation with Express:
    //
    // const express = require('express');
    // const app = express();
    // app.use(express.json());
    //
    // app.post('/workflows', async (req, res) => {
    //   const { prompt, startingAgent } = req.body;
    //   const result = await this.config.orchestrator.startWorkflow(
    //     prompt,
    //     startingAgent || 'crystal'
    //   );
    //   res.json(result);
    // });
    //
    // app.get('/workflows/:id', (req, res) => {
    //   const result = this.config.orchestrator.getWorkflowStatus(req.params.id);
    //   res.json(result);
    // });
    //
    // app.post('/workflows/:id/approve', async (req, res) => {
    //   const { approved } = req.body;
    //   const result = await this.config.orchestrator.continueWorkflow(
    //     req.params.id,
    //     approved !== false
    //   );
    //   res.json(result);
    // });
    //
    // app.listen(this.config.port, () => {
    //   console.log(`API server running on port ${this.config.port}`);
    // });

    console.log('API Server placeholder - implement with Express/Fastify/etc.');
    console.log(`Would start on port ${this.config.port}`);
  }
}

/**
 * Example API usage:
 * 
 * // Start workflow
 * POST /workflows
 * {
 *   "prompt": "Add authentication middleware",
 *   "startingAgent": "crystal"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "workflowId": "abc-123",
 *   "currentAgent": "crystal",
 *   "status": "waiting_approval",
 *   "requiresApproval": true,
 *   "approvalRequest": { ... }
 * }
 * 
 * // Approve and continue
 * POST /workflows/abc-123/approve
 * {
 *   "approved": true
 * }
 * 
 * // Get status
 * GET /workflows/abc-123
 * {
 *   "success": true,
 *   "workflowId": "abc-123",
 *   "currentAgent": "chloe",
 *   "status": "in_progress"
 * }
 */
