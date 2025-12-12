/**
 * Type definitions for the Agent Orchestration Service
 */

export type AgentName = 'crystal' | 'chloe' | 'preston' | 'winsley' | 'jude';

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
  projectId?: string; // Link to project
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
  projectId?: string; // Link to project
  taskId?: string; // Link to task
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

// ===== PROJECT MANAGEMENT TYPES =====

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  directories: ProjectDirectory[];
  githubRepos: GitHubRepo[];
  tasks: ProjectTask[];
  milestones: Milestone[];
  notes: ProjectNote[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export type ProjectStatus = 
  | 'planning' 
  | 'active' 
  | 'on_hold' 
  | 'completed' 
  | 'archived';

export interface ProjectDirectory {
  id: string;
  path: string;
  type: 'local' | 'github';
  branch?: string;
  description?: string;
  isActive: boolean;
}

export interface GitHubRepo {
  id: string;
  owner: string;
  repo: string;
  url: string;
  defaultBranch: string;
  description?: string;
  isActive: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent?: AgentName;
  assignedTo?: 'user' | AgentName;
  dependencies: string[]; // Task IDs this depends on
  estimatedEffort?: string;
  actualEffort?: string;
  dueDate?: Date;
  completedAt?: Date;
  notes: TaskNote[];
  workflowId?: string; // Link to workflow if automated
  createdAt: Date;
  updatedAt: Date;
  createdBy?: AgentName | 'user';
}

export type TaskStatus = 
  | 'todo' 
  | 'in_progress' 
  | 'blocked' 
  | 'review' 
  | 'testing' 
  | 'completed' 
  | 'cancelled';

export interface TaskNote {
  id: string;
  content: string;
  author: AgentName | 'user';
  timestamp: Date;
  type: 'note' | 'update' | 'blocker' | 'resolution';
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  tasks: string[]; // Task IDs
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  author: AgentName | 'user';
  timestamp: Date;
  tags: string[];
}

export interface UserActionItem {
  id: string;
  projectId: string;
  taskId?: string;
  workflowId?: string;
  type: 'approval' | 'task' | 'decision' | 'review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
  notes: string;
  userNotes?: string; // User's notes when completing
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: AgentName;
}

export interface ProjectProgress {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  completionPercentage: number;
  activeWorkflows: number;
  pendingApprovals: number;
  userActionItems: number;
  lastActivity: Date;
}
