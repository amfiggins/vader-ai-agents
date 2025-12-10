# Troubleshooting Guide

Common issues and solutions when using the Vader AI Agents system.

## Agent Not Following Instructions

**Symptom:** Agent behaves differently than expected or doesn't follow the instruction file.

**Solutions:**
1. **Re-reference the instruction file:**
   - Explicitly tell the agent: "Please re-read your agent instructions at [URL]"
   - Agents should re-align automatically, but sometimes need a reminder

2. **Check instruction file version:**
   - Verify you're using the latest version from GitHub
   - Instruction files may have been updated

3. **Be explicit:**
   - Remind the agent of specific rules: "According to your instructions, you should..."
   - Reference specific sections if needed

## Branch Protection Violations

**Symptom:** Agent tries to work on main/prod/dev branch directly.

**Solutions:**
1. **Stop the agent immediately:**
   - Tell them: "Stop. You should only work on feature branches, not main/prod/dev"

2. **Provide correct branch:**
   - Ask Crystal to specify a feature branch
   - Or create a feature branch yourself first

3. **Remind of rules:**
   - Reference the branch protection rules in the instruction file
   - All agents must work on feature branches only

## Agent Creates "For Next Agent" When Vader Has Actions

**Symptom:** Agent creates handoff prompt even though you have required actions.

**Solutions:**
1. **Ignore the handoff prompt:**
   - Complete your required actions first
   - The prompt will be incorrect until actions are done

2. **Remind the agent:**
   - "I still have required actions. Don't create the next agent prompt yet."
   - Agents should wait for your completion

3. **After completing actions:**
   - Tell the agent: "Actions complete, proceed"
   - Then they can create the correct handoff prompt

## Merge Conflicts

**Symptom:** Preston encounters merge conflicts.

**Solutions:**
1. **Preston will report to Crystal:**
   - Preston should identify conflicting files
   - Crystal decides resolution strategy

2. **Resolution options:**
   - Have Chloe resolve conflicts (most common)
   - Have Preston attempt with Crystal's guidance
   - Escalate to Vader if unclear

3. **Prevention:**
   - Keep feature branches up-to-date with dev
   - Coordinate work to minimize conflicts

## Tests Failing

**Symptom:** Tests fail after implementation or merge.

**Solutions:**
1. **Chloe should catch this:**
   - Chloe runs tests before reporting completion
   - If tests fail, Chloe should fix before reporting

2. **If tests fail after merge:**
   - Preston can revert the merge (with Crystal's approval)
   - Chloe fixes issues
   - Re-attempt merge after fixes

3. **Flaky tests:**
   - Report to Crystal
   - May need test environment fixes or test updates

## Documentation Out of Sync

**Symptom:** Documentation doesn't match current code.

**Solutions:**
1. **Request Winsley review:**
   - Ask Crystal to coordinate documentation review
   - Winsley will identify and fix outdated documentation

2. **Regular reviews:**
   - Schedule periodic documentation reviews
   - Especially after major feature additions

## Agent Not Responding in Expected Format

**Symptom:** Agent response doesn't have 🔵/🟢 sections or visual markers.

**Solutions:**
1. **Remind of format:**
   - "Please format your response with 🔵 For Vader and 🟢 For Next Agent sections"
   - Reference the response structure requirements

2. **Check instruction file:**
   - Verify the agent read the latest instruction file
   - Re-reference if needed

## Cost/Token Usage Concerns

**Symptom:** Concerned about token usage from reading instruction files.

**Solutions:**
1. **Instruction files are small:**
   - Each file is ~500-2000 tokens
   - Cost is minimal per read

2. **Optimize usage:**
   - Reference instruction files at conversation start
   - Agents cache context within a conversation
   - Don't need to re-read on every message

3. **Alternative approach:**
   - You could copy instruction file content directly into chat
   - But GitHub URLs are more maintainable

## Agent Coordination Issues

**Symptom:** Agents not coordinating well or conflicting.

**Solutions:**
1. **Use Crystal as coordinator:**
   - Crystal should coordinate all work
   - Don't have agents work in parallel without Crystal's coordination

2. **Clear handoffs:**
   - Ensure handoff prompts are complete
   - Include all necessary context

3. **Review summaries:**
   - Always read "Implementation Summary" or "Documentation Review Summary"
   - This helps Crystal coordinate next steps

## Git History Issues

**Symptom:** Git history is messy or feature branch commits appear on dev.

**Solutions:**
1. **Verify squash merge:**
   - Preston should always use squash merge for feature → dev
   - Feature branch history should NOT appear on dev

2. **Check Branch ID:**
   - Preston tracks Branch ID for reset capability
   - Can reset dev and re-merge if needed

3. **Clean up:**
   - If history is already messy, Preston can help clean it up
   - May require reset and re-merge

## Still Having Issues?

1. **Check the instruction files:**
   - Review the specific agent's instruction file
   - Verify you're following the workflow correctly

2. **Review system overview:**
   - See [`docs/agent_system_overview.md`](agent_system_overview.md) for complete details

3. **Start fresh:**
   - Sometimes starting a new conversation helps
   - Reference instruction file at the start

4. **Ask Crystal:**
   - Crystal can help diagnose workflow issues
   - She coordinates the system

