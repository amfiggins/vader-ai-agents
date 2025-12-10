# Getting Started with Vader AI Agents

This guide will help you get started using the multi-agent system effectively.

## First-Time Setup

### 1. Verify Access
- Ensure you can access the GitHub repository: `https://github.com/amfiggins/vader-ai-agents`
- Verify all instruction files are accessible
- Test opening one instruction file URL in your browser

### 2. Understand the Workflow
The basic workflow is:
1. **Crystal** plans and creates prompts
2. **Vader** approves and routes prompts
3. **Chloe/Preston/Winsley** execute tasks
4. **Crystal** reviews results and plans next steps

### 3. Start Your First Task
Begin with Crystal for any new work:
```
Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

I need to [describe your task]. Can you help me plan this?
```

## Common Workflows

### Workflow 1: Adding a New Feature

**Step 1: Start with Crystal**
```
Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

I want to add [feature description] to [repo name]. Can you help me plan this?
```

**What Crystal will do:**
- Analyze the requirements
- Design the architecture
- Create a branch strategy
- Generate a prompt for Chloe

**Step 2: Crystal → Vader**
- Crystal provides plan and asks for approval
- Vader reviews and says "Yes, proceed" or requests changes

**Step 3: Vader → Chloe**
- Copy Crystal's prompt for Chloe
- Paste into a new chat with: `Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md`
- Paste Crystal's prompt

**Step 4: Chloe → Crystal**
- Chloe implements, tests, and reports back
- Copy Chloe's response back to Crystal
- Crystal reviews and plans next steps

**Step 5: Crystal → Preston (when ready)**
- Crystal determines when work is ready to merge
- Copy Crystal's prompt for Preston
- Paste into a new chat with: `Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md`
- Paste Crystal's prompt

**Step 6: Preston → Crystal**
- Preston merges and reports back
- Copy Preston's response back to Crystal
- Crystal confirms completion or plans follow-up

### Workflow 2: Fixing a Bug

**Step 1: Start with Crystal**
```
Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

I'm seeing [bug description] in [repo name]. Can you help diagnose and fix this?
```

**What Crystal will do:**
- Investigate the issue (logs, code, configs)
- Diagnose root cause
- Create a fix plan
- Generate prompt for Chloe

**Steps 2-6:** Same as Workflow 1

### Workflow 3: Documentation Cleanup

**Step 1: Start with Crystal**
```
Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

The documentation in [repo name] needs cleanup. Can you coordinate a review?
```

**What Crystal will do:**
- Assess documentation needs
- Create a documentation review plan
- Generate prompt for Winsley

**Step 2: Vader → Winsley**
- Copy Crystal's prompt for Winsley
- Paste into a new chat with: `Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_winsley.md`
- Paste Crystal's prompt

**Step 3: Winsley → Crystal**
- Winsley reviews, organizes, consolidates
- Reports findings and changes
- Copy response back to Crystal

**Step 4: Crystal → Preston**
- If documentation changes are ready, Crystal prompts Preston to merge
- Follow standard merge workflow

### Workflow 4: Hotfix/Urgent Fix

**Step 1: Start with Crystal (mark as urgent)**
```
Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[URGENT] Production issue: [description]. Need immediate fix.
```

**What happens:**
- Crystal marks work as `[URGENT]` or `[HOTFIX]`
- All agents prioritize urgent work
- Expedited testing and merge process
- Fast-track to production

## Understanding Agent Responses

All agents use a consistent response format:

### 🔵 For Vader (review / approvals / actions)
- **✅ Action Required:** Things you need to do
- **❓ Decision Needed:** Decisions you need to make
- **🧪 Testing:** Testing instructions
- **➡️ Next Agent:** Which agent to invoke next
- **📦 Git:** Git operations needed
- **✅ No Action:** When nothing is needed

### 🟢 For the Next Agent (handoff prompt)
- Copy-pasteable prompt in a code block
- Includes instruction file reference
- Ready to drop into next agent's chat

## Tips for Success

1. **Always start with Crystal** for new work
2. **Read the "For Vader" section first** - it tells you what you need to do
3. **Wait for approval** before copying "For the Next Agent" prompts
4. **Use feature branches** - agents never work directly on main/prod/dev
5. **Track Branch IDs** - Preston tracks these for reset capability
6. **Be concise in responses** - agents are wordy, but you can be brief

## Response Format Quick Reference

When an agent responds, look for:

1. **🔵 For Vader** - Your action items (read this first!)
2. **🟢 For the Next Agent** - Copy this when ready to proceed
3. **Implementation Summary** (Chloe) - What was changed
4. **Documentation Review Summary** (Winsley) - Documentation changes
5. **Git Handoff Details** (Preston) - Git operations performed
6. **Questions for Crystal** - Questions that need answers

## Next Steps

- Review [`docs/agent_system_overview.md`](agent_system_overview.md) for complete system details
- Check [`docs/troubleshooting.md`](troubleshooting.md) if you encounter issues
- Start with a simple task to get familiar with the workflow

