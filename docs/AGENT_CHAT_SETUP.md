# Agent Chat Setup Guide

**How to set up each agent's chat with required context files**

## Overview

Each agent chat should have **4 files attached** as context to ensure agents have access to all necessary instructions, rules, examples, and quick references.

---

## Files to Attach for Each Agent

### All Agents (Common Files)

These 3 files are the same for all agents:

1. **Common Rules**
   - Path: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md`
   - Contains: Shared rules, response format, handoff requirements, status reporting

2. **Examples**
   - Path: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md`
   - Contains: Detailed examples of handoff prompts and responses

3. **Agent-Specific Cheat Sheet** (choose one based on agent)
   - Crystal: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_crystal.md`
   - Chloe: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_chloe.md`
   - Preston: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_preston.md`
   - Winsley: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_winsley.md`

4. **Agent-Specific Full Instructions** (choose one based on agent)
   - Crystal: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md`
   - Chloe: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_chloe.md`
   - Preston: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_preston.md`
   - Winsley: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_winsley.md`

---

## Quick Reference: Files for Each Agent

### Crystal (Architecture & Diagnostics Agent)

1. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md`
2. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md`
3. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_crystal.md`
4. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md`

### Chloe (Implementation & Operations Agent)

1. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md`
2. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md`
3. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_chloe.md`
4. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_chloe.md`

### Preston (Git & Branching Agent)

1. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md`
2. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md`
3. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_preston.md`
4. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_preston.md`

### Winsley (Documentation Manager Agent)

1. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md`
2. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md`
3. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_winsley.md`
4. `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_winsley.md`

---

## How to Attach Files in Cursor

**IMPORTANT:** Cursor's "@" context feature only allows referencing files within the current workspace/repo. Since agent instruction files are in the `vader-ai-agents` repo, you have a few options:

### Option 1: Agent Chats in vader-ai-agents Repo (RECOMMENDED)

**Best approach:** Open the `vader-ai-agents` repository in Cursor and create agent chats there.

1. **Open the vader-ai-agents repo** in Cursor
2. **Start a new chat** with the agent
3. **Click the "@" symbol** in the chat input
4. **Select the 4 files** for that agent (they'll be in the current workspace)
5. **Verify all 4 files are attached** before starting the conversation

**Benefits:**
- All files are accessible via "@"
- No path issues
- Agents can work on other repos via prompts, but have instruction context
- Clean separation: instruction files in one repo, work happens in other repos

**Workflow:**
- Keep agent chats in `vader-ai-agents` repo
- Agents work on other repos (eee-bot-admin, eee-tag-management, etc.) via prompts
- Instruction context stays attached in the chat

### Option 2: Reference Files in Prompts

If you must work in a different repo, you can reference the files in your initial prompt:

```
Crystal,

Please read your agent instructions from these files:
1. /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md
2. /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md
3. /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md
4. /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_crystal.md

[Your task here]
```

**Note:** This requires agents to read files themselves, which may be less reliable than attached context.

### Option 3: Symlink or Copy Files (NOT RECOMMENDED)

You could create symlinks or copy files to each repo, but this creates maintenance overhead and version sync issues.

**Recommendation:** Use Option 1 - keep agent chats in the `vader-ai-agents` repo.

---

## Benefits of Attaching Files

- **Always up-to-date context:** Agents have direct access to latest instructions
- **No URL/network issues:** Files are local, no dependency on GitHub access
- **Faster responses:** Agents don't need to read files from URLs
- **Better compliance:** Agents can reference exact requirements in real-time
- **Version control:** Files are versioned in git, easy to track changes

---

## When to Re-attach Files

- **After updating instruction files:** Re-attach to ensure agents have latest version
- **When starting a new chat session:** Attach files at the start
- **If agent behavior seems off:** Re-attach files to refresh context
- **After major instruction updates:** Always re-attach to sync changes

**Note:** If using Option 1 (chats in vader-ai-agents repo), you can use "@" to re-attach files easily. If using Option 2 (file references in prompts), you'll need to include the file paths in your prompts.

---

## File Update Workflow

1. **Update instruction files** in the repository
2. **Commit and push** changes to git
3. **Re-attach updated files** to agent chats
4. **Notify agents** (in chat) that instructions have been updated if needed

---

## Notes

- Files use **full absolute paths** for reliability
- All paths are in your Google Drive sync folder
- Files are version-controlled in the `vader-ai-agents` repository
- Cheat sheets provide quick reference, full instructions provide complete details
- Common rules ensure consistency across all agents

