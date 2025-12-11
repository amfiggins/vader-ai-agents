/**
 * Example: Basic usage of the orchestrator
 */

import { Orchestrator } from '../src/orchestrator';
import { MockAgentInterface } from '../src/agent-interface';
import { AgentName } from '../src/types';

async function example() {
  // Create a mock agent interface for testing
  const agentInterface = new MockAgentInterface();

  // Set up mock responses
  agentInterface.setResponse('crystal', `
🔵 For Vader (review / approvals / actions)

✅ Action Required:
- Review the architecture plan
- Approve to proceed with implementation

🟢 For the Next Agent (handoff prompt)

\`\`\`text
Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md

I need you to implement the following feature:
- Add authentication middleware
- Repository: eee-bot-admin
- Branch: feat/auth-middleware
\`\`\`
  `);

  agentInterface.setResponse('chloe', `
🔵 For Vader (review / approvals / actions)

✅ No Action: Implementation complete

🟢 For the Next Agent (handoff prompt)

\`\`\`text
Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

Implementation Summary for Crystal:
- [COMPLETE] Added authentication middleware
- All tests passing
- Ready for review
\`\`\`
  `);

  // Create orchestrator
  const orchestrator = new Orchestrator(
    {
      autoApprove: false, // Set to true for automatic approvals
    },
    agentInterface
  );

  // Start a workflow
  console.log('Starting workflow...');
  const result = await orchestrator.startWorkflow(
    'Add authentication middleware to eee-bot-admin',
    'crystal'
  );

  console.log('Workflow started:', result);

  if (result.requiresApproval && result.approvalRequest) {
    console.log('\nApproval required:', result.approvalRequest.description);
    console.log('Approving...\n');

    // Approve and continue
    const continueResult = await orchestrator.continueWorkflow(result.workflowId, true);
    console.log('Workflow continued:', continueResult);
  }

  // Check final status
  const finalStatus = orchestrator.getWorkflowStatus(result.workflowId);
  console.log('\nFinal status:', finalStatus);
}

// Run example
if (require.main === module) {
  example().catch(console.error);
}
