# Agent Orchestration Service

An automated service that coordinates communication between Vader AI agents (Crystal, Chloe, Preston, Winsley), eliminating the need for manual handoffs.

## Problem Statement

Currently, Vader must manually:
1. Copy prompts between agent conversations
2. Start new chats for each agent
3. Track workflow state
4. Route messages based on agent responses

This service automates all of that.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Agent Orchestration Service                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   Agent      │    │   Message    │    │ Workflow  │ │
│  │   Registry   │───▶│   Router     │───▶│  Engine   │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│         │                   │                   │       │
│         │                   │                   │       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   Response   │    │   State      │    │   Agent   │ │
│  │   Parser     │    │   Manager    │    │ Interface │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Crystal │         │  Chloe  │         │ Preston │
    └─────────┘         └─────────┘         └─────────┘
```

## Components

### 1. Agent Registry
- Maintains list of available agents
- Maps agent names to instruction file URLs
- Defines agent capabilities and roles

### 2. Message Router
- Routes messages to appropriate agents
- Handles handoff logic
- Manages conversation flow

### 3. Response Parser
- Extracts "For Vader" sections (approvals/actions)
- Extracts "For Next Agent" sections (handoff prompts)
- Identifies workflow state and next steps

### 4. Workflow Engine
- Executes predefined workflows
- Handles conditional routing
- Manages parallel work coordination

### 5. State Manager
- Tracks conversation state
- Manages approvals and decisions
- Stores workflow history

### 6. Agent Interface
- Standardized way to invoke agents
- Handles LLM API calls
- Manages conversation context

## Workflow Example

```
1. User: "Add feature X to repo Y"
   ↓
2. Orchestrator → Crystal (with instruction file)
   ↓
3. Crystal responds with:
   - 🔵 For Vader: [approval needed]
   - 🟢 For Next Agent: [handoff to Chloe]
   ↓
4. Orchestrator detects approval needed
   ↓
5. Orchestrator waits for user approval OR auto-approves if configured
   ↓
6. Orchestrator → Chloe (with handoff prompt + instruction file)
   ↓
7. Chloe responds with:
   - 🔵 For Vader: [no action]
   - 🟢 For Next Agent: [handoff back to Crystal]
   ↓
8. Orchestrator → Crystal (with Chloe's summary)
   ↓
9. Repeat until complete
```

## Features

- ✅ Automatic agent handoffs
- ✅ Approval workflow management
- ✅ State persistence
- ✅ Multi-repo coordination
- ✅ Parallel work support
- ✅ Workflow history tracking
- ✅ Error handling and retries

## Implementation Options

### Option 1: Cursor API Integration
- Use Cursor's API to invoke agents
- Requires Cursor API access
- Most seamless integration

### Option 2: LLM API Wrapper
- Use OpenAI/Anthropic API directly
- Load instruction files as system prompts
- More control, but requires API keys

### Option 3: Hybrid Approach
- Use LLM API for agent invocation
- Use Cursor for code/file operations
- Best of both worlds

## Next Steps

1. Choose implementation approach
2. Build core orchestration engine
3. Implement response parsing
4. Add state management
5. Create API/service interface
6. Add error handling and retries
7. Test with real workflows
