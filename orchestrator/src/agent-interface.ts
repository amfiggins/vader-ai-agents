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
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Check for token limit errors
        const errorMessage = error.message.toLowerCase();
        // Check if error has a code property (OpenAI errors often have this)
        const errorWithCode = error as Error & { code?: string };
        const errorCode = errorWithCode.code;
        
        if (errorMessage.includes('maximum context length') || 
            (errorMessage.includes('token') && errorMessage.includes('limit')) ||
            errorMessage.includes('too large') ||
            errorCode === 'context_length_exceeded') {
          throw new Error(
            `Request too large: The instruction file and prompt exceed ${this.model}'s token limit. ` +
            `Consider using a model with a larger context window (e.g., gpt-4-turbo) or reducing the instruction file size. ` +
            `Original error: ${error.message}`
          );
        }
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
    const response = await fetch(url.replace('/blob/', '/raw/'));
    if (!response.ok) {
      throw new Error(`Failed to fetch instruction file: ${url}`);
    }
    let content = await response.text();
    
    // Truncate if too large for model context window
    content = this.truncateForModel(content, this.model);
    
    return content;
  }

  /**
   * Truncate content to fit within model's context window
   * Estimates tokens as ~4 characters per token, reserves space for prompt and response
   * Always preserves critical format requirements even when truncating
   */
  private truncateForModel(content: string, model: string): string {
    // Model context windows (in tokens)
    const contextWindows: Record<string, number> = {
      'gpt-4': 8192,
      'gpt-4-turbo': 128000,
      'gpt-4-turbo-preview': 128000,
      'gpt-4-32k': 32768,
      'gpt-3.5-turbo': 16385,
      'gpt-3.5-turbo-16k': 16385,
    };

    const contextWindow = contextWindows[model] || 8192; // Default to 8k if unknown
    
    // Reserve tokens for:
    // - User prompt: ~500 tokens
    // - Response (max_tokens): 4096 tokens
    // - System message overhead: ~100 tokens
    // - Safety margin: ~500 tokens
    // - Format requirements appendix: ~300 tokens
    const reservedTokens = 500 + 4096 + 100 + 500 + 300;
    const availableTokens = contextWindow - reservedTokens;
    
    // Estimate tokens: ~4 characters per token (conservative estimate)
    const estimatedTokens = Math.ceil(content.length / 4);
    
    if (estimatedTokens <= availableTokens) {
      return content; // No truncation needed
    }
    
    // Extract critical format requirements section if it exists
    const formatSectionStart = content.indexOf('## Response structure');
    let formatSection = '';
    if (formatSectionStart >= 0) {
      // Find end of format section (next ## heading or reasonable limit)
      const formatSectionEnd = content.indexOf('\n## ', formatSectionStart + 100);
      if (formatSectionEnd > 0) {
        formatSection = '\n\n' + content.substring(formatSectionStart, formatSectionEnd);
      } else {
        // Take next 1500 chars if no clear end
        formatSection = '\n\n' + content.substring(formatSectionStart, formatSectionStart + 1500);
      }
    }
    
    // Truncate to fit within available tokens (reserving space for format section)
    const maxChars = (availableTokens * 4) - formatSection.length;
    let truncated = content.substring(0, Math.max(0, maxChars));
    
    // Try to truncate at a reasonable boundary (end of paragraph or section)
    const lastNewline = truncated.lastIndexOf('\n\n');
    const lastSection = truncated.lastIndexOf('\n##');
    
    const truncateAt = Math.max(lastNewline, lastSection);
    if (truncateAt > maxChars * 0.8) {
      // Only use boundary if it's not too early
      truncated = truncated.substring(0, truncateAt);
    }
    
    // Always append format requirements if we have them and they're not already in the truncated content
    if (formatSection && !truncated.includes('## Response structure')) {
      return truncated + '\n\n[Instruction file truncated due to length...]' + formatSection;
    }
    
    return truncated + '\n\n[Instruction file truncated due to length...]';
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
