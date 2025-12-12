/**
 * Jude Validator - Validates agent responses before proceeding
 */

import { AgentName, ParsedResponse, AgentResponse } from './types';
import { ResponseParser } from './response-parser';
import { violationTracker } from './violation-tracker';
import { projectManager } from './project-manager';
import { AgentRegistry } from './agent-registry';

export interface ValidationResult {
  isValid: boolean;
  violations: Violation[];
  shouldStop: boolean;
  correctionNeeded: boolean;
  correctionPrompt?: string;
}

export interface Violation {
  type: 'format' | 'boundary' | 'rule' | 'structure';
  description: string;
  ruleViolated: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class JudeValidator {
  /**
   * Validate an agent response
   */
  async validateResponse(
    agent: AgentName,
    response: AgentResponse,
    originalPrompt: string
  ): Promise<ValidationResult> {
    const parsed = response.parsedSections;
    const violations: Violation[] = [];

    // 1. Format Validation
    const formatViolations = this.validateFormat(agent, parsed, response);
    violations.push(...formatViolations);

    // 2. Boundary Validation
    const boundaryViolations = this.validateBoundaries(agent, parsed, response);
    violations.push(...boundaryViolations);

    // 3. Rule Compliance
    const ruleViolations = await this.validateRules(agent, parsed, response);
    violations.push(...ruleViolations);

    // Check if this is a repeated violation
    const isRepeated = violations.some((v) =>
      violationTracker.isRepeatedViolation(agent, v.type, v.ruleViolated)
    );

    // Record violations
    violations.forEach((v) => {
      violationTracker.recordViolation(agent, v.type, v.ruleViolated, response.rawResponse);
    });

    // Check if we should stop (3 violations in 10 minutes)
    const shouldStop = violationTracker.hasThreeViolationsInWindow(agent);

    // Determine if correction is needed
    const correctionNeeded = violations.length > 0 && !shouldStop;

    // Build correction prompt if needed
    let correctionPrompt: string | undefined;
    if (correctionNeeded) {
      correctionPrompt = this.buildCorrectionPrompt(agent, violations, originalPrompt);
    }

    return {
      isValid: violations.length === 0,
      violations,
      shouldStop,
      correctionNeeded,
      correctionPrompt,
    };
  }

  /**
   * Validate response format
   */
  private validateFormat(agent: AgentName, parsed: ParsedResponse, response: AgentResponse): Violation[] {
    const violations: Violation[] = [];

    // Must have "For Vader" section
    if (!parsed.forVader) {
      violations.push({
        type: 'format',
        description: 'Missing "For Vader" section',
        ruleViolated: 'All agents must include "For Vader" section',
        severity: 'high',
      });
    }

    // Check for handoff when there are no blocking actions
    if (parsed.forVader && parsed.forVader.hasActions && parsed.forNextAgent) {
      violations.push({
        type: 'format',
        description: 'Handoff created when actions are required',
        ruleViolated: 'Handoff should only be created when no blocking actions exist',
        severity: 'medium',
      });
    }

    // Agent-specific format requirements
    if (agent === 'chloe') {
      // Chloe must have Implementation Summary
      if (!parsed.forVader || !response.rawResponse.includes('Implementation Summary')) {
        violations.push({
          type: 'format',
          description: 'Missing "Implementation Summary for Crystal"',
          ruleViolated: 'Chloe must include Implementation Summary in every response',
          severity: 'high',
        });
      }
    }

    if (agent === 'winsley') {
      // Winsley must have Documentation Review Summary
      if (!parsed.forVader || !response.rawResponse.includes('Documentation Review Summary')) {
        violations.push({
          type: 'format',
          description: 'Missing "Documentation Review Summary"',
          ruleViolated: 'Winsley must include Documentation Review Summary',
          severity: 'high',
        });
      }
    }

    return violations;
  }

  /**
   * Validate agent boundaries
   */
  private validateBoundaries(
    agent: AgentName,
    parsed: ParsedResponse,
    response: AgentResponse
  ): Violation[] {
    const violations: Violation[] = [];
    const rawResponse = response.rawResponse;
    const agentConfig = AgentRegistry.getAgent(agent);

    // Crystal should not write code
    if (agent === 'crystal') {
      if (rawResponse.includes('I will create') || rawResponse.includes('I will add code')) {
        violations.push({
          type: 'boundary',
          description: 'Crystal attempted to write code',
          ruleViolated: 'Crystal does not write code - that is Chloe\'s responsibility',
          severity: 'high',
        });
      }
    }

    // Chloe should not push to remote
    if (agent === 'chloe') {
      if (rawResponse.includes('git push') || rawResponse.includes('push to remote')) {
        violations.push({
          type: 'boundary',
          description: 'Chloe attempted to push to remote',
          ruleViolated: 'Chloe can only commit locally - Preston handles remote operations',
          severity: 'high',
        });
      }
    }

    // Preston should not write code
    if (agent === 'preston') {
      if (rawResponse.includes('I will implement') || rawResponse.includes('I will add')) {
        violations.push({
          type: 'boundary',
          description: 'Preston attempted to write code',
          ruleViolated: 'Preston only handles git operations - Chloe writes code',
          severity: 'high',
        });
      }
    }

    return violations;
  }

  /**
   * Validate rule compliance
   */
  private async validateRules(
    agent: AgentName,
    parsed: ParsedResponse,
    response: AgentResponse
  ): Promise<Violation[]> {
    const violations: Violation[] = [];
    const rawResponse = response.rawResponse;

    // Check for instruction file reference in handoffs
    if (parsed.forNextAgent) {
      if (!parsed.forNextAgent.prompt.includes('instruction') && 
          !parsed.forNextAgent.prompt.includes('agent_')) {
        violations.push({
          type: 'rule',
          description: 'Handoff missing instruction file reference',
          ruleViolated: 'All handoffs must reference the next agent\'s instruction file',
          severity: 'medium',
        });
      }
    }

    // Add more rule checks as needed based on instruction files

    return violations;
  }

  /**
   * Build correction prompt for agent
   */
  private buildCorrectionPrompt(
    agent: AgentName,
    violations: Violation[],
    originalPrompt: string
  ): string {
    const agentConfig = AgentRegistry.getAgent(agent);
    const instructionFileRef = `Please read your agent instructions at ${agentConfig.instructionFileUrl}`;

    let prompt = `${instructionFileRef}\n\n`;
    prompt += `Your previous response had the following issue(s):\n\n`;

    violations.forEach((v, i) => {
      prompt += `${i + 1}. **${v.type.toUpperCase()} Violation:** ${v.description}\n`;
      prompt += `   Rule violated: ${v.ruleViolated}\n\n`;
    });

    prompt += `Please redo your response following your instruction file rules.\n\n`;
    prompt += `Original request context:\n${originalPrompt}`;

    return prompt;
  }
}

// Singleton instance
export const judeValidator = new JudeValidator();
