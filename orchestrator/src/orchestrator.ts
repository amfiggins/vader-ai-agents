/**
 * Main Orchestrator - Coordinates agent communication
 */

import {
  OrchestratorConfig,
  OrchestratorResponse,
  WorkflowState,
  AgentName,
  HandoffRequest,
  Approval,
} from './types';
import { AgentRegistry } from './agent-registry';
import { ResponseParser, ParsedResponse } from './response-parser';
import { stateManager } from './state-manager';
import { AgentInterface, InvokeAgentOptions } from './agent-interface';

export class Orchestrator {
  private config: OrchestratorConfig;
  private agentInterface: AgentInterface;

  constructor(config: OrchestratorConfig, agentInterface: AgentInterface) {
    this.config = {
      autoApprove: false,
      maxRetries: 3,
      timeout: 300000, // 5 minutes
      ...config,
    };
    this.agentInterface = agentInterface;
  }

  /**
   * Start a new workflow
   */
  async startWorkflow(
    initialPrompt: string,
    startingAgent: AgentName = 'crystal'
  ): Promise<OrchestratorResponse> {
    const workflowId = stateManager.createWorkflow(initialPrompt, startingAgent);

    try {
      // Invoke the starting agent
      const result = await this.invokeAgent(workflowId, startingAgent, initialPrompt);

      // Parse the response
      const parsed = ResponseParser.parse(result.response);

      // Update workflow state
      stateManager.addStep(workflowId, {
        agent: startingAgent,
        input: initialPrompt,
        output: {
          agent: startingAgent,
          timestamp: new Date(),
          rawResponse: result.response,
          parsedSections: parsed,
          conversationId: result.conversationId,
        },
        duration: Date.now(), // Would calculate actual duration
      });

      // Check if approval is needed
      if (ResponseParser.requiresApproval(parsed)) {
        const approvalId = stateManager.requestApproval(
          workflowId,
          startingAgent,
          this.buildApprovalDescription(parsed)
        );

        return {
          success: true,
          workflowId,
          currentAgent: startingAgent,
          status: 'waiting_approval',
          requiresApproval: true,
          approvalRequest: stateManager.getWorkflow(workflowId)?.approvals.find(
            (a) => a.id === approvalId
          ),
        };
      }

      // Check if there's a handoff
      if (ResponseParser.hasHandoff(parsed) && parsed.forNextAgent) {
        return await this.handleHandoff(workflowId, startingAgent, parsed.forNextAgent);
      }

      // No handoff, workflow may be complete or waiting
      stateManager.updateStatus(workflowId, 'in_progress');

      return {
        success: true,
        workflowId,
        currentAgent: startingAgent,
        status: 'in_progress',
        message: 'Workflow started. No immediate handoff detected.',
      };
    } catch (error) {
      stateManager.updateStatus(workflowId, 'failed');
      return {
        success: false,
        workflowId,
        currentAgent: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Continue a workflow after approval
   */
  async continueWorkflow(workflowId: string, approved: boolean): Promise<OrchestratorResponse> {
    const workflow = stateManager.getWorkflow(workflowId);
    if (!workflow) {
      return {
        success: false,
        workflowId,
        currentAgent: null,
        status: 'failed',
        error: 'Workflow not found',
      };
    }

    if (workflow.status !== 'waiting_approval') {
      return {
        success: false,
        workflowId,
        currentAgent: workflow.currentAgent,
        status: workflow.status,
        error: 'Workflow is not waiting for approval',
      };
    }

    // Approve the latest pending approval
    const pendingApproval = workflow.approvals
      .filter((a) => a.approved === undefined)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())[0];

    if (pendingApproval) {
      stateManager.approve(
        workflowId,
        pendingApproval.id,
        'user',
        this.config.autoApprove || false
      );
    }

    if (!approved) {
      stateManager.updateStatus(workflowId, 'blocked');
      return {
        success: false,
        workflowId,
        currentAgent: workflow.currentAgent,
        status: 'blocked',
        message: 'Workflow blocked by user rejection',
      };
    }

    // Get the last step to find the handoff
    const lastStep = workflow.history[workflow.history.length - 1];
    if (!lastStep) {
      return {
        success: false,
        workflowId,
        currentAgent: workflow.currentAgent,
        status: 'failed',
        error: 'No previous step found',
      };
    }

    const parsed = lastStep.output.parsedSections;
    if (parsed.forNextAgent) {
      return await this.handleHandoff(
        workflowId,
        workflow.currentAgent || 'crystal',
        parsed.forNextAgent
      );
    }

    return {
      success: true,
      workflowId,
      currentAgent: workflow.currentAgent,
      status: 'in_progress',
      message: 'Approval granted, but no handoff found',
    };
  }

  /**
   * Handle handoff to another agent
   */
  private async handleHandoff(
    workflowId: string,
    fromAgent: AgentName,
    handoff: { targetAgent: AgentName; prompt: string; context?: any }
  ): Promise<OrchestratorResponse> {
    const workflow = stateManager.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Update current agent
    stateManager.setCurrentAgent(workflowId, handoff.targetAgent);

    // Get previous response for context
    const lastStep = workflow.history[workflow.history.length - 1];
    const previousResponse = lastStep?.output.rawResponse;

    // Invoke the next agent
    try {
      const result = await this.invokeAgent(workflowId, handoff.targetAgent, handoff.prompt, {
        previousAgent: fromAgent,
        previousResponse,
        workflowId,
        repo: handoff.context?.repo,
        branch: handoff.context?.branch,
      });

      // Parse the response
      const parsed = ResponseParser.parse(result.response);

      // Add step to history
      stateManager.addStep(workflowId, {
        agent: handoff.targetAgent,
        input: handoff.prompt,
        output: {
          agent: handoff.targetAgent,
          timestamp: new Date(),
          rawResponse: result.response,
          parsedSections: parsed,
          conversationId: result.conversationId,
        },
      });

      // Check if approval is needed
      if (ResponseParser.requiresApproval(parsed)) {
        const approvalId = stateManager.requestApproval(
          workflowId,
          handoff.targetAgent,
          this.buildApprovalDescription(parsed)
        );

        return {
          success: true,
          workflowId,
          currentAgent: handoff.targetAgent,
          status: 'waiting_approval',
          requiresApproval: true,
          approvalRequest: stateManager.getWorkflow(workflowId)?.approvals.find(
            (a) => a.id === approvalId
          ),
        };
      }

      // Check for next handoff
      if (ResponseParser.hasHandoff(parsed) && parsed.forNextAgent) {
        return await this.handleHandoff(workflowId, handoff.targetAgent, parsed.forNextAgent);
      }

      // Check if workflow is complete
      if (parsed.forVader?.noAction && !parsed.forNextAgent) {
        stateManager.updateStatus(workflowId, 'completed');
        return {
          success: true,
          workflowId,
          currentAgent: handoff.targetAgent,
          status: 'completed',
          message: 'Workflow completed',
        };
      }

      stateManager.updateStatus(workflowId, 'in_progress');

      return {
        success: true,
        workflowId,
        currentAgent: handoff.targetAgent,
        status: 'in_progress',
        message: 'Agent responded, no immediate handoff',
      };
    } catch (error) {
      stateManager.updateStatus(workflowId, 'failed');
      return {
        success: false,
        workflowId,
        currentAgent: handoff.targetAgent,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Invoke an agent
   */
  private async invokeAgent(
    workflowId: string,
    agent: AgentName,
    prompt: string,
    context?: {
      previousAgent?: AgentName;
      previousResponse?: string;
      repo?: string;
      branch?: string;
    }
  ): Promise<{ response: string; conversationId: string }> {
    const options: InvokeAgentOptions = {
      agent,
      prompt,
      context: {
        ...context,
        workflowId,
      },
    };

    return await this.agentInterface.invoke(options);
  }

  /**
   * Build approval description from parsed response
   */
  private buildApprovalDescription(parsed: ParsedResponse): string {
    if (!parsed.forVader) return 'Approval required';

    const parts: string[] = [];

    if (parsed.forVader.actions.length > 0) {
      parts.push(`Actions: ${parsed.forVader.actions.map((a) => a.description).join('; ')}`);
    }

    if (parsed.forVader.decisions.length > 0) {
      parts.push(`Decisions: ${parsed.forVader.decisions.map((d) => d.description).join('; ')}`);
    }

    if (parsed.forVader.testing.length > 0) {
      parts.push(`Testing: ${parsed.forVader.testing.map((t) => t.description).join('; ')}`);
    }

    return parts.join('\n') || 'Approval required';
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId: string): OrchestratorResponse {
    const workflow = stateManager.getWorkflow(workflowId);
    if (!workflow) {
      return {
        success: false,
        workflowId,
        currentAgent: null,
        status: 'failed',
        error: 'Workflow not found',
      };
    }

    return {
      success: true,
      workflowId,
      currentAgent: workflow.currentAgent,
      status: workflow.status,
    };
  }

  /**
   * Get workflow state (for history endpoint)
   */
  getWorkflowState(workflowId: string): WorkflowState | null {
    return stateManager.getWorkflow(workflowId) || null;
  }
}
