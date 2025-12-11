# Example Handoff Prompts

**Reference URL:** `https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/_examples.md`

This file contains detailed examples of handoff prompts for all agents. See your agent instruction file for concise examples and when to use these patterns.

**Note:** All example prompts below are shown in code blocks. When creating actual prompts, ensure the ENTIRE prompt stays within a single ```text code block. Avoid nested markdown code blocks (```typescript, etc.) as they will break the outer code block.

**⚠️ CRITICAL REMINDERS:**
- The "For Vader" section (Section 1) is NOT shown in these examples - it goes OUTSIDE the code block
- Only the prompt to the next agent goes in the code block
- Address prompts to the correct agent (Chloe, Preston, Winsley, or Crystal - NOT yourself)
- NEVER create temp files - write directly in the code block

---

## Crystal → Chloe Examples

### Example 1: Standard Feature

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Chloe,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md

Repo: eee-ir-communication-service
Branch: feat/voice-webhook-handler
Branch ID: abc123def456789 (commit on dev where this feature branch starts)

Context: We need to add a new webhook handler for voice call events from Bland. The handler should process incoming webhook calls, validate the payload, and store call metadata.

Current state: Existing webhook infrastructure is in src/webhooks/, Bland webhook format is documented in docs/bland-webhooks.md, database schema already has voice_calls table

Task:
1. Create new handler file: src/webhooks/voice_handler.py
2. Implement payload validation using the Bland webhook schema
3. Store call metadata to voice_calls table
4. Add error handling and logging
5. Write unit tests for the handler

Expected outcome: A working webhook handler that accepts Bland voice call events, validates them, and stores call metadata. All tests pass.

Constraints: Must use existing database connection pattern, must follow existing error handling conventions, must log all webhook events for debugging

Git commit strategy:
- When to commit: Commit after completing each logical unit of work (handler implementation, tests, error handling)
- Commit message format: Use standard format type(scope): description (e.g., feat(webhooks): add voice handler, test(webhooks): add unit tests)
- Commit frequency: Commit frequently for checkpointing - messy history on feature branches is expected and encouraged
- MANDATORY: You MUST commit all work locally before handing back to Crystal. These are local commits only - Preston handles pushing to remote.

Chloe, after you complete this task, end your reply with two sections:
1. "Implementation Summary for Crystal" – what you changed, which files, what tests or API calls you ran, and key outcomes.
2. "Questions for Crystal" – anything you need clarified or any decisions you need.
```
````

### Example 2: Requires Review

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Chloe,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md

Repo: eee-bot-admin
Branch: feat/payment-webhook-security
Branch ID: xyz789abc123456 (commit on dev where this feature branch starts)
[REQUIRES VADER REVIEW BEFORE MERGE]

Context: We need to add additional security validation to payment webhook handlers. This involves authentication changes and payment processing logic.

Current state: Payment webhooks are in src/payments/webhooks.py, current authentication uses API key validation, need to add signature verification

Task:
1. Implement HMAC signature verification for payment webhooks
2. Add validation for payment amounts and currency
3. Add logging for all payment webhook events
4. Write comprehensive tests including security test cases

Expected outcome: Payment webhooks have enhanced security with signature verification. All security tests pass.

IMPORTANT: This change requires Vader review before merge due to payment processing and security implications. Do not proceed with merge until Vader has reviewed and approved.

Chloe, after you complete this task, end your reply with two sections:
1. "Implementation Summary for Crystal" – what you changed, which files, what tests or API calls you ran, and key outcomes.
2. "Questions for Crystal" – anything you need clarified or any decisions you need.
```
````

---

## Crystal → Preston Examples

### Example 1: Squash Merge

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Preston,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md

Repo: eee-ir-communication-service
Branches: feat/voice-webhook-handler → dev
Branch ID: abc123def456789 (commit on dev where feature branch started)
Merge Strategy: Squash merge

Context: Chloe has completed the voice webhook handler feature. All tests pass and the implementation is ready for merge.

Current state: Feature branch feat/voice-webhook-handler has 8 commits (messy history is expected), all commits are implementation work for this single feature, tests are passing on the feature branch, no conflicts expected with dev, Branch ID tracked: abc123def456789

Task:
1. Squash merge feat/voice-webhook-handler into dev
2. Ensure the merge creates a single clean commit on dev (feature branch history should NOT appear on dev)
3. Delete the feature branch after successful merge
4. Report the final commit SHA on dev and confirm Branch ID

Expected outcome: Dev contains a single squashed commit with all voice webhook handler work. Feature branch is retained unless explicitly requested to delete. Clean git history maintained on dev. Feature branch's messy commit history does not appear on dev.

Important: Verify tests pass before merging. If any issues arise, report to me immediately.

After you complete the merge, I will test on dev to validate everything works correctly before marking this feature as complete and signed off.
```
````

### Example 2: Branch Creation

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Preston,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md

Repo: eee-bot-admin
Base branch: dev
New branch: feat/bland-voice-picker
Branch ID: (will be set to current dev commit SHA after branch creation)

Context: We need to create a new feature branch for implementing the Bland voice picker UI component.

Task:
1. Create feature branch feat/bland-voice-picker from dev
2. Record the Branch ID (starting commit SHA on dev)
3. Push the branch to remote
4. Report the Branch ID and confirm branch is ready

Expected outcome: Feature branch feat/bland-voice-picker exists and is pushed to remote. Branch ID recorded for future reference.
```
````

---

## Crystal → Winsley Examples

### Example 1: Documentation Review

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Winsley,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_winsley.md

Repo: eee-ir-communication-service
Branch: docs/api-documentation-cleanup
Branch ID: abc123def456789 (commit on dev where this documentation branch starts)

Context: We've accumulated a lot of documentation across multiple files. Some is outdated, some is duplicated, and organization could be improved. We need a comprehensive review and cleanup.

Current state: API documentation scattered across multiple files (docs/api.md, docs/endpoints.md, docs/webhooks.md), setup documentation in both README.md and docs/SETUP.md with overlapping content, some documentation references deprecated features, documentation structure is inconsistent

Task:
1. Review all documentation files in the repo
2. Consolidate API documentation into a single, well-organized file
3. Merge duplicate setup documentation
4. Remove outdated documentation and references to deprecated features
5. Organize documentation with clear structure and navigation
6. Ensure all documentation matches current codebase

Expected outcome: Clean, organized, consolidated documentation that is easy to navigate and up-to-date. All duplicate and outdated content removed.

Documentation standards: Use consistent markdown formatting, maintain clear table of contents for long documents, include code examples where appropriate, keep documentation concise and actionable

Winsley, after you complete this task, end your reply with two sections:
1. "Documentation Review Summary" – what you reviewed, which files you modified/consolidated/removed, and key findings.
2. "Questions for Crystal" – anything you need clarified or any decisions you need.
```
````

---

## Chloe → Crystal Examples

### Example 1: Standard Completion

````markdown
🟢 For the Next Agent (handoff prompt)

```text
For Vader (review / approvals / actions)

Modified: 3 files in eee-ir-communication-service (webhook handler implementation)

Action Required:
- Run npm test in eee-ir-communication-service
- Test webhook: curl -X POST https://api.example.com/webhook

Testing:
- All unit tests passed (12/12)
- Manual webhook test successful, data stored correctly

Next Agent: Crystal (after testing)

No Action: Ready to proceed after tests pass

---

Crystal,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[COMPLETE] Implementation Summary:
- Repo: eee-ir-communication-service
- Files modified: src/webhooks/voice_handler.py (new, 245 lines), tests/test_voice_handler.py (new, 180 lines), src/webhooks/__init__.py (updated imports)
- Tests run: pytest tests/test_voice_handler.py - all 12 tests passed, manual webhook test with curl - successful, data stored correctly
- Behavior: Webhook handler accepts Bland voice call events, validates payload, stores to database

Questions for Crystal:
- No questions at this time.

Current state: Webhook handler implementation is complete and tested. Ready for merge to dev.

Next steps: Ready for Crystal to coordinate merge with Preston.
```
````

### Example 2: Blocked

````markdown
🟢 For the Next Agent (handoff prompt)

```text
For Vader (review / approvals / actions)

Modified: 1 file in eee-ir-communication-service (partial webhook handler)

Action Required:
- Grant AWS Secrets Manager access for secret "bland/webhook/signing-key" OR provide alternative configuration method

Blocked: Cannot proceed without AWS secret access

Next Agent: Crystal (to resolve blocker)

---

Crystal,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[BLOCKED] Implementation Summary:
- Repo: eee-ir-communication-service
- Files modified: src/webhooks/voice_handler.py (partial, 180 lines)
- Blocked on: AWS Secrets Manager access - need secret "bland/webhook/signing-key", error AccessDeniedException, tried AWS CLI and boto3 SDK, both failed with permission error

Questions for Crystal:
- Do I need Vader to grant AWS permissions, or is the secret configured differently?
- Should I proceed with a placeholder and update after secret is available?

I cannot proceed until AWS secret access is resolved.
```
````

### Example 3: Needs Review

````markdown
🟢 For the Next Agent (handoff prompt)

```text
For Vader (review / approvals / actions)

Modified: 2 files in eee-bot-admin (payment webhook security)

Action Required:
- Review payment webhook security changes before merge
- Verify HMAC signature verification implementation

Testing:
- All 18 tests passed including security tests
- Signature validation and replay attack prevention verified

Next Agent: Crystal (after Vader review)

This change requires Vader review before merge due to payment processing and security implications.

---

Crystal,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[NEEDS_REVIEW] Implementation Summary:
- Repo: eee-bot-admin
- Files modified: src/payments/webhooks.py (added HMAC verification, 95 lines added), tests/test_payment_security.py (new, 220 lines)
- Tests run: pytest tests/test_payment_security.py - all 18 tests passed, security tests for signature validation and replay attack prevention all pass
- Behavior: Payment webhooks now verify HMAC signatures before processing

This change requires Vader review before merge due to payment processing and security implications.

Questions for Crystal:
- No questions. Waiting for Vader review before proceeding with merge.
```
````

---

## Preston → Crystal Examples

### Example 1: Successful Merge

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Crystal,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[COMPLETE] Git Handoff Details:
- Repository: eee-ir-communication-service
- Branches: feat/voice-webhook-handler → dev
- Branch ID: xyz789abc123456 (commit on dev where feature branch started)
- Strategy: Squash merge
- Commands used: git checkout dev, git pull origin dev, git merge --squash feat/voice-webhook-handler
  - git commit -m "feat(webhooks): add Bland voice webhook handler"
  - git push origin dev
  - git branch -d feat/voice-webhook-handler
- Resulting commit: abc123def456 (squashed from 8 commits, feature branch history not included)
- Tests verified: All tests pass on dev branch
- Current state: Dev branch contains single clean commit. Feature branch deleted. Clean history maintained.

Repo is ready for further implementation work.
```
````

### Example 2: Merge Conflict

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Crystal,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[BLOCKED] Git Handoff Details:
- Repository: eee-ir-communication-service
- Branches: feat/voice-webhook-handler → dev
- Branch ID: xyz789abc123456 (commit on dev where feature branch started)
- Issue: Merge conflict encountered
- Conflicting files: src/webhooks/__init__.py (both modified), tests/conftest.py (both modified)
- Conflict nature: Import statements conflict, test fixtures conflict
- Suggested resolution: Need to merge import statements and combine test fixtures

I cannot proceed with merge until conflicts are resolved. Should I:
A) Attempt resolution with your guidance?
B) Have Chloe resolve conflicts?
C) Escalate to Vader?
```
````

### Example 3: Review Required

````markdown
🟢 For the Next Agent (handoff prompt)

```text
Crystal,

Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md

[NEEDS_REVIEW] Git Handoff Details:
- Repository: eee-bot-admin
- Branches: feat/payment-webhook-security → dev
- Branch ID: abc123def456789 (commit on dev where feature branch started)
- Status: Ready to merge, but requires Vader review
- Commit SHA: xyz789abc123
- Tests: All pass
- Review requirement: Payment processing and security changes

This change requires Vader review before merge. I will not merge until Vader explicitly approves.
```
````

---

## Key Patterns

**All prompts must include:**
- Reference to next agent's instruction file (GitHub URL)
- Repo name(s) and branch name(s)
- Clear context of what was done and what's needed
- Expected outcome
- Any questions or blockers

**Format requirements:**
- Entire prompt must be in a single ```text code block
- Use PLAIN TEXT only (no markdown formatting inside)
- Address the prompt to the correct agent (not yourself)

