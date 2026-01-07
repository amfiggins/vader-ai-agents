const API_BASE = 'http://localhost:3002';

// Inject spinner animation CSS if not already present
if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner {
            border: 3px solid #333;
            border-top: 3px solid #00ff00;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
    `;
    document.head.appendChild(style);
}

// Helper functions for error recovery and loading states
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #00ff00;">
                <div class="spinner" style="border: 3px solid #333; border-top: 3px solid #00ff00; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

function showError(elementId, error, retryCallback = null, retryContext = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let errorMessage = 'An error occurred';
    let errorType = 'unknown';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Connection failed. The orchestrator server may not be running.';
        errorType = 'connection';
    } else if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorType = 'network';
            errorMessage = 'Network error. Check your connection and ensure the orchestrator server is running on port 3002.';
        } else if (error.message.includes('404')) {
            errorType = 'notfound';
            errorMessage = 'Resource not found. The requested item may have been deleted.';
        } else if (error.message.includes('500')) {
            errorType = 'server';
            errorMessage = 'Server error. The orchestrator encountered an internal error.';
        } else if (error.message.includes('400')) {
            errorType = 'validation';
            errorMessage = `Validation error: ${error.message}`;
        }
    }
    
    const retryButton = retryCallback ? `
        <button class="btn-primary" onclick="retryOperation('${elementId}', '${retryCallback}', ${retryContext ? JSON.stringify(retryContext).replace(/'/g, "\\'") : 'null'})" style="margin-top: 10px;">
            <i class="fas fa-redo"></i> Retry
        </button>
    ` : '';
    
    element.innerHTML = `
        <div class="error" style="background: #2a0000; border: 2px solid #ff0000; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <i class="fas fa-exclamation-triangle" style="color: #ff0000; font-size: 24px; margin-right: 10px;"></i>
                <h3 style="color: #ff0000; margin: 0;">Error: ${errorType === 'connection' ? 'Connection Failed' : errorType === 'network' ? 'Network Error' : errorType === 'server' ? 'Server Error' : errorType === 'validation' ? 'Validation Error' : 'Error'}</h3>
            </div>
            <p style="color: #ffaaaa; margin: 10px 0;">${errorMessage}</p>
            ${errorType === 'connection' || errorType === 'network' ? '<p style="color: #888; font-size: 12px; margin-top: 10px;">💡 Tip: Make sure the orchestrator server is running. Check the terminal or Electron app.</p>' : ''}
            ${retryButton}
            <button class="btn-secondary" onclick="document.getElementById('${elementId}').innerHTML = ''" style="margin-top: 10px; margin-left: 10px;">
                <i class="fas fa-times"></i> Dismiss
            </button>
        </div>
    `;
}

async function retryOperation(elementId, callbackName, context, retryCount = 0) {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    if (retryCount >= maxRetries) {
        showError(elementId, new Error('Maximum retry attempts reached. Please check the server and try again later.'), null);
        return;
    }
    
    showLoading(elementId, `Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
    
    // Exponential backoff
    const delay = baseDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
        const callback = window[callbackName];
        if (typeof callback === 'function') {
            await callback(context);
        } else {
            throw new Error('Retry callback not found');
        }
    } catch (error) {
        if (retryCount < maxRetries - 1) {
            setTimeout(() => retryOperation(elementId, callbackName, context, retryCount + 1), delay);
        } else {
            showError(elementId, error, callbackName, context);
        }
    }
}

function setLoadingState(button, isLoading, loadingText = 'Loading...') {
    if (button) {
        button.disabled = isLoading;
        if (isLoading) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        } else {
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }
}

function disableForm(formId, disabled) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input, button, select, textarea');
        inputs.forEach(input => {
            input.disabled = disabled;
        });
    }
}

// Enhanced fetch with retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            lastError = error;
            
            // Don't retry on client errors (4xx) except 408 (timeout)
            if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
                throw error;
            }
            
            // Exponential backoff for retries
            if (i < maxRetries - 1) {
                const delay = 1000 * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

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

// Start workflow - wait for DOM to be ready
function setupWorkflowForm() {
    const workflowForm = document.getElementById('workflowForm');
    if (!workflowForm) {
        console.error('Workflow form not found');
        return;
    }
    
    workflowForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = document.getElementById('prompt').value;
        const startingAgent = document.getElementById('startingAgent').value;
        const submitButton = e.target.querySelector('button[type="submit"]');

        // Disable form and show loading
        disableForm('workflowForm', true);
        setLoadingState(submitButton, true, 'Starting workflow...');

        try {
            const data = await fetchWithRetry(`${API_BASE}/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, startingAgent })
            });
            
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
            showError('messages', error, 'retryWorkflowSubmit', null);
        } finally {
            disableForm('workflowForm', false);
            setLoadingState(submitButton, false);
        }
    });
}

// Load workflows
async function loadWorkflows() {
    const workflowsDiv = document.getElementById('workflowsList');
    if (!workflowsDiv) return;
    
    showLoading('workflowsList', 'Loading workflows...');
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/workflows?active=true`);
        
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
                            ${wf.approvals.filter(a => !a.approved).map((a, idx) => `
                                <p>${a.description}</p>
                                <div style="margin: 15px 0;">
                                    <label for="approval-response-${wf.workflowId}-${idx}" style="display: block; margin-bottom: 5px; color: #00ff00;">
                                        <i class="fas fa-comment"></i> Your Response (optional):
                                    </label>
                                    <textarea 
                                        id="approval-response-${wf.workflowId}-${idx}" 
                                        placeholder="Provide details, requirements, or answer questions here..."
                                        style="width: 100%; min-height: 100px; padding: 10px; background: #1a1a1a; border: 2px solid #00ff00; color: #00ff00; font-family: 'Courier New', monospace; border-radius: 5px; resize: vertical;"
                                    ></textarea>
                                </div>
                                <div class="actions">
                                    <button class="btn-success" onclick="approveWorkflow('${wf.workflowId}', true, 'approval-response-${wf.workflowId}-${idx}')"><i class="fas fa-check"></i> Approve</button>
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
        showError('workflowsList', error, 'loadWorkflows', null);
    }
}

// Approve workflow
async function approveWorkflow(workflowId, approved, responseTextareaId = null) {
    const button = event?.target || document.querySelector(`button[onclick*="approveWorkflow('${workflowId}'"]`);
    setLoadingState(button, true, approved ? 'Approving...' : 'Rejecting...');
    
    // Get user response if textarea ID provided
    let userResponse = '';
    if (responseTextareaId && approved) {
        const textarea = document.getElementById(responseTextareaId);
        if (textarea) {
            userResponse = textarea.value.trim();
        }
    }
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/workflows/${workflowId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                approved,
                userResponse: userResponse || undefined
            })
        });
        
        if (data.success) {
            showMessage(`Workflow ${approved ? 'approved' : 'rejected'}`);
            loadWorkflows();
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showError('messages', error, 'retryApproveWorkflow', { workflowId, approved });
    } finally {
        setLoadingState(button, false);
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
    const projectsDiv = document.getElementById('projectsList');
    if (!projectsDiv) return;
    
    showLoading('projectsList', 'Loading projects...');
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/projects`);
        
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
        showError('projectsList', error, 'loadProjects', null);
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
    const actionsDiv = document.getElementById('userActionsList');
    if (!actionsDiv) return;
    
    showLoading('userActionsList', 'Loading tasks...');
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/user-actions?status=pending`);
        
        if (data.items && data.items.length > 0) {
            actionsDiv.innerHTML = data.items.map(item => `
                <div class="workflow-item ${item.priority === 'critical' ? 'error' : ''}">
                    <h3 style="color: ${item.priority === 'critical' ? '#ff0000' : item.type === 'approval' ? '#ffaa00' : '#00ff00'}; margin-bottom: 10px;">
                        <i class="fas fa-${item.type === 'approval' ? 'check-circle' : 'tasks'}"></i> ${item.title}
                    </h3>
                    <p>${item.description}</p>
                    <div style="font-size: 12px; color: #888; margin-top: 10px;">
                        <strong>Type:</strong> ${item.type} | 
                        <strong>Priority:</strong> ${item.priority}
                        ${item.projectId ? ` | <strong>Project:</strong> ${item.projectId}` : ''}
                        ${item.workflowId ? ` | <strong>Workflow:</strong> ${item.workflowId.substring(0, 8)}...` : ''}
                    </div>
                    ${item.type === 'approval' ? `
                        <div style="margin: 15px 0;">
                            <label for="task-response-${item.id}" style="display: block; margin-bottom: 5px; color: #00ff00;">
                                <i class="fas fa-comment"></i> Your Response (optional):
                            </label>
                            <textarea 
                                id="task-response-${item.id}" 
                                placeholder="Provide details, requirements, or answer questions here..."
                                style="width: 100%; min-height: 100px; padding: 10px; background: #1a1a1a; border: 2px solid #00ff00; color: #00ff00; font-family: 'Courier New', monospace; border-radius: 5px; resize: vertical;"
                            ></textarea>
                        </div>
                    ` : ''}
                    <div class="actions">
                        ${item.type === 'approval' ? `
                            <button class="btn-success" onclick="completeAction('${item.id}', true, 'task-response-${item.id}')"><i class="fas fa-check"></i> Approve</button>
                            <button class="btn-danger" onclick="completeAction('${item.id}', false)"><i class="fas fa-times"></i> Reject</button>
                        ` : `
                            <button class="btn-success" onclick="completeAction('${item.id}', true)"><i class="fas fa-check"></i> Complete</button>
                        `}
                        ${item.workflowId ? `<button class="btn-secondary" onclick="viewHistory('${item.workflowId}')"><i class="fas fa-history"></i> View Workflow</button>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            actionsDiv.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No pending tasks. You\'re all caught up! 🎉</p>';
        }
    } catch (error) {
        showError('userActionsList', error, 'loadUserActions', null);
    }
}

// Complete action
async function completeAction(actionId, approved, responseTextareaId = null) {
    // Check if this is a workflow approval (starts with "approval-")
    if (actionId.startsWith('approval-')) {
        // Extract workflow ID and approval ID
        const parts = actionId.split('-');
        if (parts.length >= 3) {
            const workflowId = parts.slice(1, -1).join('-'); // Handle UUIDs with multiple dashes
            const approvalId = parts[parts.length - 1];
            
            // Get user response if textarea provided
            let userResponse = '';
            if (responseTextareaId && approved !== false) {
                const textarea = document.getElementById(responseTextareaId);
                if (textarea) {
                    userResponse = textarea.value.trim();
                }
            }
            
            // Use workflow approval endpoint
            await approveWorkflow(workflowId, approved !== false, responseTextareaId);
            return;
        }
    }
    
    // Get user response if textarea provided, otherwise prompt
    let userNotes = '';
    if (responseTextareaId) {
        const textarea = document.getElementById(responseTextareaId);
        if (textarea) {
            userNotes = textarea.value.trim();
        }
    } else {
        userNotes = prompt('Add any notes (optional):') || '';
    }
    
    const button = event?.target || document.querySelector(`button[onclick*="completeAction('${actionId}'"]`);
    setLoadingState(button, true, 'Completing...');
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/user-actions/${actionId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userNotes: userNotes || '',
                triggerWorkflow: true,
            })
        });
        
        if (data.success) {
            showMessage('Task completed! Workflow will continue.');
            loadUserActions();
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showError('messages', error, 'retryCompleteAction', { actionId, approved });
    } finally {
        setLoadingState(button, false);
    }
}

// View action details
async function viewActionDetails(actionId) {
    alert('Action details - full implementation coming soon');
}

// Load agents
async function loadAgents() {
    const agentsDiv = document.getElementById('agentsList');
    if (!agentsDiv) return;
    
    showLoading('agentsList', 'Loading agents...');
    
    try {
        const data = await fetchWithRetry(`${API_BASE}/agents`);
        agentsDiv.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">' + 
            data.agents.map(agent => `
                <div class="workflow-item">
                    <h3 style="color: #00ff00; margin-bottom: 10px;">${agent.displayName}</h3>
                    <p style="font-size: 12px; color: #888; margin-bottom: 5px;"><strong>Role:</strong> ${agent.role}</p>
                    <p style="font-size: 12px; color: #888;"><strong>Capabilities:</strong> ${agent.capabilities.join(', ')}</p>
                </div>
            `).join('') + '</div>';
    } catch (error) {
        showError('agentsList', error, 'loadAgents', null);
    }
}

// Retry helper functions
function retryWorkflowSubmit() {
    document.getElementById('workflowForm').dispatchEvent(new Event('submit'));
}

function retryApproveWorkflow(context) {
    approveWorkflow(context.workflowId, context.approved);
}

function retryCompleteAction(context) {
    completeAction(context.actionId, context.approved);
}

// Wait for DOM to be ready before setting up event listeners
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupWorkflowForm();
        loadWorkflows();
        loadAgents();
    });
} else {
    // DOM is already ready
    setupWorkflowForm();
    loadWorkflows();
    loadAgents();
}

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
