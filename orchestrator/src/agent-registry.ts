/**
 * Agent Registry - Maintains configuration for all agents
 */

import { AgentConfig, AgentName } from './types';

const AGENT_CONFIGS: Record<AgentName, AgentConfig> = {
  crystal: {
    name: 'crystal',
    displayName: 'Crystal',
    instructionFileUrl: 'https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md',
    role: 'Architect',
    capabilities: ['architecture', 'diagnostics', 'planning', 'coordination'],
  },
  chloe: {
    name: 'chloe',
    displayName: 'Chloe',
    instructionFileUrl: 'https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md',
    role: 'Implementation Engineer',
    capabilities: ['implementation', 'testing', 'aws', 'api'],
  },
  preston: {
    name: 'preston',
    displayName: 'Preston',
    instructionFileUrl: 'https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md',
    role: 'Git Manager',
    capabilities: ['git', 'branching', 'merging', 'commits'],
  },
  winsley: {
    name: 'winsley',
    displayName: 'Winsley',
    instructionFileUrl: 'https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_winsley.md',
    role: 'Documentation Manager',
    capabilities: ['documentation', 'review', 'organization', 'consolidation'],
  },
};

export class AgentRegistry {
  /**
   * Get configuration for a specific agent
   */
  static getAgent(agentName: AgentName): AgentConfig {
    const config = AGENT_CONFIGS[agentName];
    if (!config) {
      throw new Error(`Unknown agent: ${agentName}`);
    }
    return config;
  }

  /**
   * Get all registered agents
   */
  static getAllAgents(): AgentConfig[] {
    return Object.values(AGENT_CONFIGS);
  }

  /**
   * Check if an agent exists
   */
  static hasAgent(agentName: string): agentName is AgentName {
    return agentName in AGENT_CONFIGS;
  }

  /**
   * Get agent by role or capability
   */
  static findAgentsByCapability(capability: string): AgentConfig[] {
    return Object.values(AGENT_CONFIGS).filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Get the default starting agent (Crystal)
   */
  static getDefaultAgent(): AgentConfig {
    return AGENT_CONFIGS.crystal;
  }
}
