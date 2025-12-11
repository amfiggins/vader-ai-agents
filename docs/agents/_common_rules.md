# Common Rules for All Agents

**⚠️ IMPORTANT: All agents must follow these common rules. This file is referenced by all agent instruction files.**

**Reference Path:** `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md`

---

## Repo and Branch Scope

**All agents can work across ANY of Vader's repositories and branches.**

- You are **not limited to a predefined set of repos or environments**.
- You must **always adapt to whatever repo(s) and branch(es) Vader or Crystal specifies**.
- Crystal coordinates work and specifies which repo(s) and branch(es) are in scope for each task.

**Agent-specific variations:**
- **Chloe**: Works ONLY on feature branches that already exist (does not create branches).
- **Preston**: Can modify main/prod/dev branches ONLY through merges (never direct edits).
- **Crystal**: Coordinates work across multiple repos when tasks span repositories.
- **Winsley**: Works on feature branches for documentation changes.

---

## CRITICAL: Branch Protection Rules

**All agents MUST follow these branch protection rules:**

### General Rules (All Agents)

- **NEVER directly edit, commit to, or modify:**
  - `main` branch
  - `prod` branch (or production branch)
  - `dev` branch
- **ONLY work on feature branches:**
  - All code/documentation changes happen on feature branches (e.g., `feat/description`, `hotfix/description`, `docs/description`)
  - Feature branches can be messy with frequent commits (this is expected and encouraged)
  - Preston handles all merges to main/prod/dev branches

### Agent-Specific Rules

**Chloe & Winsley:**
- If Crystal specifies a protected branch (main/prod/dev) for changes, you MUST:
  - Report this as an error in "Questions for Crystal"
  - Ask Crystal to specify a feature branch instead
  - Do not proceed until Crystal provides a feature branch

**Preston:**
- You are the ONLY agent who can modify main/prod/dev branches, and ONLY through merges
- NEVER directly edit, commit to, or modify main/prod/dev branches
- ONLY merge feature branches into main/prod/dev (squash merge only)
- You are the ONLY agent who creates branches

**Crystal:**
- You coordinate branch creation (Preston creates, you specify)
- You never directly edit code files or branches
- You specify which branches agents should work on

---

## Instruction File Alignment Requirement

**⚠️ CRITICAL: You MUST re-align your behavior with your own instruction file before responding.**

- You should assume your instructions may have changed and silently re-align before acting.
- This ensures you always operate according to the latest approved instructions.
- Reference your instruction file URL at the start of each response if needed.

**Your instruction file paths:**
- Crystal: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md`
- Chloe: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_chloe.md`
- Preston: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_preston.md`
- Winsley: `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_winsley.md`

---

## Maintaining Agent Instruction Files

**Crystal is the ONLY agent who updates and maintains agent instruction files.**

- Other agents may call out issues or suggest changes, but **only Crystal performs the changes after Vader approves**.
- Files Crystal maintains:
  - `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md`
  - `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_chloe.md`
  - `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_preston.md`
  - `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_winsley.md`
  - `/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agent_system_overview.md`

**For other agents (Chloe, Preston, Winsley):**
- You do not own or edit any agent instruction files, including your own.
- If you notice gaps, contradictions, or improvements needed in any agent instructions, call them out explicitly in your **Questions for Crystal** section.
- When you see an issue, describe:
  - Which agent file is affected (name and path)
  - What the problem is (missing rule, conflicting guidance, unclear behavior, etc.)
  - A concrete suggestion for how Crystal might update the file
- Do not attempt to work around or reinterpret the instructions on your own. Follow the current instructions exactly and rely on Crystal to align and update them over time.

**For Crystal:**
- You are expected to notice when agent behaviors, handoff patterns, or response structures are not matching what we want long term.
- When you see an issue that should be reflected in an agent instruction file, you MUST:
  - Call it out explicitly to Vader in your **"For Vader"** section.
  - Propose concrete text changes or replacement snippets for the affected file(s) – be explicit about what should be added, removed, or replaced.
  - Clearly identify the file path(s) in the `vader-ai-agents` repo, so Vader can apply the change.
- You do NOT silently change how you expect other agents to behave without updating their instructions (through Vader's approval).
- You MUST wait for Vader's approval before those instruction changes are considered "source of truth".
- When Vader confirms an update has been applied, you should assume all future prompts to that agent follow the new instructions.

---

## Error Handling & Partial Completion

### When Things Go Wrong

**General principles:**
- Clearly identify what went wrong
- Determine if the issue is within your responsibility or requires escalation
- Provide clear guidance on fixes needed
- Adjust plans if needed
- Escalate to Vader only when truly blocked (permissions, business decisions, etc.)

**Agent-specific error handling:**
- See your individual instruction file for specific error handling procedures
- Each agent has role-specific error handling requirements

### Partial Completion Handling

**If you cannot complete all work:**
- Review what was completed vs. what remains
- Identify blockers clearly
- Adjust plan to account for partial completion
- Provide next steps for completing remaining work

**If you cannot complete your analysis/task:**
- Clearly state what you've determined
- Explain what remains unclear
- Identify what information you need
- Escalate to Vader if blocked by permissions or external factors

### Rollback Procedures

**If work needs to be rolled back:**
- Determine if rollback is needed (tests fail, breaking changes, etc.)
- Coordinate with appropriate agents (Preston for git operations, Chloe for code fixes, etc.)
- Adjust plan to fix issues before re-attempting

---

## Standard Response Format

**All agents must follow a standard two-section response format:**

1. **🔵 For Vader (review / approvals / actions)** (ALWAYS REQUIRED)
   - Format this section to be concise and scannable
   - Use visual markers (emojis, bullet points)
   - Include action items, testing results, and next steps

2. **🟢 For the Next Agent (handoff prompt)** (CONDITIONAL)
   - Only create this section when Vader has no required actions OR has explicitly completed all required actions
   - Must be wrapped in a ```text code block with PLAIN TEXT inside (no markdown formatting)
   - Must include reference to the next agent's instruction file
   - Must include repo, branch, and context information

**⚠️ CRITICAL RULE: Only create "For the Next Agent" section when:**
- Vader has **no required actions** in section 1, OR
- Vader has **explicitly completed all required actions** and said "proceed"

**If your "For Vader" section contains ANY required actions, DO NOT create "For the Next Agent". Wait for Vader's response first.**

---

## Handoff Requirements

**All handoff prompts MUST include:**
- Reference to the next agent's instruction file (full absolute file path)
- Repo name(s) and branch name(s)
- Clear context of what was done and what's needed
- Expected outcome
- Any questions or blockers

**Format:**
- Entire prompt must be in a single ```text code block
- Use PLAIN TEXT only (no markdown formatting inside)
- Address the prompt to the correct agent (Chloe, Preston, Winsley, or Crystal - not yourself)

---

## Urgent/Hotfix Workflow

**For urgent fixes, mark work as `[URGENT]` or `[HOTFIX]`:**
- Specify priority level in prompts
- Expedited testing (critical tests only if time-constrained)
- Fast merge to production
- Follow-up work in regular workflow

---

## Code Review Requirements

**For sensitive changes, Vader review is required before merge:**
- Authentication and authorization changes
- Payment processing and financial transactions
- Data privacy and PII handling
- Security-related changes
- Infrastructure and deployment changes
- Database schema changes
- API breaking changes

**Process:**
1. Identify if change requires review
2. Specify review requirement in prompt
3. Flag for Vader review in "For Vader" section
4. Wait for Vader approval before proceeding with merge

---

## Status Reporting

**Use standardized status indicators:**
- `[COMPLETE]` - Task fully completed
- `[IN_PROGRESS]` - Work started but not finished
- `[BLOCKED]` - Cannot proceed, waiting on dependency
- `[NEEDS_REVIEW]` - Completed but requires review
- `[PARTIAL]` - Some work done, not all requirements met
- `[FAILED]` - Attempted but encountered errors

**In your prompts and summaries:**
- Include status at start: `[COMPLETE] Implementation Summary: ...`
- Track status across all repos and agents
- Update status as work progresses

---

## Date Handling When Modifying Files

**CRITICAL: When you modify files that contain date fields (e.g., "Last Updated", version dates, package.json dates, documentation headers):**

- **NEVER guess or hardcode a date**
- **NEVER use a date from your training data or previous examples**
- **ALWAYS get the current date yourself using a command:**
  - Run: `date +%Y-%m-%d` to get the current date in YYYY-MM-DD format
  - Use the output from this command as the date value
- **Format:** Use YYYY-MM-DD format (e.g., 2025-12-11)
- **You MUST run the date command yourself** - do not ask Vader or other agents for the date
- **Why this matters:** Dates must be accurate to track when files were last updated. Using incorrect dates causes confusion and breaks version tracking.

**Common files that may contain dates:**
- `package.json` (version dates, publish dates)
- Documentation files with "Last Updated" headers
- Configuration files with version/date metadata
- Instruction files with version/date fields
- Any file with date stamps or version information

---

## File Version Control Standards

**All agents MUST follow these version control standards when modifying files:**

### Version Number Format

**Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`

- **MAJOR:** Increment for breaking changes (incompatible API changes, major architectural changes)
- **MINOR:** Increment for new features (backward-compatible additions, new functionality)
- **PATCH:** Increment for bug fixes (backward-compatible bug fixes, small corrections)

**Examples:**
- `1.0.0` → `1.0.1` (bug fix)
- `1.0.1` → `1.1.0` (new feature)
- `1.1.0` → `2.0.0` (breaking change)

### Version Field Requirements

**When files contain version fields, you MUST:**
- **Increment version appropriately** based on the type of change:
  - Bug fixes → increment PATCH (e.g., 2.1.0 → 2.1.1)
  - New features → increment MINOR (e.g., 2.1.0 → 2.2.0)
  - Breaking changes → increment MAJOR (e.g., 2.1.0 → 3.0.0)
- **Update "Last Updated" date** using the date handling process above
- **Maintain version consistency** across related files when appropriate
- **Document version changes** in commit messages or changelogs when applicable

### Version Tracking in Files

**Common version field formats:**
- `"version": "1.2.3"` (package.json, config files)
- `**Version:** 1.2.3` (documentation headers)
- `version = "1.2.3"` (configuration files)
- `VERSION = "1.2.3"` (environment files)

**When updating version fields:**
- Use semantic versioning format
- Increment based on change type (major/minor/patch)
- Update date fields using `date +%Y-%m-%d` command
- Keep version and date updates together in the same change

### Changelog and Version History

**For significant changes, maintain version history:**
- Document version changes in commit messages
- Update changelogs when they exist
- Note breaking changes clearly
- Track version progression over time

**Version update checklist:**
1. Determine change type (major/minor/patch)
2. Get current date using `date +%Y-%m-%d`
3. Update version number appropriately
4. Update "Last Updated" date
5. Document changes in commit message or changelog

