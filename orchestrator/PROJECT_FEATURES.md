# Project Management Features

The orchestrator now includes comprehensive project management capabilities!

## 🎯 Core Features

### 1. **Project Creation & Management**
- Create projects with name and description
- Add local directories and GitHub repositories
- Track project status (planning, active, on_hold, completed, archived)
- View all projects in a visual dashboard

### 2. **Task Management**
- Create tasks within projects
- Assign tasks to agents or yourself
- Set task priorities (low, medium, high, critical)
- Track task status (todo, in_progress, blocked, review, testing, completed)
- Add dependencies between tasks
- Agents can automatically update tasks as they work

### 3. **Visual Project Plan**
- See all tasks in a checklist format
- Progress bars showing completion percentage
- Task status indicators
- Milestone tracking
- Real-time updates as agents work

### 4. **User Action Items**
- **Approval Queue**: All items requiring your approval
- **Task Queue**: Tasks assigned to you
- **Decision Queue**: Decisions you need to make
- **Review Queue**: Items needing your review
- Priority-based sorting (critical items first)
- One-click completion with notes

### 5. **Milestones**
- Create project milestones with target dates
- Link tasks to milestones
- Track milestone completion
- Visual milestone status

### 6. **Project Notes**
- Add notes to projects
- Tag notes for organization
- Track who added notes (agent or user)
- Timestamp all notes

### 7. **Progress Tracking**
- Automatic progress calculation
- Task completion percentages
- Active workflow count
- Pending approvals count
- Last activity timestamp

## 🔄 Agent Integration

### Automatic Task Updates
When agents work on workflows linked to projects:
- Tasks are automatically created from agent plans
- Task status updates as agents progress
- Blockers are automatically detected and marked
- Completion triggers next steps

### Approval Workflow
1. Agent requests approval
2. User action item is created automatically
3. You see it in "My Tasks" tab
4. You approve/reject with notes
5. Workflow continues automatically
6. Task status updates

## 📊 Project Dashboard

The Projects page shows:
- All your projects
- Progress bars for each project
- Task counts and completion status
- Items needing your attention
- Quick access to project details

## 🚀 Usage Examples

### Create a Project
1. Go to Projects tab
2. Click "Create Project"
3. Add name, description
4. Add directories (local paths or GitHub repos)
5. Add GitHub repositories
6. Click "Create Project"

### Link Workflow to Project
When starting a workflow:
```json
{
  "prompt": "Add authentication middleware",
  "startingAgent": "crystal",
  "projectId": "your-project-id"
}
```

### View Your Tasks
1. Go to "My Tasks" tab
2. See all pending approvals and tasks
3. Click "Complete" to finish items
4. Add notes when completing
5. Workflow continues automatically

## 🎨 Visual Features

- **Color-coded status badges** for quick scanning
- **Progress bars** showing completion
- **Priority indicators** (critical items highlighted)
- **Task checklists** with visual completion
- **Milestone cards** with status indicators

## 🔮 Future Enhancements

Potential additions:
- GitHub issue integration
- Automatic task creation from agent plans
- Project templates
- Time tracking
- Resource allocation
- Project dependencies
- Automated reporting
