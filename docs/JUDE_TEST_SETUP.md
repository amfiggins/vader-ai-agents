# Jude Validator Agent - Test Setup

## Files to Attach to Jude's Chat

### Required Files (Core Instructions)
1. **`docs/agents/agent_jude.md`** - Jude's main instruction file
2. **`docs/agents/_cheatsheet_jude.md`** - Jude's quick reference cheat sheet
3. **`docs/agents/_common_rules.md`** - Common rules for all agents

### Required Files (For Validation)
4. **`docs/agents/agent_crystal.md`** - Crystal's instruction file (Jude validates Crystal's responses)
5. **`docs/agents/agent_chloe.md`** - Chloe's instruction file (Jude validates Chloe's responses)
6. **`docs/agents/agent_preston.md`** - Preston's instruction file (Jude validates Preston's responses)
7. **`docs/agents/agent_winsley.md`** - Winsley's instruction file (Jude validates Winsley's responses)

### Optional but Recommended
8. **`docs/agent_system_overview.md`** - System overview for context
9. **`docs/agents/_examples.md`** - Examples of correct formats

## Initial Test Prompt

```text
Jude,

Welcome! You are Jude, the Validator & Quality Assurance Agent for the Vader AI Agent System.

Please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_jude.md

Your role is to:
- Validate agent responses and prompts for compliance with instruction files
- Flag violations to Vader (you do NOT block or reject - Vader decides)
- Track patterns of violations across agents
- Suggest improvements to instruction files (via Crystal, with Vader approval)

CRITICAL REMINDERS:
- You flag issues to Vader, who has final authority
- You do NOT block or reject agent responses
- You validate based on the latest instruction files
- You track patterns and suggest improvements

TEST SCENARIO:
I'm going to give you agent responses to validate. For each response, please:
1. Read the relevant agent's instruction file
2. Validate the response against the instruction file requirements
3. Provide your validation report using your standard format:
   - Validation Status: [PASS / FLAGS / FAIL]
   - Agent: [Crystal / Chloe / Preston / Winsley]
   - Response Type: [Prompt to Agent / Response to Vader / Agent-to-Agent Communication]
   - ✅ Compliant: [List compliant aspects]
   - ⚠️ Flags (Issues Found): [List violations with rule citations]
   - 📊 Pattern Detection: [Note recurring violations]
   - 💡 Recommendations: [Suggest fixes and improvements]

Ready to begin testing. I'll provide you with agent responses to validate.
```

## Quick Test Prompt (Shorter Version)

```text
Jude,

Please read your agent instructions at /Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_jude.md

I'm testing your validation capabilities. I'll provide you with agent responses to validate.

For each response, please:
1. Validate against the relevant agent's instruction file
2. Provide your validation report in your standard format
3. Flag any violations with specific rule citations
4. Track patterns if you notice recurring issues

Ready when you are.
```

## Test Response Examples

### Example 1: Good Response (Should PASS)
```
Crystal's Response:
[Paste a compliant Crystal response here]
```

### Example 2: Response with Violations (Should FLAG)
```
Crystal's Response:
[Paste a non-compliant Crystal response here - e.g., one that says "Action required: None" with next steps]
```

### Example 3: Critical Violation (Should FAIL)
```
Crystal's Response:
[Paste a response where Crystal edited files or specified dev branch]
```

## What to Look For in Jude's Validation

### ✅ Good Validation Report Should:
- Cite specific rules from instruction files
- Include line numbers or section references when possible
- Explain why something is a violation
- Suggest specific fixes
- Track patterns if violations recur
- Be fair and accurate (not flagging preferences)

### ❌ Poor Validation Report Would:
- Not cite specific rules
- Be vague about violations
- Not suggest fixes
- Miss obvious violations
- Flag non-issues

## Testing Checklist

- [ ] Jude reads instruction files before validating
- [ ] Jude cites specific rules when flagging violations
- [ ] Jude provides constructive feedback
- [ ] Jude tracks patterns of recurring violations
- [ ] Jude suggests instruction file improvements when appropriate
- [ ] Jude uses correct format (PASS/FLAGS/FAIL status)
- [ ] Jude doesn't block or reject (only flags to Vader)
- [ ] Jude is fair and accurate

## Full File Paths (For Reference)

```
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_jude.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_cheatsheet_jude.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_common_rules.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_crystal.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_chloe.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_preston.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/agent_winsley.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agent_system_overview.md
/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/docs/agents/_examples.md
```

