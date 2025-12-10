# Common Workflows

Detailed workflows for common tasks using the Vader AI Agents system.

## Workflow: Adding a New Feature

### Overview
Complete workflow from planning to merge for a new feature.

### Steps

1. **Start with Crystal**
   ```
   Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md
   
   I want to add [feature description] to [repo name]. 
   Requirements: [list requirements]
   ```

2. **Crystal's Response**
   - 🔵 For Vader: Plan summary, what to approve
   - 🟢 For Next Agent: Prompt for Chloe (if approved)

3. **Vader Approves**
   - Review Crystal's plan
   - Say "Yes, proceed" or request changes

4. **Vader → Chloe**
   - Copy Crystal's prompt from 🟢 section
   - New chat: `Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_chloe.md`
   - Paste Crystal's prompt

5. **Chloe Implements**
   - Makes code changes
   - Runs tests
   - Reports: Implementation Summary + Questions

6. **Chloe → Crystal**
   - Copy Chloe's response
   - Back to Crystal's chat
   - Crystal reviews and plans next steps

7. **Repeat 4-6** until feature is complete

8. **Crystal → Preston (when ready)**
   - Crystal determines stable checkpoint
   - Creates prompt for Preston to merge

9. **Preston Merges**
   - Squash merges feature branch to dev
   - Reports git handoff details

10. **Complete**
    - Feature is merged
    - Dev has clean history (single commit)

## Workflow: Bug Fix

### Overview
Diagnose and fix a production bug.

### Steps

1. **Start with Crystal**
   ```
   Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md
   
   Bug report: [description]
   Repo: [repo name]
   Symptoms: [what's happening]
   ```

2. **Crystal Investigates**
   - Checks logs, code, configs
   - Diagnoses root cause
   - Creates fix plan

3. **Follow standard workflow** (steps 3-10 from "Adding a New Feature")

4. **Hotfix if urgent:**
   - Mark as `[URGENT]` or `[HOTFIX]`
   - Expedited process
   - Merge to both dev and main

## Workflow: Documentation Cleanup

### Overview
Review, organize, and clean up documentation.

### Steps

1. **Start with Crystal**
   ```
   Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md
   
   Documentation in [repo name] needs cleanup. 
   Issues: [duplicate docs, outdated content, etc.]
   ```

2. **Crystal Assesses**
   - Reviews documentation needs
   - Creates documentation review plan
   - Generates prompt for Winsley

3. **Vader → Winsley**
   - Copy Crystal's prompt
   - New chat: `Please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_winsley.md`
   - Paste Crystal's prompt

4. **Winsley Reviews**
   - Reviews all documentation
   - Consolidates duplicates
   - Removes outdated content
   - Organizes structure

5. **Winsley → Crystal**
   - Reports: Documentation Review Summary
   - Lists files modified/consolidated/removed
   - Identifies gaps

6. **Crystal → Preston**
   - If documentation changes are ready
   - Prompt Preston to merge

7. **Preston Merges**
   - Standard merge workflow

## Workflow: Multi-Repo Feature

### Overview
Feature that spans multiple repositories.

### Steps

1. **Start with Crystal**
   ```
   Crystal, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_crystal.md
   
   Feature: [description]
   Repos involved: [repo1, repo2, repo3]
   Dependencies: [repo1 must be done before repo2]
   ```

2. **Crystal Creates Coordination Plan**
   - Lists all repos and branches
   - Defines order of operations
   - Identifies dependencies
   - Creates prompts for each repo

3. **Execute in Order**
   - Follow standard workflow for each repo
   - Complete repo1 before starting repo2
   - Crystal coordinates progress

4. **Final Merge**
   - Coordinate merges across repos
   - May need specific merge order

## Workflow: Testing on Dev Before Completion

### Overview
Push feature to dev for testing, then reset and clean merge.

### Steps

1. **Work on Feature Branch**
   - Standard implementation workflow
   - Feature branch can be messy (frequent commits OK)

2. **Track Branch ID**
   - Preston tracks starting commit SHA on dev
   - This is the "Branch ID"

3. **Temporary Merge to Dev**
   ```
   Preston, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md
   
   Temporarily merge feat/feature-name to dev for testing.
   Branch ID: [starting commit SHA]
   ```

4. **Testing**
   - Test on dev branch
   - Verify feature works

5. **Reset and Clean Merge**
   ```
   Preston, please read your agent instructions at https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_preston.md
   
   Reset dev to Branch ID [SHA], then squash merge feat/feature-name to dev.
   ```

6. **Result**
   - Dev has clean history
   - Single commit from feature branch
   - Testing was possible without polluting history

## Workflow: Code Review Required

### Overview
Sensitive changes that require Vader review before merge.

### Steps

1. **Crystal Identifies Review Need**
   - Marks change as requiring review
   - Specifies what needs review

2. **Chloe Implements**
   - Standard implementation
   - Reports with `[NEEDS_REVIEW]` status

3. **Vader Reviews**
   - Reviews the changes
   - Approves or requests modifications

4. **After Approval**
   - Crystal can proceed with merge
   - Preston merges after explicit approval

5. **Preston Blocks Without Approval**
   - Preston will not merge if review required
   - Reports `[NEEDS_REVIEW]` status
   - Waits for explicit approval

## Workflow: Parallel Work

### Overview
Independent tasks that can be done simultaneously.

### Steps

1. **Crystal Coordinates**
   - Identifies independent tasks
   - Specifies which agents can work in parallel
   - Creates separate prompts

2. **Parallel Execution**
   - Chloe works on repo A
   - Preston merges previous work in repo B
   - No conflicts expected

3. **Coordination Points**
   - Crystal tracks progress
   - Syncs when needed
   - Resolves any conflicts

## Decision Tree: Which Agent?

**Need architecture/planning?** → Crystal  
**Need code changes?** → Crystal → Chloe  
**Need git operations?** → Crystal → Preston  
**Need documentation review?** → Crystal → Winsley  
**Need bug diagnosis?** → Crystal  
**Need urgent fix?** → Crystal (mark as `[URGENT]`)

## Tips

1. **Always start with Crystal** - she coordinates everything
2. **Read "For Vader" first** - tells you what you need to do
3. **Wait for approval** - don't copy handoff prompts until actions complete
4. **Use feature branches** - never work directly on main/prod/dev
5. **Track Branch IDs** - enables testing workflow with reset
6. **Be patient** - agents are thorough, which takes time but ensures quality

