const API_BASE = 'http://localhost:3002';

// Tab management
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'workflows') loadWorkflows();
    if (tabName === 'projects') loadProjects();
    if (tabName === 'user-actions') loadUserActions();
    if (tabName === 'agents') loadAgents();
}

// Show message
function showMessage(text, type = 'success') {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error' : 'success';
    messageDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i> ${text}`;
    messagesDiv.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

// Start workflow
document.getElementById('workflowForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value;
    const startingAgent = document.getElementById('startingAgent').value;

    try {
        const response = await fetch(`${API_BASE}/workflows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, startingAgent })
        });

        const data = await response.json();
        
        if (data.success) {
            showMessage(`Workflow started: ${data.workflowId}`);
            document.getElementById('prompt').value = '';
            loadWorkflows();
            
            if (data.requiresApproval) {
                showMessage('Approval required! Check the workflow below.', 'error');
            }
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Failed to start workflow: ${error.message}`, 'error');
    }
});

// Load workflows
async function loadWorkflows() {
    try {
        const response = await fetch(`${API_BASE}/workflows?active=true`);
        const data = await response.json();
        
        const workflowsDiv = document.getElementById('workflowsList');
        
        if (data.workflows && data.workflows.length > 0) {
            workflowsDiv.innerHTML = data.workflows.map(wf => `
                <div class="workflow-item">
                    <div class="workflow-header">
                        <div>
                            <div class="workflow-id">${wf.workflowId}</div>
                            <span class="status-badge status-${wf.status}">${wf.status}</span>
                        </div>
                        <div>
                            ${wf.currentAgent ? `<strong>Agent:</strong> ${wf.currentAgent}` : ''}
                        </div>
                    </div>
                    ${wf.status === 'waiting_approval' && wf.approvals && wf.approvals.length > 0 ? `
                        <div class="approval-section">
                            <h3><i class="fas fa-exclamation-triangle"></i> Approval Required</h3>
                            ${wf.approvals.filter(a => !a.approved).map(a => `
                                <p>${a.description}</p>
                                <div class="actions">
                                    <button class="btn-success" onclick="approveWorkflow('${wf.workflowId}', true)"><i class="fas fa-check"></i> Approve</button>
                                    <button class="btn-danger" onclick="approveWorkflow('${wf.workflowId}', false)"><i class="fas fa-times"></i> Reject</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="actions">
                        <button onclick="viewWorkflow('${wf.workflowId}')"><i class="fas fa-eye"></i> View</button>
                        <button onclick="viewHistory('${wf.workflowId}')"><i class="fas fa-history"></i> History</button>
                    </div>
                </div>
            `).join('');
        } else {
            workflowsDiv.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No active workflows</p>';
        }
    } catch (error) {
        document.getElementById('workflowsList').innerHTML = 
            `<div class="error">Failed to load workflows: ${error.message}</div>`;
    }
}

// Approve workflow
async function approveWorkflow(workflowId, approved) {
    try {
        const response = await fetch(`${API_BASE}/workflows/${workflowId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved })
        });

        const data = await response.json();
        
        if (data.success) {
            showMessage(`Workflow ${approved ? 'approved' : 'rejected'}`);
            loadWorkflows();
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Failed to approve workflow: ${error.message}`, 'error');
    }
}

// View workflow details
async function viewWorkflow(workflowId) {
    try {
        const response = await fetch(`${API_BASE}/workflows/${workflowId}`);
        const data = await response.json();
        alert(`Workflow Status: ${data.status}\nCurrent Agent: ${data.currentAgent || 'None'}`);
    } catch (error) {
        showMessage(`Failed to load workflow: ${error.message}`, 'error');
    }
}

// View workflow history
async function viewHistory(workflowId) {
    try {
        const response = await fetch(`${API_BASE}/workflows/${workflowId}/history`);
        const data = await response.json();
        
        const historyText = data.history.map((step, i) => 
            `${i + 1}. ${step.agent} - ${new Date(step.timestamp).toLocaleString()}\n   Input: ${step.input.substring(0, 100)}...`
        ).join('\n\n');
        
        alert(`Workflow History:\n\n${historyText}`);
    } catch (error) {
        showMessage(`Failed to load history: ${error.message}`, 'error');
    }
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        const data = await response.json();
        
        const projectsDiv = document.getElementById('projectsList');
        
        if (data.projects && data.projects.length > 0) {
            projectsDiv.innerHTML = await Promise.all(data.projects.map(async (project) => {
                const progress = await getProjectProgress(project.id);
                return `
                    <div class="project-item">
                        <div class="project-header">
                            <div>
                                <div class="project-name">${project.name}</div>
                                <div style="font-size: 12px; color: #888; margin-top: 5px;">
                                    ${project.description || 'No description'}
                                </div>
                            </div>
                            <span class="status-badge status-${project.status}">${project.status}</span>
                        </div>
                        ${progress ? `
                            <div style="background: #1a1a1a; border: 2px solid #00ff00; padding: 5px; margin: 10px 0;">
                                <div style="background: #00ff00; height: 8px; width: ${progress.completionPercentage}%;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-top: 5px;">
                                <span>${progress.completedTasks}/${progress.totalTasks} tasks</span>
                                <span>${progress.userActionItems} items need attention</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            })).then(html => html.join(''));
        } else {
            projectsDiv.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No projects yet. Create one to get started!</p>';
        }
    } catch (error) {
        document.getElementById('projectsList').innerHTML = 
            `<div class="error">Failed to load projects: ${error.message}</div>`;
    }
}

// Get project progress
async function getProjectProgress(projectId) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}/progress`);
        const data = await response.json();
        return data.progress;
    } catch (error) {
        return null;
    }
}

// Load user action items
async function loadUserActions() {
    try {
        const response = await fetch(`${API_BASE}/user-actions?status=pending`);
        const data = await response.json();
        
        const actionsDiv = document.getElementById('userActionsList');
        
        if (data.items && data.items.length > 0) {
            actionsDiv.innerHTML = data.items.map(item => `
                <div class="workflow-item ${item.priority === 'critical' ? 'error' : ''}">
                    <h3 style="color: ${item.priority === 'critical' ? '#ff0000' : '#ffaa00'}; margin-bottom: 10px;">
                        <i class="fas fa-${item.type === 'approval' ? 'check-circle' : 'tasks'}"></i> ${item.title}
                    </h3>
                    <p>${item.description}</p>
                    <div style="font-size: 12px; color: #888; margin-top: 10px;">
                        <strong>Type:</strong> ${item.type} | 
                        <strong>Priority:</strong> ${item.priority} |
                        <strong>Project:</strong> ${item.projectId}
                    </div>
                    <div class="actions">
                        <button class="btn-success" onclick="completeAction('${item.id}', true)"><i class="fas fa-check"></i> Complete</button>
                        <button class="btn-secondary" onclick="viewActionDetails('${item.id}')"><i class="fas fa-info"></i> Details</button>
                    </div>
                </div>
            `).join('');
        } else {
            actionsDiv.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No pending tasks. You\'re all caught up! 🎉</p>';
        }
    } catch (error) {
        document.getElementById('userActionsList').innerHTML = 
            `<div class="error">Failed to load tasks: ${error.message}</div>`;
    }
}

// Complete action
async function completeAction(actionId, approved) {
    const userNotes = prompt('Add any notes (optional):');
    
    try {
        const response = await fetch(`${API_BASE}/user-actions/${actionId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userNotes: userNotes || '',
                triggerWorkflow: true,
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showMessage('Task completed! Workflow will continue.');
            loadUserActions();
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Failed to complete task: ${error.message}`, 'error');
    }
}

// View action details
async function viewActionDetails(actionId) {
    alert('Action details - full implementation coming soon');
}

// Load agents
async function loadAgents() {
    try {
        const response = await fetch(`${API_BASE}/agents`);
        const data = await response.json();
        
        const agentsDiv = document.getElementById('agentsList');
        agentsDiv.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">' + 
            data.agents.map(agent => `
                <div class="workflow-item">
                    <h3 style="color: #00ff00; margin-bottom: 10px;">${agent.displayName}</h3>
                    <p style="font-size: 12px; color: #888; margin-bottom: 5px;"><strong>Role:</strong> ${agent.role}</p>
                    <p style="font-size: 12px; color: #888;"><strong>Capabilities:</strong> ${agent.capabilities.join(', ')}</p>
                </div>
            `).join('') + '</div>';
    } catch (error) {
        document.getElementById('agentsList').innerHTML = 
            `<div class="error">Failed to load agents: ${error.message}</div>`;
    }
}

// Initial load
loadWorkflows();
loadAgents();

// Refresh every 5 seconds
setInterval(() => {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id.replace('-tab', '');
        if (tabId === 'workflows') loadWorkflows();
        if (tabId === 'projects') loadProjects();
        if (tabId === 'user-actions') loadUserActions();
    }
}, 5000);
