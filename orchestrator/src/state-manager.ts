/**
 * State Manager - Tracks workflow state and history
 */

import {
  WorkflowState,
  WorkflowStatus,
  WorkflowStep,
  Approval,
  AgentName,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class StateManager {
  private workflows: Map<string, WorkflowState> = new Map();

  /**
   * Create a new workflow
   */
  createWorkflow(initialPrompt: string, startingAgent: AgentName = 'crystal'): string {
    const workflowId = uuidv4();
    const workflow: WorkflowState = {
      workflowId,
      currentAgent: startingAgent,
      status: 'pending',
      approvals: [],
      history: [],
      metadata: {
        initialPrompt,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(workflowId, workflow);
    return workflowId;
  }

  /**
   * Get workflow state
   */
  getWorkflow(workflowId: string): WorkflowState | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Update workflow status
   */
  updateStatus(workflowId: string, status: WorkflowStatus): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.status = status;
    workflow.updatedAt = new Date();
  }

  /**
   * Set current agent
   */
  setCurrentAgent(workflowId: string, agent: AgentName | null): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.currentAgent = agent;
    workflow.updatedAt = new Date();
  }

  /**
   * Add a workflow step
   */
  addStep(workflowId: string, step: Omit<WorkflowStep, 'stepId' | 'timestamp'>): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const fullStep: WorkflowStep = {
      stepId: uuidv4(),
      timestamp: new Date(),
      ...step,
    };

    workflow.history.push(fullStep);
    workflow.updatedAt = new Date();
  }

  /**
   * Request approval
   */
  requestApproval(
    workflowId: string,
    requestedBy: AgentName,
    description: string
  ): string {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const approval: Approval = {
      id: uuidv4(),
      requestedBy,
      requestedAt: new Date(),
      description,
    };

    workflow.approvals.push(approval);
    workflow.status = 'waiting_approval';
    workflow.updatedAt = new Date();

    return approval.id;
  }

  /**
   * Approve a request
   */
  approve(workflowId: string, approvalId: string, approvedBy: string, autoApproved = false): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const approval = workflow.approvals.find((a) => a.id === approvalId);
    if (!approval) {
      throw new Error(`Approval not found: ${approvalId}`);
    }

    approval.approved = true;
    approval.approvedAt = new Date();
    approval.approvedBy = approvedBy;
    approval.autoApproved = autoApproved;

    // Check if all approvals are resolved
    const allApproved = workflow.approvals.every((a) => a.approved !== undefined);
    if (allApproved && workflow.status === 'waiting_approval') {
      workflow.status = 'in_progress';
    }

    workflow.updatedAt = new Date();
  }

  /**
   * Update workflow metadata
   */
  updateMetadata(workflowId: string, metadata: Record<string, unknown>): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.metadata = { ...workflow.metadata, ...metadata };
    workflow.updatedAt = new Date();
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowState[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): WorkflowState[] {
    return Array.from(this.workflows.values()).filter(
      (w) => w.status === 'in_progress' || w.status === 'waiting_approval'
    );
  }

  /**
   * Clear completed workflows (optional cleanup)
   */
  clearCompleted(maxAgeDays = 30): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);

    for (const [id, workflow] of this.workflows.entries()) {
      if (
        workflow.status === 'completed' &&
        workflow.updatedAt < cutoff
      ) {
        this.workflows.delete(id);
      }
    }
  }
}

// Singleton instance
export const stateManager = new StateManager();
