# Quick Start Guide

Get the orchestrator running locally in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- OpenAI API key (for real agent interactions)

## Setup

1. **Install dependencies:**
   ```bash
   cd vader-ai-agents/orchestrator
   npm install
   ```

2. **Configure your API key:**
   ```bash
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

   Your `.env` should look like:
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-your-actual-api-key-here
   LLM_MODEL=gpt-4
   PORT=3001
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

   The server will start on **port 3001** by default (or whatever you set in `PORT` env var).

   You should see:
   ```
   ✅ Using openai LLM provider (model: gpt-4)
   ```

## Using the API

### Start a Workflow

```bash
curl -X POST http://localhost:3001/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add authentication middleware to eee-bot-admin",
    "startingAgent": "crystal"
  }'
```

Response:
```json
{
  "success": true,
  "workflowId": "abc-123-def",
  "currentAgent": "crystal",
  "status": "waiting_approval",
  "requiresApproval": true,
  "approvalRequest": {
    "id": "approval-123",
    "description": "Actions: Review the architecture plan..."
  }
}
```

### Check Workflow Status

```bash
curl http://localhost:3001/workflows/{workflow-id}
```

### Approve and Continue

```bash
curl -X POST http://localhost:3001/workflows/{workflow-id}/approve \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'
```

### List All Workflows

```bash
curl http://localhost:3001/workflows
```

### List Available Agents

```bash
curl http://localhost:3001/agents
```

## Port Configuration

The server uses **port 3001** by default. To change it:

1. **Environment variable:**
   ```bash
   PORT=8080 npm run dev
   ```

2. **Or in .env file:**
   ```
   PORT=8080
   ```

## Mock Mode vs Real Mode

### Mock Mode
- No API key needed
- Uses `MockAgentInterface`
- Good for testing the orchestrator itself
- Agents return mock responses
- ⚠️ You'll see a warning if no API key is set

### Real Mode (OpenAI)
- Requires `LLM_API_KEY` in `.env`
- Uses actual GPT-4 (or your chosen model)
- Real agent interactions
- Set `LLM_PROVIDER=openai`

See `OPENAI_SETUP.md` for detailed OpenAI setup instructions.

## Example Workflow

```bash
# 1. Start workflow
RESPONSE=$(curl -s -X POST http://localhost:3001/workflows \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Add feature X", "startingAgent": "crystal"}')

WORKFLOW_ID=$(echo $RESPONSE | jq -r '.workflowId')

# 2. Check if approval needed
echo $RESPONSE | jq '.requiresApproval'

# 3. Approve if needed
curl -X POST http://localhost:3001/workflows/$WORKFLOW_ID/approve \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'

# 4. Check status
curl http://localhost:3001/workflows/$WORKFLOW_ID

# 5. View full history
curl http://localhost:3001/workflows/$WORKFLOW_ID/history
```

## Troubleshooting

**Port already in use?**
- Change `PORT` in `.env` or use `PORT=8080 npm run dev`

**Can't connect?**
- Make sure server is running: `npm run dev`
- Check the port: default is 3001
- Try `curl http://localhost:3001/health`

**OpenAI API errors?**
- Check your API key is correct in `.env`
- Verify it starts with `sk-`
- Check OpenAI dashboard for quota/usage issues
- See `OPENAI_SETUP.md` for detailed troubleshooting

**Still in MOCK mode?**
- Check that `.env` file exists in `orchestrator/` directory
- Verify `LLM_API_KEY` is set (no quotes needed)
- Restart the server after changing `.env`

**Module not found: openai?**
- Run `npm install` to install dependencies
- Make sure you're in the `orchestrator` directory

## Next Steps

- See `OPENAI_SETUP.md` for OpenAI configuration details
- See `IMPLEMENTATION.md` for advanced configuration
- See `README.md` for architecture details
- See `examples/basic-usage.ts` for programmatic usage
