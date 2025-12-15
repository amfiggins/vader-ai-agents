# Vader AI Orchestrator - Project Context

## Project Overview

This is the **Vader AI Orchestrator** - an automated agent orchestration service that enables multiple AI agents (Crystal, Chloe, Preston, Winsley, and Jude) to interact with each other without manual intervention.

## Current State

### ✅ Completed Features

1. **Agent Orchestration Service**
   - RESTful API server (Express.js, TypeScript)
   - Runs locally on port 3002
   - Agent registry with 5 agents: Crystal, Chloe, Preston, Winsley, Jude
   - Workflow state management
   - Response parsing (extracts "For Vader" and "For Next Agent" sections)
   - LLM integration (OpenAI API via `openai` SDK)

2. **Jude - Compliance & Validation Agent**
   - Validates all agent responses before proceeding
   - Tracks violations (format, boundary, rule violations)
   - Handles first-time violations (asks agent to redo)
   - Handles repeated violations (creates task for Vader, still corrects)
   - Stops workflow if 3 violations in 10 minutes (creates urgent task for Vader)
   - Integrated into workflow after each agent response

3. **Project Management System**
   - Projects with categories, local/GitHub directory links
   - Tasks and milestones
   - User action items (approvals, tasks)
   - Visual project plans/checklists

4. **macOS Desktop Application**
   - Electron-based app (like ChatGPT desktop app)
   - Automatically starts orchestrator service if not running
   - Custom icon: Gray gradient background with rounded corners, emerald icon composited
   - Dark mode only UI with early 90s retro design
   - Window layout accommodates macOS controls (28px padding at top)

5. **Web Interface**
   - Dark 90s style UI (`index-dark-90s.html`)
   - Tabs: Workflows, Projects, My Tasks, Agents
   - Real-time workflow status
   - Approval handling
   - Project management

## Architecture

### Directory Structure

```
vader-ai-agents/
├── orchestrator/
│   ├── src/
│   │   ├── types.ts              # Core types (agents, workflows, responses, projects)
│   │   ├── agent-registry.ts     # Agent configurations
│   │   ├── response-parser.ts   # Parses LLM responses
│   │   ├── state-manager.ts      # Workflow state management
│   │   ├── agent-interface.ts    # LLM agent invocation (OpenAI/Mock)
│   │   ├── orchestrator.ts       # Core orchestration engine
│   │   ├── project-manager.ts    # Project management logic
│   │   ├── jude-validator.ts     # Jude validation logic
│   │   ├── violation-tracker.ts  # Violation tracking
│   │   └── server.ts             # Express API server
│   ├── public/
│   │   ├── index-dark-90s.html  # Dark 90s UI
│   │   └── app-dark-90s.js      # Frontend JavaScript
│   ├── electron-app/
│   │   ├── main.js               # Electron main process
│   │   ├── preload.js            # Electron preload script
│   │   └── package.json          # Electron app config
│   ├── assets/
│   │   ├── icon_final.png        # Final icon (gray gradient + emerald)
│   │   ├── icon_final.icns       # macOS icon file
│   │   └── create-final-icon.js  # Icon generation script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                      # Environment variables (PORT, LLM config)
│
└── docs/
    └── agents/
        ├── agent_crystal.md
        ├── agent_chloe.md
        ├── agent_preston.md
        ├── agent_winsley.md
        └── agent_jude.md         # NEW: Jude's instruction file
```

### Key Files

#### `src/types.ts`
- Defines all core types: `AgentName`, `WorkflowState`, `ParsedResponse`, `Project`, `UserActionItem`, etc.
- **Jude is included**: `AgentName = 'crystal' | 'chloe' | 'preston' | 'winsley' | 'jude'`

#### `src/agent-registry.ts`
- Static agent configurations
- **Jude config**:
  ```typescript
  jude: {
    name: 'jude',
    displayName: 'Jude',
    instructionFileUrl: 'https://github.com/amfiggins/vader-ai-agents/blob/main/docs/agents/agent_jude.md',
    role: 'Compliance & Validation Manager',
    capabilities: ['validation', 'compliance', 'boundary-enforcement', 'violation-tracking'],
  }
  ```

#### `src/jude-validator.ts`
- `JudeValidator` class validates agent responses
- Checks: format, boundaries, rule compliance
- Returns `ValidationResult` with violations, shouldStop flag, correction prompt

#### `src/violation-tracker.ts`
- `ViolationTracker` singleton tracks violations per agent
- 10-minute window for violation counting
- Methods: `recordViolation`, `isRepeatedViolation`, `hasThreeViolationsInWindow`

#### `src/orchestrator.ts`
- Core workflow engine
- **Jude integration points**:
  1. After starting agent response (line ~67)
  2. After handoff agent response (line ~245)
- If validation fails:
  - First violation: Jude corrects, agent redoes
  - Repeated violation: Creates task for Vader, still corrects
  - 3 violations in 10 min: Stops workflow, creates urgent task for Vader

#### `src/server.ts`
- Express API server
- Routes:
  - `POST /workflows` - Start workflow (accepts optional `projectId`)
  - `GET /workflows/:id` - Get workflow status
  - `POST /workflows/:id/approve` - Approve/reject workflow
  - `GET /projects` - List projects
  - `POST /projects` - Create project
  - `GET /user-actions` - Get user action items
  - `POST /user-actions/:id/complete` - Complete action item
  - `GET /agents` - List agents
- Serves `index-dark-90s.html` at root

## Workflow Flow

### Standard Workflow (with Jude)

1. **Vader requests X** → Service transforms into prompt for Crystal
2. **Crystal responds** → Jude validates:
   - ✅ Valid → Continue
   - ⚠️ Violation (first time) → Jude corrects → Agent redoes → Re-validate
   - ⚠️ Violation (repeated) → Create task for Vader → Jude corrects → Agent redoes
   - 🛑 3 violations in 10 min → Stop workflow → Create urgent task for Vader
3. **If valid, check handoff** → If handoff exists, proceed to next agent
4. **Next agent responds** → Jude validates (same process)
5. **Repeat** until workflow complete

### Jude's Validation Process

1. **Format Validation**
   - Must have "For Vader" section
   - Proper structure (agent-specific requirements)
   - Handoff format correct

2. **Boundary Validation**
   - Crystal doesn't write code
   - Chloe doesn't push to remote
   - Preston doesn't write code
   - Agents stay within their roles

3. **Rule Compliance**
   - Instruction file references in handoffs
   - Follows agent-specific rules

## Environment Configuration

### `.env` file (create from `env.example`)

```env
PORT=3002
LLM_PROVIDER=openai
LLM_API_KEY=sk-proj-...
LLM_MODEL=gpt-4
```

## Running the Service

### Development
```bash
cd vader-ai-agents/orchestrator
npm install
npm run build
npm run dev  # Runs on port 3002
```

### Production
```bash
npm run build
PORT=3002 node dist/server.js
```

### Desktop App
```bash
cd electron-app
npm install
npm run package
# App will be in dist/Vader AI Orchestrator-darwin-arm64/
```

The app is installed at: `~/Applications/Vader AI Orchestrator.app`

## UI Design

### Dark 90s Style
- **Background**: `#1a1a1a` (dark gray)
- **Primary color**: `#00ff00` (green terminal)
- **Font**: `Courier New`, `Monaco`, monospace
- **Borders**: 3px solid green, box-shadow for depth
- **Buttons**: Green background, black text, pixel-style shadows
- **Window controls**: 28px padding at top (accommodates macOS controls)

### Icon
- Gray gradient background (`#4B5563` → `#374151` → `#1F2937`)
- Rounded corners (200px radius)
- Emerald icon composited with generous padding
- File: `assets/icon_final.icns`

## API Endpoints

### Workflows
- `POST /workflows` - Start workflow
  ```json
  {
    "prompt": "Add authentication middleware",
    "startingAgent": "crystal",
    "projectId": "optional-project-id"
  }
  ```

- `GET /workflows?active=true` - List workflows
- `GET /workflows/:id` - Get workflow details
- `POST /workflows/:id/approve` - Approve/reject
  ```json
  {
    "approved": true
  }
  ```

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `GET /projects/:id/tasks` - Get project tasks
- `GET /projects/:id/progress` - Get project progress

### User Actions
- `GET /user-actions?status=pending` - Get pending actions
- `POST /user-actions/:id/complete` - Complete action
  ```json
  {
    "userNotes": "Optional notes",
    "triggerWorkflow": true
  }
  ```

### Agents
- `GET /agents` - List all agents

## Recent Changes

### Latest Session (Dec 12, 2024)

1. **Added Jude Agent**
   - Created `agent_jude.md` instruction file
   - Added to agent registry and types
   - Created `jude-validator.ts` and `violation-tracker.ts`
   - Integrated into workflow (after each agent response)

2. **Icon Redesign**
   - Gray gradient background (not white)
   - Rounded corners (like ChatGPT)
   - Emerald icon composited (from user's provided icon)
   - Generated `icon_final.icns`

3. **UI Redesign**
   - Dark mode only (no light mode)
   - Early 90s retro style
   - Square borders, pixel-style
   - Accommodates macOS window controls
   - New files: `index-dark-90s.html`, `app-dark-90s.js`

4. **Jude Workflow Integration**
   - Validation after each agent response
   - Violation tracking (10-minute window)
   - Correction flow (Jude → Agent redo → Re-validate)
   - Escalation to Vader for repeated violations
   - Workflow stop on 3 violations

## Known Issues / TODO

1. **Jude Integration**
   - ✅ Validation in `startWorkflow` - DONE
   - ✅ Validation in `handleHandoff` - DONE
   - ⚠️ Need to test full workflow with Jude
   - ⚠️ Need to verify violation tracking works correctly

2. **Icon**
   - ✅ Created gray gradient with emerald icon
   - ⚠️ May need to verify icon displays correctly in dock
   - ⚠️ Icon compositing may need adjustment (padding, size)

3. **UI**
   - ✅ Dark 90s style implemented
   - ✅ Window controls area added
   - ⚠️ May need font adjustments
   - ⚠️ May need more 90s styling elements

4. **Testing**
   - Need to test full workflow: Vader → Crystal → Jude → Chloe → Jude → etc.
   - Need to test violation scenarios
   - Need to test repeated violations
   - Need to test 3 violations in 10 minutes

## Next Steps

1. **Test Jude Integration**
   - Run a workflow and verify Jude validates responses
   - Test violation scenarios
   - Verify task creation for Vader

2. **Polish UI**
   - Add more 90s elements (maybe pixel art, scanlines?)
   - Fine-tune colors and spacing
   - Add animations?

3. **Icon Refinement**
   - Verify icon looks good in dock
   - Adjust padding/sizing if needed

4. **Documentation**
   - Update README with Jude workflow
   - Document violation handling process

## Important Notes

- **Port**: Service runs on 3002 (not 3000)
- **LLM**: Uses OpenAI API (configured in `.env`)
- **State**: In-memory (no persistence yet)
- **Jude**: Always validates after agent responses
- **Violations**: Tracked per agent, 10-minute window
- **Workflow Stop**: Only on 3 violations in 10 minutes

## Agent Roles Summary

- **Crystal**: Architect - designs, diagnoses, plans (doesn't write code)
- **Chloe**: Implementation Engineer - writes code, tests (doesn't push to remote)
- **Preston**: Git Manager - handles git operations, remote pushes
- **Winsley**: Documentation Manager - reviews, organizes docs
- **Jude**: Compliance & Validation Manager - validates all responses, enforces boundaries

## Contact / Questions

If starting a new chat, mention:
- "I'm working on the Vader AI Orchestrator project"
- "I need to continue work on [specific feature]"
- "Can you help me test/refine [specific component]?"

The project is fully functional but may need testing and refinement, especially around Jude's validation workflow.
