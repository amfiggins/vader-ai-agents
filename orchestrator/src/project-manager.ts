/**
 * Project Manager - Manages projects, tasks, and user action items
 */

import {
  Project,
  ProjectStatus,
  ProjectTask,
  TaskStatus,
  Milestone,
  ProjectNote,
  UserActionItem,
  ProjectProgress,
  ProjectDirectory,
  GitHubRepo,
  AgentName,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private userActionItems: Map<string, UserActionItem> = new Map();

  /**
   * Create a new project
   */
  createProject(data: {
    name: string;
    description: string;
    directories?: ProjectDirectory[];
    githubRepos?: GitHubRepo[];
    createdBy?: string;
  }): Project {
    const project: Project = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      status: 'planning',
      directories: data.directories || [],
      githubRepos: data.githubRepos || [],
      tasks: [],
      milestones: [],
      notes: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy,
    };

    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Get a project
   */
  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Get active projects
   */
  getActiveProjects(): Project[] {
    return Array.from(this.projects.values()).filter(
      (p) => p.status === 'active' || p.status === 'planning'
    );
  }

  /**
   * Update project
   */
  updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(projectId, updated);
    return updated;
  }

  /**
   * Add directory to project
   */
  addDirectory(projectId: string, directory: Omit<ProjectDirectory, 'id'>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const newDir: ProjectDirectory = {
      id: uuidv4(),
      ...directory,
    };

    project.directories.push(newDir);
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Add GitHub repo to project
   */
  addGitHubRepo(projectId: string, repo: Omit<GitHubRepo, 'id'>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const newRepo: GitHubRepo = {
      id: uuidv4(),
      ...repo,
    };

    project.githubRepos.push(newRepo);
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Add task to project
   */
  addTask(projectId: string, task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const newTask: ProjectTask = {
      id: uuidv4(),
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    project.tasks.push(newTask);
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Update task
   */
  updateTask(projectId: string, taskId: string, updates: Partial<ProjectTask>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    Object.assign(task, updates, { updatedAt: new Date() });
    
    // If task completed, set completedAt
    if (updates.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    }

    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Add milestone to project
   */
  addMilestone(projectId: string, milestone: Omit<Milestone, 'id'>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const newMilestone: Milestone = {
      id: uuidv4(),
      ...milestone,
    };

    project.milestones.push(newMilestone);
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Add note to project
   */
  addNote(projectId: string, note: Omit<ProjectNote, 'id' | 'timestamp'>): Project | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const newNote: ProjectNote = {
      id: uuidv4(),
      ...note,
      timestamp: new Date(),
    };

    project.notes.push(newNote);
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return project;
  }

  /**
   * Create user action item
   */
  createUserActionItem(item: Omit<UserActionItem, 'id' | 'createdAt' | 'updatedAt'>): UserActionItem {
    const actionItem: UserActionItem = {
      id: uuidv4(),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.userActionItems.set(actionItem.id, actionItem);
    return actionItem;
  }

  /**
   * Get user action items
   */
  getUserActionItems(filters?: {
    projectId?: string;
    status?: UserActionItem['status'];
    type?: UserActionItem['type'];
  }): UserActionItem[] {
    let items = Array.from(this.userActionItems.values());

    if (filters?.projectId) {
      items = items.filter((i) => i.projectId === filters.projectId);
    }

    if (filters?.status) {
      items = items.filter((i) => i.status === filters.status);
    }

    if (filters?.type) {
      items = items.filter((i) => i.type === filters.type);
    }

    return items.sort((a, b) => {
      // Sort by priority and creation date
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Complete user action item
   */
  completeUserActionItem(
    itemId: string,
    userNotes?: string,
    shouldTriggerWorkflow: boolean = true
  ): UserActionItem | null {
    const item = this.userActionItems.get(itemId);
    if (!item) return null;

    item.status = 'completed';
    item.completedAt = new Date();
    item.userNotes = userNotes;
    item.updatedAt = new Date();

    this.userActionItems.set(itemId, item);

    // If linked to a workflow, we can trigger continuation here
    if (shouldTriggerWorkflow && item.workflowId) {
      // This would be handled by the orchestrator
      // For now, we just mark it complete
    }

    return item;
  }

  /**
   * Get project progress
   */
  getProjectProgress(projectId: string): ProjectProgress | null {
    const project = this.projects.get(projectId);
    if (!project) return null;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = project.tasks.filter((t) => t.status === 'in_progress').length;
    const blockedTasks = project.tasks.filter((t) => t.status === 'blocked').length;

    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const pendingApprovals = this.getUserActionItems({
      projectId,
      status: 'pending',
      type: 'approval',
    }).length;

    const userActionItems = this.getUserActionItems({
      projectId,
      status: 'pending',
    }).length;

    // Get last activity from tasks or notes
    const lastActivity = new Date(
      Math.max(
        ...project.tasks.map((t) => t.updatedAt.getTime()),
        ...project.notes.map((n) => n.timestamp.getTime()),
        project.updatedAt.getTime()
      )
    );

    return {
      projectId,
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      activeWorkflows: 0, // Would be calculated from orchestrator
      pendingApprovals,
      userActionItems,
      lastActivity,
    };
  }

  /**
   * Delete project
   */
  deleteProject(projectId: string): boolean {
    return this.projects.delete(projectId);
  }
}

// Singleton instance
export const projectManager = new ProjectManager();
