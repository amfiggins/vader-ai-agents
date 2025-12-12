# Crystal Correction Prompt

Use this prompt when Crystal's response is unclear about what she needs from Vader or what the next steps are.

## Generic Correction Prompt

```text
Crystal,

Please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md

Your last response violated your instructions in the following ways:

1. **You said "Action required: None" but then listed "Next steps" that require work** - this is confusing and contradictory
2. **You did not create a "For the Next Agent" section** - even though you listed next steps that require work
3. **It was unclear whether you need Vader's response or if you're proceeding** - you must be explicit about this

CRITICAL RULES YOU VIOLATED:
- You CANNOT say "Action required: None" if there are clear next steps requiring work
- If you have "Next steps" that require work, you MUST either:
  - Proceed with a prompt to the next agent (use `➡️ Proceeding:` and create "For the Next Agent" section)
  - Or explicitly state what you're waiting for from Vader (use `⏸️ Waiting for Vader:` and be specific)
- If the next steps require code changes → you MUST provide a prompt to Chloe
- If the next steps require investigation you can do → do it yourself and report back
- If the next steps require something from Vader → use `⏸️ Waiting for Vader:` and be specific

WHAT YOU SHOULD HAVE DONE:
Based on your "Next steps" that mentioned:
- "Check logger configuration to verify extra fields are included in CloudWatch logs"
- "Improve response extraction to handle cases where response.text is None"
- "Add more defensive checks in the response extraction logic"
- "Test again after fixes"

You should have:
1. Used `➡️ Proceeding:` in the "For Vader" section
2. Created a "For the Next Agent" section with a prompt to Chloe to fix the response extraction issue
3. Made it clear you're proceeding with the next agent's prompt

Please regenerate your response:
1. Review your project plan and current state
2. Determine what needs to happen next (the response extraction fix)
3. Use `➡️ Proceeding:` in "For Vader" section
4. Create a "For the Next Agent" section with a properly formatted prompt to Chloe
5. Include all mandatory elements in the prompt (instruction file reference, git commit strategy, repo, branch, etc.)
6. Make it clear you're proceeding and don't need Vader's response
```

## Specific Correction Prompt (For the Latest Response)

```text
Crystal,

Please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md

Your last response about the deployment and error logging issue violated your instructions:

VIOLATIONS:
1. **You said "Action required: None" but then listed "Next steps" that require work** - this is confusing and contradictory
   - Your "Next steps" mentioned: "Check logger configuration", "Improve response extraction", "Add more defensive checks", "Test again after fixes"
   - These are clear work items that need to be done, not "None" action required

2. **You did not create a "For the Next Agent" section** - even though you identified work that needs to be done
   - The response extraction issue requires code changes
   - Code changes are Chloe's job - you must provide her a prompt

3. **It was unclear whether you need Vader's response or if you're proceeding**
   - You said "Action required: None" which suggests no response needed
   - But you listed work that needs to be done, which suggests you should proceed
   - This contradiction made it unclear what to do

WHAT YOU SHOULD HAVE DONE:
Since you identified that the response extraction needs to be improved to handle cases where response.text is None, you should have:

1. **Used `➡️ Proceeding:` in "For Vader" section** - to make it clear you're providing a prompt to the next agent
2. **Created a "For the Next Agent" section** with a prompt to Chloe to:
   - Fix the response extraction to handle None values
   - Add defensive checks for response.text being None
   - Verify logger configuration includes extra fields
   - Test the fixes
3. **Made it explicit** that you're proceeding and don't need Vader's response

Please regenerate your response:
1. Review the current state: Deployment complete, error logging deployed, but response body not being captured (response_text is None)
2. Determine next step: Fix response extraction to handle None values and add defensive checks
3. Use `➡️ Proceeding:` in "For Vader" section
4. Create a "For the Next Agent" section with a properly formatted prompt to Chloe that includes:
   - Instruction file reference
   - Git commit strategy
   - Repo and feature branch
   - Clear objective: Fix response extraction to handle None values
   - Context about the issue
   - Expected outcome
5. Make it clear you're proceeding and don't need Vader's response
```

## Usage Instructions

1. **Copy the appropriate prompt** (generic or specific)
2. **Paste it into Crystal's chat**
3. **Wait for Crystal to regenerate her response**
4. **Verify the new response:**
   - Uses `➡️ Proceeding:` or `⏸️ Waiting for Vader:` appropriately
   - Creates "For the Next Agent" section if proceeding
   - Does not say "Action required: None" when there are clear next steps
   - Makes it clear whether Vader needs to respond or if she's proceeding

## Key Points to Emphasize

- **Never say "Action required: None" if there are clear next steps requiring work**
- **If next steps require code changes → provide prompt to Chloe**
- **If next steps require investigation you can do → do it yourself**
- **If next steps require something from Vader → use `⏸️ Waiting for Vader:` and be specific**
- **Always create "For the Next Agent" section when providing a prompt**
- **Always use `➡️ Proceeding:` when providing a prompt to the next agent**

