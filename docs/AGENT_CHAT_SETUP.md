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

1. **Open a new chat** with the agent (or use existing chat)
2. **Click the attachment/paperclip icon** in the chat interface
3. **Select the 4 files** listed above for that agent
4. **Verify all 4 files are attached** before starting the conversation

**Tip:** You can create a saved chat template or bookmark for each agent with these files pre-attached.

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

