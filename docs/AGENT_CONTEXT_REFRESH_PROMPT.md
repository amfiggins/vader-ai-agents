# Agent Context Refresh Prompt

Use this prompt when you update instruction files and need to refresh your agents' context.

## Generic Prompt (Works for All Agents)

```text
I have updated your instruction files. Please review the attached files to ensure you have the latest instructions.

CRITICAL: After reviewing the updated files, acknowledge that you have read and understood them. Pay special attention to any new rules, requirements, or changes in workflow.

You must:
1. Read all attached instruction files completely
2. Review the common rules file if attached
3. Review your cheat sheet if attached
4. Acknowledge any new or updated requirements
5. Confirm you understand your current responsibilities and response format requirements

After reviewing, please confirm:
- You have read all updated instruction files
- You understand your current role and responsibilities
- You understand the required response format
- You are ready to proceed with work following the updated instructions
```

## Agent-Specific Prompts

### For Crystal

```text
Crystal,

I have updated your instruction files. Please review the attached files to ensure you have the latest instructions.

CRITICAL: After reviewing the updated files, acknowledge that you have read and understood them. Pay special attention to:
- Branch protection rules (NEVER specify dev/main/prod for code changes)
- File editing restrictions (you NEVER edit/create repository files)
- Prompt format requirements (must be in ```text code block with all mandatory elements)
- Single prompt rule (only one prompt unless truly independent)
- Testing responsibilities and validation requirements

You must:
1. Read all attached instruction files completely
2. Review the common rules file if attached
3. Review your cheat sheet if attached
4. Acknowledge any new or updated requirements
5. Confirm you understand your current responsibilities and response format requirements

After reviewing, please confirm:
- You have read all updated instruction files
- You understand you MUST NEVER edit/create repository files (Chloe's job)
- You understand you MUST NEVER specify dev/main/prod for code changes (always feature branches)
- You understand the required prompt format (```text code block with instruction file reference, git commit strategy, etc.)
- You understand you can only create one prompt at a time (unless truly independent)
- You are ready to proceed with work following the updated instructions
```

### For Chloe

```text
Chloe,

I have updated your instruction files. Please review the attached files to ensure you have the latest instructions.

CRITICAL: After reviewing the updated files, acknowledge that you have read and understood them. Pay special attention to:
- Response format requirements (must be in ```text code block)
- Testing responsibilities (comprehensive testing before marking complete)
- Git commit standards and timing
- Branch restrictions (only work on feature branches, never dev/main/prod)

You must:
1. Read all attached instruction files completely
2. Review the common rules file if attached
3. Review your cheat sheet if attached
4. Acknowledge any new or updated requirements
5. Confirm you understand your current responsibilities and response format requirements

After reviewing, please confirm:
- You have read all updated instruction files
- You understand the required response format (```text code block with "For Vader" and "For the Next Agent" sections)
- You understand your testing responsibilities (local environment, npm build, browser/UI testing)
- You understand git commit standards and when to commit
- You understand you only work on feature branches (never dev/main/prod)
- You are ready to proceed with work following the updated instructions
```

### For Preston

```text
Preston,

I have updated your instruction files. Please review the attached files to ensure you have the latest instructions.

CRITICAL: After reviewing the updated files, acknowledge that you have read and understood them. Pay special attention to:
- Response format requirements (must be in ```text code block formatted as a prompt)
- Regular feature branch pushes for backup
- Merge strategies and branch lifecycle
- Branch protection (never allow direct edits to dev/main/prod)

You must:
1. Read all attached instruction files completely
2. Review the common rules file if attached
3. Review your cheat sheet if attached
4. Acknowledge any new or updated requirements
5. Confirm you understand your current responsibilities and response format requirements

After reviewing, please confirm:
- You have read all updated instruction files
- You understand the required response format (```text code block formatted as a prompt)
- You understand you must push feature branches regularly for backup
- You understand merge strategies and when to use them
- You understand branch protection rules (never allow direct edits to dev/main/prod)
- You are ready to proceed with work following the updated instructions
```

### For Winsley

```text
Winsley,

I have updated your instruction files. Please review the attached files to ensure you have the latest instructions.

CRITICAL: After reviewing the updated files, acknowledge that you have read and understood them. Pay special attention to:
- Response format requirements (must be in ```text code block)
- Documentation best practices and standards
- Review and consolidation processes
- Version control and date handling

You must:
1. Read all attached instruction files completely
2. Review the common rules file if attached
3. Review your cheat sheet if attached
4. Acknowledge any new or updated requirements
5. Confirm you understand your current responsibilities and response format requirements

After reviewing, please confirm:
- You have read all updated instruction files
- You understand the required response format (```text code block with "For Vader" and "For the Next Agent" sections)
- You understand documentation best practices and review processes
- You understand version control and date handling requirements
- You are ready to proceed with work following the updated instructions
```

## Usage Instructions

1. **Attach the relevant files** to your agent's chat:
   - Main instruction file (e.g., `agent_crystal.md`)
   - Cheat sheet (e.g., `_cheatsheet_crystal.md`)
   - Common rules (`_common_rules.md`)
   - Examples (`_examples.md`) - optional but recommended

2. **Copy the appropriate prompt** (generic or agent-specific)

3. **Paste it into the agent's chat** with the attached files

4. **Wait for the agent to acknowledge** they have read and understood the updated instructions

5. **Verify the agent confirms** all key requirements before proceeding with work

## Notes

- Use the generic prompt if you want a simple refresh
- Use agent-specific prompts for more targeted reminders about critical rules
- Always attach the main instruction file and cheat sheet at minimum
- The common rules file should be attached if it was updated
- Examples file is helpful but not always necessary

