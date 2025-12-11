# Implementation Guide

This document explains how to complete the implementation of the Agent Orchestration Service.

## Current Status

✅ **Completed:**
- Core architecture and design
- Type definitions
- Agent registry
- Response parser
- State manager
- Orchestrator engine
- Basic structure

⏳ **Needs Implementation:**
- LLM API integration (OpenAI/Anthropic)
- Cursor API integration (if available)
- API server (Express/Fastify)
- Error handling and retries
- Testing
- Persistence layer (optional)

## Step 1: Choose LLM Provider

You have three options:

### Option A: Anthropic (Claude)
```typescript
// Install: npm install @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk';

// In agent-interface.ts, implement invokeAnthropic:
private async invokeAnthropic(
  prompt: string,
  systemPrompt: string,
  options: InvokeAgentOptions
): Promise<AgentInvocationResult> {
  const anthropic = new Anthropic({ apiKey: this.apiKey });
  
  const message = await anthropic.messages.create({
    model: this.model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  const response = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('\n');

  return {
    response,
    conversationId: options.conversationId || `conv-${Date.now()}`,
  };
}
```

### Option B: OpenAI
```typescript
// Install: npm install openai
import OpenAI from 'openai';

// In agent-interface.ts, implement invokeOpenAI:
private async invokeOpenAI(
  prompt: string,
  systemPrompt: string,
  options: InvokeAgentOptions
): Promise<AgentInvocationResult> {
  const openai = new OpenAI({ apiKey: this.apiKey });
  
  const completion = await openai.chat.completions.create({
    model: this.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4096,
  });

  const response = completion.choices[0]?.message?.content || '';

  return {
    response,
    conversationId: options.conversationId || `conv-${Date.now()}`,
  };
}
```

### Option C: Cursor API (if available)
Check Cursor's documentation for API access. If available, implement `CursorAgentInterface.invoke()`.

## Step 2: Implement API Server

### Install Express
```bash
npm install express
npm install --save-dev @types/express
```

### Create server.ts
```typescript
import express from 'express';
import { Orchestrator } from './orchestrator';
import { APIServer } from './api-server';

const app = express();
app.use(express.json());

// Initialize orchestrator with your chosen agent interface
const orchestrator = new Orchestrator(
  { autoApprove: false },
  yourAgentInterface // LLMAgentInterface or CursorAgentInterface
);

// Routes
app.post('/workflows', async (req, res) => {
  try {
    const { prompt, startingAgent } = req.body;
    const result = await orchestrator.startWorkflow(
      prompt,
      startingAgent || 'crystal'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/workflows/:id', (req, res) => {
  const result = orchestrator.getWorkflowStatus(req.params.id);
  res.json(result);
});

app.post('/workflows/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const result = await orchestrator.continueWorkflow(
      req.params.id,
      approved !== false
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Orchestrator API running on port 3000');
});
```

## Step 3: Add Error Handling

Enhance the orchestrator with retry logic and better error handling:

```typescript
// In orchestrator.ts
private async invokeAgentWithRetry(
  workflowId: string,
  agent: AgentName,
  prompt: string,
  context?: any,
  retries = this.config.maxRetries || 3
): Promise<{ response: string; conversationId: string }> {
  for (let i = 0; i < retries; i++) {
    try {
      return await this.invokeAgent(workflowId, agent, prompt, context);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Step 4: Add Persistence (Optional)

For production, you'll want to persist workflow state:

```typescript
// Install: npm install sqlite3 or use your preferred database
import Database from 'better-sqlite3';

export class PersistentStateManager extends StateManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    super();
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        workflow_id TEXT PRIMARY KEY,
        current_agent TEXT,
        status TEXT,
        metadata TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      -- Add more tables for steps, approvals, etc.
    `);
  }

  // Override methods to persist to database
  createWorkflow(...) { /* save to DB */ }
  getWorkflow(...) { /* load from DB */ }
  // etc.
}
```

## Step 5: Testing

Create test files:

```typescript
// orchestrator.test.ts
import { Orchestrator } from './orchestrator';
import { MockAgentInterface } from './agent-interface';

describe('Orchestrator', () => {
  it('should start a workflow', async () => {
    const agentInterface = new MockAgentInterface();
    const orchestrator = new Orchestrator({}, agentInterface);
    
    const result = await orchestrator.startWorkflow('Test prompt');
    
    expect(result.success).toBe(true);
    expect(result.workflowId).toBeDefined();
  });
});
```

## Step 6: Environment Configuration

Create `.env` file:
```
LLM_PROVIDER=anthropic
LLM_API_KEY=your-api-key
LLM_MODEL=claude-3-5-sonnet-20241022
AUTO_APPROVE=false
PORT=3000
```

## Usage Example

Once implemented, you can use it like this:

```typescript
import { Orchestrator } from './orchestrator';
import { LLMAgentInterface } from './agent-interface';

// Initialize
const agentInterface = new LLMAgentInterface({
  apiKey: process.env.LLM_API_KEY!,
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
});

const orchestrator = new Orchestrator(
  { autoApprove: false },
  agentInterface
);

// Start workflow
const result = await orchestrator.startWorkflow(
  'Add authentication middleware to eee-bot-admin'
);

// Check if approval needed
if (result.requiresApproval) {
  // Show approval request to user
  // Then continue:
  await orchestrator.continueWorkflow(result.workflowId, true);
}
```

## Next Steps

1. Choose your LLM provider and implement the interface
2. Set up the API server
3. Add error handling and retries
4. Test with real agent workflows
5. Add persistence if needed
6. Deploy and integrate with your workflow

## Questions?

- Check the README.md for architecture overview
- Review the type definitions in types.ts
- Look at examples/basic-usage.ts for usage patterns
