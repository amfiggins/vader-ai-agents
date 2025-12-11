/**
 * Type definitions for the Agent Orchestration Service
 */

export type AgentName = 'crystal' | 'chloe' | 'preston' | 'winsley';

export interface AgentConfig {
  name: AgentName;
  displayName: string;
  instructionFileUrl: string;
  role: string;
  capabilities: string[];
}

export interface AgentResponse {
  agent: AgentName;
  timestamp: Date;
  rawResponse: string;
  parsedSections: ParsedResponse;
  conversationId: string;
}

export interface ParsedResponse {
  forVader: ForVaderSection | null;
  forNextAgent: ForNextAgentSection | null;
}

export interface ForVaderSection {
  hasActions: boolean;
  actions: ActionItem[];
  decisions: DecisionItem[];
  testing: TestingItem[];
  nextAgent?: AgentName;
  gitOperations?: GitOperation[];
  noAction: boolean;
}

export interface ActionItem {
  type: 'action' | 'decision' | 'testing' | 'git';
  description: string;
  priority?: 'high' | 'medium' | 'low';
  blocking?: boolean;
}

export interface DecisionItem {
  description: string;
  options?: string[];
  required: boolean;
}

export interface TestingItem {
  description: string;
  commands?: string[];
  endpoints?: string[];
}

export interface GitOperation {
  type: 'commit' | 'merge' | 'push' | 'branch';
  description: string;
}

export interface ForNextAgentSection {
  targetAgent: AgentName;
  prompt: string;
  context: AgentContext;
  repo?: string;
  branch?: string;
}

export interface AgentContext {
  previousAgent?: AgentName;
  previousResponse?: string;
  currentState?: string;
  openQuestions?: string[];
}

export interface WorkflowState {
  workflowId: string;
  currentAgent: AgentName | null;
  status: WorkflowStatus;
  approvals: Approval[];
  history: WorkflowStep[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'waiting_approval' 
  | 'blocked' 
  | 'completed' 
  | 'failed';

export interface Approval {
  id: string;
  requestedBy: AgentName;
  requestedAt: Date;
  description: string;
  approved?: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  autoApproved?: boolean;
}

export interface WorkflowStep {
  stepId: string;
  agent: AgentName;
  timestamp: Date;
  input: string;
  output: AgentResponse;
  duration?: number;
}

export interface OrchestratorConfig {
  autoApprove?: boolean;
  autoApprovePatterns?: string[];
  maxRetries?: number;
  timeout?: number;
  llmProvider?: 'openai' | 'anthropic' | 'cursor';
  apiKey?: string;
}

export interface HandoffRequest {
  fromAgent: AgentName;
  toAgent: AgentName;
  prompt: string;
  context: AgentContext;
  workflowId: string;
}

export interface OrchestratorResponse {
  success: boolean;
  workflowId: string;
  currentAgent: AgentName | null;
  status: WorkflowStatus;
  message?: string;
  error?: string;
  requiresApproval?: boolean;
  approvalRequest?: Approval;
}
