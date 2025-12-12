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
  ParsedResponse,
} from './types';
import { AgentRegistry } from './agent-registry';
import { ResponseParser } from './response-parser';
import { stateManager } from './state-manager';
import { AgentInterface, InvokeAgentOptions } from './agent-interface';
import { projectManager } from './project-manager';
import { judeValidator } from './jude-validator';
import { violationTracker } from './violation-tracker';

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
    startingAgent: AgentName = 'crystal',
    projectId?: string
  ): Promise<OrchestratorResponse> {
    const workflowId = stateManager.createWorkflow(initialPrompt, startingAgent);
    
    // Link to project if provided
    if (projectId) {
      stateManager.updateMetadata(workflowId, { projectId });
    }

    try {
      // Invoke the starting agent
      const result = await this.invokeAgent(workflowId, startingAgent, initialPrompt);

      // Parse the response
      const parsed = ResponseParser.parse(result.response);

      const agentResponse = {
        agent: startingAgent,
        timestamp: new Date(),
        rawResponse: result.response,
        parsedSections: parsed,
        conversationId: result.conversationId,
      };

      // Jude validates the response
      const validation = await judeValidator.validateResponse(
        startingAgent,
        agentResponse,
        initialPrompt
      );

      // If validation failed and should stop, create task for Vader
      if (validation.shouldStop) {
        if (projectId) {
          projectManager.createUserActionItem({
            projectId,
            workflowId,
            type: 'task',
            title: `URGENT: ${startingAgent} has 3 violations - Workflow Stopped`,
            description: `Agent ${startingAgent} has violated rules 3 times in 10 minutes. Workflow stopped. Review violations and decide next steps.`,
            priority: 'critical',
            status: 'pending',
            notes: JSON.stringify(validation.violations, null, 2),
            metadata: { violations: validation.violations },
            createdBy: 'jude',
          });
        }

        stateManager.updateStatus(workflowId, 'blocked');
        return {
          success: false,
          workflowId,
          currentAgent: startingAgent,
          status: 'blocked',
          error: 'Workflow stopped due to repeated violations. Vader intervention required.',
        };
      }

      // If correction needed, send back to agent
      if (validation.correctionNeeded) {
        const isRepeated = validation.violations.some((v) =>
          violationTracker.isRepeatedViolation(startingAgent, v.type, v.ruleViolated)
        );

        // If repeated violation, create task for Vader
        if (isRepeated && projectId) {
          projectManager.createUserActionItem({
            projectId,
            workflowId,
            type: 'task',
            title: `Repeated Violation: ${startingAgent}`,
            description: `Agent ${startingAgent} has repeated a violation. Consider updating agent rules.`,
            priority: 'high',
            status: 'pending',
            notes: JSON.stringify(validation.violations, null, 2),
            metadata: { violations: validation.violations },
            createdBy: 'jude',
          });
        }

        // Get correction from Jude
        const judeResult = await this.invokeAgent(
          workflowId,
          'jude',
          validation.correctionPrompt || 'Please correct the response',
          {
            previousAgent: startingAgent,
            previousResponse: result.response,
          }
        );

        // Parse Jude's response
        const judeParsed = ResponseParser.parse(judeResult.response);

        // Update workflow state with both responses
        stateManager.addStep(workflowId, {
          agent: startingAgent,
          input: initialPrompt,
          output: agentResponse,
          duration: Date.now(),
        });

        stateManager.addStep(workflowId, {
          agent: 'jude',
          input: validation.correctionPrompt || '',
          output: {
            agent: 'jude',
            timestamp: new Date(),
            rawResponse: judeResult.response,
            parsedSections: judeParsed,
            conversationId: judeResult.conversationId,
          },
        });

        // If Jude's response has a handoff back to the original agent, handle it
        if (judeParsed.forNextAgent && judeParsed.forNextAgent.targetAgent === startingAgent) {
          // Agent will redo their response
          const correctedResult = await this.invokeAgent(
            workflowId,
            startingAgent,
            judeParsed.forNextAgent.prompt,
            {
              previousAgent: 'jude',
              previousResponse: judeResult.response,
            }
          );

          // Re-validate the corrected response
          const correctedParsed = ResponseParser.parse(correctedResult.response);
          const correctedResponse = {
            agent: startingAgent,
            timestamp: new Date(),
            rawResponse: correctedResult.response,
            parsedSections: correctedParsed,
            conversationId: correctedResult.conversationId,
          };

          const reValidation = await judeValidator.validateResponse(
            startingAgent,
            correctedResponse,
            judeParsed.forNextAgent.prompt
          );

          if (!reValidation.isValid && reValidation.shouldStop) {
            // Still failing after correction - stop
            stateManager.updateStatus(workflowId, 'blocked');
            return {
              success: false,
              workflowId,
              currentAgent: startingAgent,
              status: 'blocked',
              error: 'Agent failed to correct violations. Workflow stopped.',
            };
          }

          // Use corrected response
          agentResponse.rawResponse = correctedResult.response;
          agentResponse.parsedSections = correctedParsed;
        } else {
          // Jude approved or provided different guidance
          // Continue with original response (Jude may have just noted the violation)
        }
      }

      // Update workflow state
      stateManager.addStep(workflowId, {
        agent: startingAgent,
        input: initialPrompt,
        output: agentResponse,
        duration: Date.now(),
      });

      // Check if approval is needed
      if (ResponseParser.requiresApproval(parsed)) {
        const approvalId = stateManager.requestApproval(
          workflowId,
          startingAgent,
          this.buildApprovalDescription(parsed)
        );

        const approval = stateManager.getWorkflow(workflowId)?.approvals.find(
          (a) => a.id === approvalId
        );

        // Create user action item for approval if project is linked
        if (projectId && approval) {
          projectManager.createUserActionItem({
            projectId,
            workflowId,
            type: 'approval',
            title: `Approval Required: ${startingAgent} workflow`,
            description: approval.description,
            priority: parsed.forVader?.actions.some(a => a.priority === 'high') ? 'high' : 'medium',
            status: 'pending',
            notes: `Workflow: ${workflowId}\nAgent: ${startingAgent}`,
            metadata: { approvalId: approval.id },
            createdBy: startingAgent,
          });
        }

        return {
          success: true,
          workflowId,
          currentAgent: startingAgent,
          status: 'waiting_approval',
          requiresApproval: true,
          approvalRequest: approval,
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
        repo: handoff.context?.repo,
        branch: handoff.context?.branch,
      });

      // Parse the response
      const parsed = ResponseParser.parse(result.response);

      const agentResponse = {
        agent: handoff.targetAgent,
        timestamp: new Date(),
        rawResponse: result.response,
        parsedSections: parsed,
        conversationId: result.conversationId,
      };

      // Jude validates the response before proceeding
      const validation = await judeValidator.validateResponse(
        handoff.targetAgent,
        agentResponse,
        handoff.prompt
      );

      // If validation failed and should stop, create task for Vader
      if (validation.shouldStop) {
        const workflow = stateManager.getWorkflow(workflowId);
        const projectId = workflow?.metadata?.projectId as string | undefined;

        if (projectId) {
          projectManager.createUserActionItem({
            projectId,
            workflowId,
            type: 'task',
            title: `URGENT: ${handoff.targetAgent} has 3 violations - Workflow Stopped`,
            description: `Agent ${handoff.targetAgent} has violated rules 3 times in 10 minutes. Workflow stopped. Review violations and decide next steps.`,
            priority: 'critical',
            status: 'pending',
            notes: JSON.stringify(validation.violations, null, 2),
            metadata: { violations: validation.violations },
            createdBy: 'jude',
          });
        }

        stateManager.updateStatus(workflowId, 'blocked');
        return {
          success: false,
          workflowId,
          currentAgent: handoff.targetAgent,
          status: 'blocked',
          error: 'Workflow stopped due to repeated violations. Vader intervention required.',
        };
      }

      // If correction needed, send back to agent via Jude
      if (validation.correctionNeeded) {
        const workflow = stateManager.getWorkflow(workflowId);
        const projectId = workflow?.metadata?.projectId as string | undefined;

        // If repeated violation, create task for Vader
        const isRepeated = validation.violations.some((v) =>
          violationTracker.isRepeatedViolation(handoff.targetAgent, v.type, v.ruleViolated)
        );

        if (isRepeated && projectId) {
          projectManager.createUserActionItem({
            projectId,
            workflowId,
            type: 'task',
            title: `Repeated Violation: ${handoff.targetAgent}`,
            description: `Agent ${handoff.targetAgent} has repeated a violation. Consider updating agent rules.`,
            priority: 'high',
            status: 'pending',
            notes: JSON.stringify(validation.violations, null, 2),
            metadata: { violations: validation.violations },
            createdBy: 'jude',
          });
        }

        // Get correction from Jude
        const judeResult = await this.invokeAgent(
          workflowId,
          'jude',
          validation.correctionPrompt || 'Please correct the response',
          {
            previousAgent: handoff.targetAgent,
            previousResponse: result.response,
          }
        );

        // Parse Jude's response
        const judeParsed = ResponseParser.parse(judeResult.response);

        // Add both responses to history
        stateManager.addStep(workflowId, {
          agent: handoff.targetAgent,
          input: handoff.prompt,
          output: agentResponse,
        });

        stateManager.addStep(workflowId, {
          agent: 'jude',
          input: validation.correctionPrompt || '',
          output: {
            agent: 'jude',
            timestamp: new Date(),
            rawResponse: judeResult.response,
            parsedSections: judeParsed,
            conversationId: judeResult.conversationId,
          },
        });

        // If Jude's response has a handoff back to the original agent, handle it
        if (judeParsed.forNextAgent && judeParsed.forNextAgent.targetAgent === handoff.targetAgent) {
          // Agent will redo their response
          const correctedResult = await this.invokeAgent(
            workflowId,
            handoff.targetAgent,
            judeParsed.forNextAgent.prompt,
            {
              previousAgent: 'jude',
              previousResponse: judeResult.response,
            }
          );

          // Re-validate the corrected response
          const correctedParsed = ResponseParser.parse(correctedResult.response);
          const correctedResponse = {
            agent: handoff.targetAgent,
            timestamp: new Date(),
            rawResponse: correctedResult.response,
            parsedSections: correctedParsed,
            conversationId: correctedResult.conversationId,
          };

          const reValidation = await judeValidator.validateResponse(
            handoff.targetAgent,
            correctedResponse,
            judeParsed.forNextAgent.prompt
          );

          if (!reValidation.isValid && reValidation.shouldStop) {
            // Still failing after correction - stop
            stateManager.updateStatus(workflowId, 'blocked');
            return {
              success: false,
              workflowId,
              currentAgent: handoff.targetAgent,
              status: 'blocked',
              error: 'Agent failed to correct violations. Workflow stopped.',
            };
          }

          // Use corrected response
          agentResponse.rawResponse = correctedResult.response;
          agentResponse.parsedSections = correctedParsed;
        }
      }

      // Add step to history
      stateManager.addStep(workflowId, {
        agent: handoff.targetAgent,
        input: handoff.prompt,
        output: agentResponse,
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
      },
      conversationId: `workflow-${workflowId}-${Date.now()}`,
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
      parts.push(`Actions: ${parsed.forVader.actions.map((a: { description: string }) => a.description).join('; ')}`);
    }

    if (parsed.forVader.decisions.length > 0) {
      parts.push(`Decisions: ${parsed.forVader.decisions.map((d: { description: string }) => d.description).join('; ')}`);
    }

    if (parsed.forVader.testing.length > 0) {
      parts.push(`Testing: ${parsed.forVader.testing.map((t: { description: string }) => t.description).join('; ')}`);
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
