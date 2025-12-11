# Instruction File Access Strategy

## Current Issues

Agents may not consistently read the latest instruction files from GitHub URLs, leading to:
- Outdated behavior
- Formatting issues
- Missing new rules

## Recommended Solutions

### Option 1: Use Local File References (BEST if working in same workspace)

**If agents are working in the same workspace as the instruction files:**

Instead of GitHub URLs, use local file paths:
- `docs/agents/agent_crystal.md` (instead of GitHub URL)
- `docs/agents/_cheatsheet_crystal.md`
- `docs/agents/_common_rules.md`

**Benefits:**
- ✅ Always reads latest version (no caching issues)
- ✅ Faster (no network request)
- ✅ Works even if repo is private
- ✅ Same file, just different reference method

**How to use:**
- In your prompts, say: "Please read your instructions from `docs/agents/agent_crystal.md`"
- Or: "Read `docs/agents/_cheatsheet_crystal.md` for quick reference"

### Option 2: Add Version/Timestamp to Files

Add a version number or timestamp at the top of each instruction file so agents can verify they have the latest:

```markdown
# Crystal – Architecture & Diagnostics Agent

**Version:** 2.1.0 | **Last Updated:** 2024-01-15

You are Crystal, my senior architecture and diagnostics agent.
```

**Benefits:**
- ✅ Agents can check if they have latest version
- ✅ Easy to verify in conversation
- ✅ No infrastructure changes needed

### Option 3: Use Cheat Sheets More (RECOMMENDED)

**The cheat sheets are smaller and easier to process:**

- Start conversations with: "Read your cheat sheet: `docs/agents/_cheatsheet_crystal.md`"
- Cheat sheets are ~130-150 lines (vs 700+ for full files)
- Include all critical rules
- Link to full file if more detail needed

**Benefits:**
- ✅ Faster to read and process
- ✅ Less likely to miss critical rules
- ✅ Agents can reference full file when needed

### Option 4: Google Drive Sync (More Complex)

**If you want to use Google Drive:**

1. Create a sync script that copies files to Google Drive on git push
2. Agents read from Google Drive URLs
3. Maintains single source of truth (git)

**Pros:**
- ✅ Might be more accessible
- ✅ Can be private

**Cons:**
- ❌ Requires sync script/maintenance
- ❌ Two sources of truth (git + Drive)
- ❌ More complex setup

### Option 5: Hybrid Approach (RECOMMENDED)

**Use local files + cheat sheets:**

1. **Start conversations with cheat sheet:**
   - "Read `docs/agents/_cheatsheet_crystal.md` for quick reference"
   - Small, fast, covers critical rules

2. **Reference full file when needed:**
   - "For details, see `docs/agents/agent_crystal.md`"
   - Only when more context needed

3. **Use local paths (not GitHub URLs):**
   - Works in same workspace
   - Always latest version
   - No network issues

## Recommended Implementation

**Best approach: Use local file paths + cheat sheets**

1. Update all agent instruction files to reference local paths in examples
2. Update handoff prompts to use local paths
3. Start conversations with cheat sheet reference
4. Add version numbers to files for verification

**Example prompt:**
```
Crystal, please read your quick reference: docs/agents/_cheatsheet_crystal.md

Then proceed with [task].
```

This ensures:
- ✅ Fast, reliable access
- ✅ Always latest version
- ✅ Smaller files to process
- ✅ Easy to verify version

## Migration Steps

1. Update instruction files to show local path examples
2. Update handoff prompt templates to use local paths
3. Test with agents to ensure they can read local files
4. Add version numbers to all instruction files

