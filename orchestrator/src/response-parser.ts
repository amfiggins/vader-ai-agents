/**
 * Response Parser - Extracts structured information from agent responses
 */

import {
  ParsedResponse,
  ForVaderSection,
  ForNextAgentSection,
  ActionItem,
  DecisionItem,
  TestingItem,
  GitOperation,
  AgentName,
} from './types';
import { AgentRegistry } from './agent-registry';

export class ResponseParser {
  /**
   * Parse an agent response into structured sections
   */
  static parse(response: string): ParsedResponse {
    return {
      forVader: this.parseForVaderSection(response),
      forNextAgent: this.parseForNextAgentSection(response),
    };
  }

  /**
   * Extract and parse the "For Vader" section
   */
  private static parseForVaderSection(response: string): ForVaderSection | null {
    const forVaderMatch = response.match(
      /🔵\s*For\s+Vader[^\n]*\n([\s\S]*?)(?=🟢|$)/i
    );

    if (!forVaderMatch) {
      return null;
    }

    const section = forVaderMatch[1].trim();
    const actions: ActionItem[] = [];
    const decisions: DecisionItem[] = [];
    const testing: TestingItem[] = [];
    const gitOperations: GitOperation[] = [];
    let nextAgent: AgentName | undefined;
    let noAction = false;

    // Parse action items
    const actionMatches = section.matchAll(/✅\s*Action\s+Required:?\s*\n([\s\S]*?)(?=❓|🧪|➡️|📦|✅|$)/gi);
    for (const match of actionMatches) {
      const actionText = match[1].trim();
      const actionLines = actionText.split('\n').filter((line) => line.trim().startsWith('-'));
      actionLines.forEach((line) => {
        const description = line.replace(/^-\s*/, '').trim();
        if (description) {
          actions.push({
            type: 'action',
            description,
            blocking: true,
          });
        }
      });
    }

    // Parse decision items
    const decisionMatches = section.matchAll(/❓\s*Decision\s+Needed:?\s*\n([\s\S]*?)(?=✅|🧪|➡️|📦|$)/gi);
    for (const match of decisionMatches) {
      const decisionText = match[1].trim();
      const decisionLines = decisionText.split('\n').filter((line) => line.trim().startsWith('-'));
      decisionLines.forEach((line) => {
        const description = line.replace(/^-\s*/, '').trim();
        if (description) {
          decisions.push({
            description,
            required: true,
          });
        }
      });
    }

    // Parse testing items
    const testingMatches = section.matchAll(/🧪\s*Testing:?\s*\n([\s\S]*?)(?=✅|❓|➡️|📦|$)/gi);
    for (const match of testingMatches) {
      const testingText = match[1].trim();
      const testingLines = testingText.split('\n').filter((line) => line.trim().startsWith('-'));
      testingLines.forEach((line) => {
        const description = line.replace(/^-\s*/, '').trim();
        if (description) {
          testing.push({
            description,
          });
        }
      });
    }

    // Parse git operations
    const gitMatches = section.matchAll(/📦\s*Git:?\s*\n([\s\S]*?)(?=✅|❓|🧪|➡️|$)/gi);
    for (const match of gitMatches) {
      const gitText = match[1].trim();
      const gitLines = gitText.split('\n').filter((line) => line.trim().startsWith('-'));
      gitLines.forEach((line) => {
        const description = line.replace(/^-\s*/, '').trim();
        if (description) {
          gitOperations.push({
            type: this.inferGitOperationType(description),
            description,
          });
        }
      });
    }

    // Parse next agent
    const nextAgentMatch = section.match(/➡️\s*Next\s+Agent:?\s*(\w+)/i);
    if (nextAgentMatch) {
      const agentName = nextAgentMatch[1].toLowerCase() as AgentName;
      if (AgentRegistry.hasAgent(agentName)) {
        nextAgent = agentName;
      }
    }

    // Check for "No Action"
    noAction = /✅\s*No\s+Action/i.test(section);

    return {
      hasActions: actions.length > 0 || decisions.length > 0 || testing.length > 0,
      actions,
      decisions,
      testing,
      nextAgent,
      gitOperations: gitOperations.length > 0 ? gitOperations : undefined,
      noAction,
    };
  }

  /**
   * Extract and parse the "For Next Agent" section
   */
  private static parseForNextAgentSection(response: string): ForNextAgentSection | null {
    const forNextAgentMatch = response.match(
      /🟢\s*For\s+the\s+Next\s+Agent[^\n]*\n([\s\S]*?)(?=🔵|$)/i
    );

    if (!forNextAgentMatch) {
      return null;
    }

    const section = forNextAgentMatch[1].trim();
    
    // Extract code block if present
    const codeBlockMatch = section.match(/```(?:text|markdown)?\n([\s\S]*?)```/);
    const prompt = codeBlockMatch ? codeBlockMatch[1].trim() : section;

    // Try to identify target agent from prompt
    const agentMatches = [
      /agent\s+(\w+)/i,
      /(\w+)\s+agent/i,
      /to\s+(\w+)/i,
      /(\w+),?\s+please/i,
    ];

    let targetAgent: AgentName | null = null;
    for (const pattern of agentMatches) {
      const match = prompt.match(pattern);
      if (match) {
        const agentName = match[1].toLowerCase() as AgentName;
        if (AgentRegistry.hasAgent(agentName)) {
          targetAgent = agentName;
          break;
        }
      }
    }

    // Also check instruction file URLs
    const instructionFileMatch = prompt.match(/agent[_-]?(\w+)\.md/i);
    if (instructionFileMatch && !targetAgent) {
      const agentName = instructionFileMatch[1].toLowerCase() as AgentName;
      if (AgentRegistry.hasAgent(agentName)) {
        targetAgent = agentName;
      }
    }

    if (!targetAgent) {
      // Default to Crystal if we can't determine
      targetAgent = 'crystal';
    }

    // Extract repo and branch if mentioned
    const repoMatch = prompt.match(/(?:repo|repository)[:\s]+([^\s\n,]+)/i);
    const branchMatch = prompt.match(/(?:branch)[:\s]+([^\s\n,]+)/i);

    return {
      targetAgent,
      prompt,
      context: {
        previousAgent: undefined, // Will be set by orchestrator
        previousResponse: undefined, // Will be set by orchestrator
      },
      repo: repoMatch ? repoMatch[1] : undefined,
      branch: branchMatch ? branchMatch[1] : undefined,
    };
  }

  /**
   * Infer git operation type from description
   */
  private static inferGitOperationType(description: string): 'commit' | 'merge' | 'push' | 'branch' {
    const lower = description.toLowerCase();
    if (lower.includes('merge')) return 'merge';
    if (lower.includes('push')) return 'push';
    if (lower.includes('branch')) return 'branch';
    if (lower.includes('commit')) return 'commit';
    return 'commit'; // default
  }

  /**
   * Check if response indicates approval is needed
   */
  static requiresApproval(parsed: ParsedResponse): boolean {
    if (!parsed.forVader) return false;
    return parsed.forVader.hasActions && !parsed.forVader.noAction;
  }

  /**
   * Check if response has a handoff to another agent
   */
  static hasHandoff(parsed: ParsedResponse): boolean {
    return parsed.forNextAgent !== null;
  }
}
