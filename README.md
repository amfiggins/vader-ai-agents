# Vader AI Agents

A multi-agent instruction system for coordinating AI agents across multiple repositories. This system uses specialized agents with clear roles and responsibilities to maintain consistency and quality.

## Quick Start

1. **Reference instruction files in your Cursor chats:**
   - When starting a conversation with an agent, include: `Please read your agent instructions at [instruction file URL]`
   - Each agent's instruction file is linked below

2. **Start with Crystal (Architect):**
   - Crystal plans and coordinates all work
   - She will create prompts for other agents
   - Reference: `https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md`

3. **Follow the workflow:**
   - Crystal → Vader (approval) → Chloe/Preston/Winsley → Crystal (review) → Repeat

## Agents

### 🔷 Crystal – Architect
**Role:** System architecture, diagnostics, planning, and coordination  
**Instruction File:** [`docs/agents/agent_crystal.md`](https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md)  
**Responsibilities:**
- Designs system architecture across all repos
- Diagnoses root causes
- Generates structured prompts for other agents
- Maintains agent instruction files

### 🔷 Chloe – Implementation Engineer
**Role:** Code implementation, testing, and operations  
**Instruction File:** [`docs/agents/agent_chloe.md`](https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md)  
**Responsibilities:**
- Implements code changes
- Runs tests and verifies behavior
- Executes AWS/API/config updates
- Reports back to Crystal

### 🔷 Preston – Git Manager
**Role:** Git operations and branch management  
**Instruction File:** [`docs/agents/agent_preston.md`](https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md)  
**Responsibilities:**
- Commits and pushes changes
- Merges branches (squash merge for clean history)
- Manages branch lifecycle
- Maintains clean git history

### 🔷 Winsley – Documentation Manager
**Role:** Documentation review, organization, and maintenance  
**Instruction File:** [`docs/agents/agent_winsley.md`](https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_winsley.md)  
**Responsibilities:**
- Reviews all documentation
- Organizes and consolidates documentation
- Removes outdated documentation
- Maintains documentation standards

## System Overview

For complete system documentation, see: [`docs/agent_system_overview.md`](https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agent_system_overview.md)

## Common Workflows

See [`docs/common_workflows.md`](docs/common_workflows.md) for detailed workflows and examples.

## Cost Considerations

### Using GitHub URLs for Instruction Files

**How it works:**
- When you reference a GitHub URL in a chat, the AI reads the file content
- This uses tokens/credits based on the file size
- Instruction files are relatively small (~500-2000 tokens each)

**Cost breakdown:**
- **Per file read:** ~500-2000 tokens
- **Typical conversation:** 1-3 file reads (at start, sometimes mid-conversation)
- **Cost impact:** Minimal - instruction files are small compared to codebases

**Will this cost more?**
- **Short answer:** Yes, but the cost is minimal
- **Long answer:** 
  - Instruction files are small (~1-2K tokens each)
  - You reference them 1-2 times per conversation
  - Total added cost: ~1-4K tokens per task
  - This is tiny compared to reading codebases (which can be 100K+ tokens)
  - The benefit (consistent, aligned agent behavior) far outweighs the cost

### Cost Optimization Tips

1. **Reference at conversation start:**
   - Include instruction file URL in your first message
   - Agent reads it once and caches in conversation context
   - Don't need to re-reference unless starting a new conversation

2. **Agents re-align automatically:**
   - Agents are instructed to re-align with their files before responding
   - They don't need to re-read the file - they use cached context
   - Only re-read if you suspect they're using outdated instructions

3. **Use GitHub URLs (recommended):**
   - ✅ Always up-to-date (single source of truth)
   - ✅ Easy to maintain (update once, all agents get latest)
   - ✅ Minimal cost (~1-2K tokens per conversation)
   - ✅ Better than copying file content (which would be same cost but harder to maintain)

4. **Alternative (not recommended):**
   - You could copy instruction file content directly into chat
   - Same token cost, but harder to maintain
   - GitHub URLs are the better approach

**Bottom line:** The cost is negligible compared to the value of having consistent, well-coordinated agents. The instruction files ensure agents work correctly, which saves time and prevents errors.

## Getting Help

- **Troubleshooting:** See [`docs/troubleshooting.md`](docs/troubleshooting.md)
- **Getting Started:** See [`docs/getting_started.md`](docs/getting_started.md) - How to start chats with each agent
- **Common Workflows:** See [`docs/common_workflows.md`](docs/common_workflows.md) - Detailed workflows for common tasks
- **System Details:** See [`docs/agent_system_overview.md`](docs/agent_system_overview.md)
- **Documentation Index:** See [`docs/README.md`](docs/README.md) - Complete documentation structure
