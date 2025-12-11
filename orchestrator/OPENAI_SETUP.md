# OpenAI Setup Guide

This guide will help you set up OpenAI (ChatGPT) integration for the orchestrator.

## Prerequisites

- OpenAI Business account (which you have ✅)
- OpenAI API key

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in with your business account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (it starts with `sk-`)
   - ⚠️ **Important**: Save it immediately - you won't be able to see it again!

## Step 2: Configure the Orchestrator

1. **Create a `.env` file** in the `orchestrator` directory:
   ```bash
   cd vader-ai-agents/orchestrator
   cp env.example .env
   ```

2. **Edit the `.env` file** and add your API key:
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-your-actual-api-key-here
   LLM_MODEL=gpt-4
   ```

   **Model Options:**
   - `gpt-4` - Most capable, best for complex tasks (recommended)
   - `gpt-4-turbo` - Faster, still very capable
   - `gpt-3.5-turbo` - Faster and cheaper, good for simpler tasks

3. **Save the file**

## Step 3: Install Dependencies

```bash
npm install
```

This will install the `openai` package along with other dependencies.

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Using openai LLM provider (model: gpt-4)
```

If you see a warning about MOCK mode, check that:
- Your `.env` file exists
- `LLM_API_KEY` is set correctly
- The API key starts with `sk-`

## Step 5: Test It

Start a workflow:

```bash
curl -X POST http://localhost:3001/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add authentication middleware to eee-bot-admin",
    "startingAgent": "crystal"
  }'
```

You should get a real response from Crystal (via GPT-4)!

## Troubleshooting

### "OpenAI API error: Invalid API key"
- Check that your API key is correct
- Make sure it starts with `sk-`
- Verify the key hasn't expired or been revoked

### "OpenAI API error: Insufficient quota"
- Check your OpenAI account billing/usage
- You may need to add payment method or increase limits

### "Module not found: openai"
- Run `npm install` to install dependencies
- Make sure you're in the `orchestrator` directory

### Still in MOCK mode?
- Check that `.env` file exists in `orchestrator/` directory
- Verify `LLM_API_KEY` is set (no quotes needed)
- Restart the server after changing `.env`

## Cost Considerations

OpenAI charges per token usage:
- **Input tokens**: What you send to the API (prompts, instruction files)
- **Output tokens**: What the API returns (agent responses)

**Typical costs per workflow:**
- Instruction file: ~2,000 tokens
- Agent prompt: ~500-2,000 tokens
- Agent response: ~1,000-4,000 tokens
- **Total per agent call**: ~3,500-8,000 tokens

**Pricing (as of 2024):**
- GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- GPT-4 Turbo: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- GPT-3.5 Turbo: ~$0.0005 per 1K input tokens, ~$0.0015 per 1K output tokens

**Example workflow cost:**
- 3 agent calls (Crystal → Chloe → Crystal)
- ~6,000 tokens per call
- Using GPT-4: ~$0.54 per workflow
- Using GPT-4 Turbo: ~$0.18 per workflow
- Using GPT-3.5 Turbo: ~$0.03 per workflow

## Security Best Practices

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use environment variables** in production, not hardcoded keys
3. **Rotate API keys** periodically
4. **Monitor usage** in OpenAI dashboard to detect unexpected costs

## Next Steps

- Test with a real workflow
- Monitor costs in OpenAI dashboard
- Adjust `LLM_MODEL` if needed (try `gpt-4-turbo` for faster/cheaper)
- Set up auto-approval patterns if desired (see `AUTO_APPROVE` in `.env`)
