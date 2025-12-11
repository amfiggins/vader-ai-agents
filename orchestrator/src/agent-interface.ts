/**
 * Agent Interface - Standardized way to invoke agents
 */

import { AgentConfig, AgentName } from './types';
import { AgentRegistry } from './agent-registry';

// Import OpenAI (optional - will throw helpful error if not installed)
let OpenAI: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const openaiModule = require('openai');
  OpenAI = openaiModule.OpenAI;
} catch (error) {
  // OpenAI not installed - will throw error when trying to use it
  OpenAI = null;
}

export interface InvokeAgentOptions {
  agent: AgentName;
  prompt: string;
  context?: {
    previousAgent?: AgentName;
    previousResponse?: string;
    workflowId?: string;
    repo?: string;
    branch?: string;
  };
  conversationId?: string;
}

export interface AgentInvocationResult {
  response: string;
  conversationId: string;
  metadata?: Record<string, unknown>;
}

export abstract class AgentInterface {
  /**
   * Invoke an agent with a prompt
   */
  abstract invoke(options: InvokeAgentOptions): Promise<AgentInvocationResult>;

  /**
   * Build the full prompt including instruction file reference
   */
  protected buildPrompt(options: InvokeAgentOptions): string {
    const agentConfig = AgentRegistry.getAgent(options.agent);
    const instructionFileRef = `Please read your agent instructions at ${agentConfig.instructionFileUrl}`;

    let prompt = `${instructionFileRef}\n\n`;

    if (options.context?.previousAgent) {
      const prevAgent = AgentRegistry.getAgent(options.context.previousAgent);
      prompt += `Previous agent: ${prevAgent.displayName}\n`;
    }

    if (options.context?.previousResponse) {
      prompt += `Previous response summary:\n${options.context.previousResponse}\n\n`;
    }

    if (options.context?.repo) {
      prompt += `Repository: ${options.context.repo}\n`;
    }

    if (options.context?.branch) {
      prompt += `Branch: ${options.context.branch}\n`;
    }

    prompt += `\n${options.prompt}`;

    return prompt;
  }
}

/**
 * LLM-based Agent Interface (using OpenAI/Anthropic API)
 */
export class LLMAgentInterface extends AgentInterface {
  private apiKey: string;
  private provider: 'openai' | 'anthropic';
  private model: string;

  constructor(config: {
    apiKey: string;
    provider: 'openai' | 'anthropic';
    model?: string;
  }) {
    super();
    this.apiKey = config.apiKey;
    this.provider = config.provider;
    this.model = config.model || (config.provider === 'openai' ? 'gpt-4' : 'claude-3-5-sonnet-20241022');
  }

  async invoke(options: InvokeAgentOptions): Promise<AgentInvocationResult> {
    const fullPrompt = this.buildPrompt(options);
    const agentConfig = AgentRegistry.getAgent(options.agent);

    // Build system prompt from instruction file
    const systemPrompt = await this.fetchInstructionFile(agentConfig.instructionFileUrl);

    if (this.provider === 'openai') {
      return this.invokeOpenAI(fullPrompt, systemPrompt, options);
    } else {
      return this.invokeAnthropic(fullPrompt, systemPrompt, options);
    }
  }

  private async invokeOpenAI(
    prompt: string,
    systemPrompt: string,
    options: InvokeAgentOptions
  ): Promise<AgentInvocationResult> {
    if (!OpenAI) {
      throw new Error('OpenAI package not installed. Run: npm install openai');
    }
    
    const openai = new OpenAI({ apiKey: this.apiKey });

    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }

      return {
        response,
        conversationId: options.conversationId || `openai-${Date.now()}`,
        metadata: {
          model: this.model,
          usage: completion.usage,
          finishReason: completion.choices[0]?.finish_reason,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  private async invokeAnthropic(
    prompt: string,
    systemPrompt: string,
    options: InvokeAgentOptions
  ): Promise<AgentInvocationResult> {
    // This would use Anthropic SDK in a real implementation
    // For now, this is a placeholder structure
    throw new Error('Anthropic implementation not yet available. Implement Anthropic SDK integration.');
  }

  private async fetchInstructionFile(url: string): Promise<string> {
    // Fetch instruction file from GitHub
    // In a real implementation, this would fetch the raw content
    const response = await fetch(url.replace('/blob/', '/raw/'));
    if (!response.ok) {
      throw new Error(`Failed to fetch instruction file: ${url}`);
    }
    return response.text();
  }
}

/**
 * Cursor API Agent Interface (if Cursor provides an API)
 */
export class CursorAgentInterface extends AgentInterface {
  private apiKey?: string;
  private baseUrl?: string;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    super();
    this.apiKey = config?.apiKey;
    this.baseUrl = config?.baseUrl || 'https://api.cursor.com';
  }

  async invoke(options: InvokeAgentOptions): Promise<AgentInvocationResult> {
    // This would use Cursor's API if available
    // For now, this is a placeholder
    throw new Error('Cursor API integration not yet available. Check Cursor documentation for API access.');
  }
}

/**
 * Mock Agent Interface for testing
 */
export class MockAgentInterface extends AgentInterface {
  private responses: Map<string, string> = new Map();

  setResponse(agent: AgentName, response: string): void {
    this.responses.set(agent, response);
  }

  async invoke(options: InvokeAgentOptions): Promise<AgentInvocationResult> {
    const response = this.responses.get(options.agent) || 
      `Mock response from ${options.agent} for: ${options.prompt.substring(0, 50)}...`;

    return {
      response,
      conversationId: options.conversationId || `mock-${Date.now()}`,
    };
  }
}
