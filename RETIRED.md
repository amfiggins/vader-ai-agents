# Retired — vader-ai-agents

**Retired:** 2026-05-05

## What this repo was

`vader-ai-agents` was a multi-agent instruction system for coordinating AI agents (Crystal, Chloe, Preston, Winsley) across the EEE workspace. It provided named-agent roles (architect, implementation engineer, git manager, documentation manager), instruction files referenced in Cursor chats, and an Electron-based orchestrator UI.

## Why it was retired

The coordination problem it solved has been superseded by a simpler, file-based approach that lives directly in the workspace:

| What vader-ai-agents provided | Replacement |
|-------------------------------|-------------|
| Agent operating rules and roles | `context_shared/AGENT_CONTEXT_SHARED.md` |
| Workspace state and active blockers | `context_shared/STATE_SHARED.md` |
| Architectural decisions log | `context_shared/DECISIONS_SHARED.md` |
| Repo structure and domain map | `context_shared/REPO_MAP.md` |
| Task and execution prompts | `workspace-docs/prompts/` |
| Bootstrap / session start instructions | `CLAUDE.md` + `.claude/commands/start.md` |

The named-agent model (Crystal → Vader → Chloe → Preston → Winsley) added coordination overhead without meaningful benefit once Claude Code replaced the Cursor multi-chat workflow. Context files loaded at session start give a single agent the same shared state the named agents were passing between each other.

## What is preserved

Nothing was deleted. All agent instruction files, orchestrator code, and documentation remain in this repo as a historical record.

## Where to look instead

- Operating rules: `context_shared/AGENT_CONTEXT_SHARED.md`
- Current workspace state: `context_shared/STATE_SHARED.md`
- Task prompts: `workspace-docs/prompts/task/`
- Session bootstrap: `CLAUDE.md` in the workspace root
