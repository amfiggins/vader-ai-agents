# Getting Started with Vader AI Agents

This guide will help you start a chat with each agent in the Vader AI Agents system.

## How to Start a Chat with Each Agent

### Starting a Chat with Crystal (Architect)

**Copy this prompt to start:**
```
Crystal, please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md

[Describe your task or question here]
```

**What Crystal does:**
- Plans and coordinates all work
- Creates prompts for other agents
- Diagnoses root causes
- Maintains instruction files

**Use Crystal for:**
- Planning new features
- Diagnosing bugs
- System architecture questions
- Coordinating work across repos

---

### Starting a Chat with Chloe (Implementation Engineer)

**Copy this prompt to start:**
```
Chloe, please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_chloe.md

[Paste Crystal's implementation prompt here]
```

**What Chloe does:**
- Implements code changes
- Runs tests and verifies behavior
- Executes AWS/API/config updates
- Reports back to Crystal

**Use Chloe for:**
- Code implementation tasks
- Running tests
- AWS/API configuration
- After Crystal has planned the work

**Note:** Chloe typically receives prompts from Crystal. Start with Crystal first for new work.

---

### Starting a Chat with Preston (Git Manager)

**Copy this prompt to start:**
```
Preston, please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_preston.md

[Paste Crystal's git operation prompt here]
```

**What Preston does:**
- Commits and pushes changes
- Merges branches (squash merge for clean history)
- Creates feature branches
- Manages branch lifecycle
- Maintains clean git history

**Use Preston for:**
- Creating feature branches
- Committing and pushing changes
- Merging feature branches to dev/main/prod
- Resetting branches when needed

**Note:** Preston typically receives prompts from Crystal after work is complete. Only Preston can merge to main/prod/dev branches.

---

### Starting a Chat with Winsley (Documentation Manager)

**Copy this prompt to start:**
```
Winsley, please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_winsley.md

[Paste Crystal's documentation review prompt here]
```

**What Winsley does:**
- Reviews all documentation
- Organizes and consolidates documentation
- Removes outdated documentation
- Maintains documentation standards

**Use Winsley for:**
- Documentation reviews
- Organizing documentation
- Consolidating duplicate docs
- Cleaning up outdated content

**Note:** Winsley typically receives prompts from Crystal or Vader for documentation tasks.

---

### Starting a Chat with Jude (Validator & Quality Assurance)

**Copy this prompt to start:**
```
Jude, please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_jude.md

[Provide agent response or prompt to validate]
```

**What Jude does:**
- Validates agent responses for compliance with instruction files
- Checks response format and structure
- Verifies branch protection rules are followed
- Tracks violations

**Use Jude for:**
- Validating agent responses before proceeding
- Checking compliance with instruction files
- Quality assurance

---

## Quick Reference: Agent Instruction File Paths

All instruction files are located in: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/`

- **Crystal:** `agent_crystal.md`
- **Chloe:** `agent_chloe.md`
- **Preston:** `agent_preston.md`
- **Winsley:** `agent_winsley.md`
- **Jude:** `agent_jude.md`

**Quick Reference Cheat Sheets:**
- `_cheatsheet_crystal.md`
- `_cheatsheet_chloe.md`
- `_cheatsheet_preston.md`
- `_cheatsheet_winsley.md`
- `_cheatsheet_jude.md`

---

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

**Important:** Only copy the "For the Next Agent" prompt when:
- Vader has no required actions, OR
- You have explicitly completed all required actions

---

## Response Format Quick Reference

When an agent responds, look for:

1. **🔵 For Vader** - Your action items (read this first!)
2. **🟢 For the Next Agent** - Copy this when ready to proceed
3. **Implementation Summary** (Chloe) - What was changed
4. **Documentation Review Summary** (Winsley) - Documentation changes
5. **Git Handoff Details** (Preston) - Git operations performed
6. **Questions for Crystal** - Questions that need answers

---

## Next Steps

- **For detailed workflows:** See [`common_workflows.md`](common_workflows.md)
- **For system details:** See [`agent_system_overview.md`](agent_system_overview.md)
- **For troubleshooting:** See [`troubleshooting.md`](troubleshooting.md)

---

## Typical Workflow

1. **Start with Crystal** - She plans and coordinates all work
2. **Review Crystal's "For Vader" section** - See what needs approval
3. **Approve or request changes** - Tell Crystal "Yes, proceed" or ask for modifications
4. **Copy "For the Next Agent" prompt** - When ready to proceed
5. **Start chat with next agent** - Use the prompt from Crystal
6. **Return results to Crystal** - Agent reports back, Crystal plans next steps
7. **Repeat** until work is complete

**Remember:** Always start new work with Crystal. She coordinates everything.
