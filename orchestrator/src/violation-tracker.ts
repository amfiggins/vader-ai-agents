/**
 * Violation Tracker - Tracks agent violations for Jude
 */

import { AgentName } from './types';

export interface Violation {
  id: string;
  agent: AgentName;
  violationType: string;
  ruleViolated: string;
  timestamp: Date;
  responseContext: string;
  corrected: boolean;
  correctionResponse?: string;
}

export class ViolationTracker {
  private violations: Map<string, Violation[]> = new Map(); // agent -> violations
  private violationWindow = 10 * 60 * 1000; // 10 minutes in milliseconds

  /**
   * Record a violation
   */
  recordViolation(
    agent: AgentName,
    violationType: string,
    ruleViolated: string,
    responseContext: string
  ): string {
    const violation: Violation = {
      id: require('uuid').v4(),
      agent,
      violationType,
      ruleViolated,
      timestamp: new Date(),
      responseContext,
      corrected: false,
    };

    if (!this.violations.has(agent)) {
      this.violations.set(agent, []);
    }

    this.violations.get(agent)!.push(violation);
    return violation.id;
  }

  /**
   * Mark violation as corrected
   */
  markCorrected(violationId: string, correctionResponse?: string): void {
    for (const violations of this.violations.values()) {
      const violation = violations.find((v) => v.id === violationId);
      if (violation) {
        violation.corrected = true;
        if (correctionResponse) {
          violation.correctionResponse = correctionResponse;
        }
      }
    }
  }

  /**
   * Get violations for an agent in the time window
   */
  getRecentViolations(agent: AgentName, windowMs?: number): Violation[] {
    const window = windowMs || this.violationWindow;
    const now = new Date();
    const cutoff = new Date(now.getTime() - window);

    const agentViolations = this.violations.get(agent) || [];
    return agentViolations.filter((v) => v.timestamp >= cutoff);
  }

  /**
   * Check if agent has three violations in 10 minutes
   */
  hasThreeViolationsInWindow(agent: AgentName): boolean {
    const recent = this.getRecentViolations(agent);
    return recent.length >= 3;
  }

  /**
   * Check if this is a repeated violation (same type, same rule)
   */
  isRepeatedViolation(
    agent: AgentName,
    violationType: string,
    ruleViolated: string
  ): boolean {
    const recent = this.getRecentViolations(agent);
    return recent.some(
      (v) =>
        v.violationType === violationType && v.ruleViolated === ruleViolated
    );
  }

  /**
   * Get violation count for agent in window
   */
  getViolationCount(agent: AgentName): number {
    return this.getRecentViolations(agent).length;
  }

  /**
   * Clear old violations (outside window)
   */
  clearOldViolations(): void {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.violationWindow);

    for (const [agent, violations] of this.violations.entries()) {
      const recent = violations.filter((v) => v.timestamp >= cutoff);
      this.violations.set(agent, recent);
    }
  }
}

// Singleton instance
export const violationTracker = new ViolationTracker();
