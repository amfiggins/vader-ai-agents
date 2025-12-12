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
}

// Show message
function showMessage(text, type = 'success') {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error' : 'success';
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
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
                    <div class="project-item" onclick="viewProject('${project.id}')">
                        <div class="project-header">
                            <div>
                                <div class="project-name">${project.name}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                                    ${project.description || 'No description'}
                                </div>
                            </div>
                            <span class="status-badge status-${project.status}">${project.status}</span>
                        </div>
                        ${progress ? `
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress.completionPercentage}%"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px;">
                                <span>${progress.completedTasks}/${progress.totalTasks} tasks completed</span>
                                <span>${progress.userActionItems} items need your attention</span>
                            </div>
                        ` : ''}
                        <div style="margin-top: 10px; font-size: 12px; color: #666;">
                            <strong>Directories:</strong> ${project.directories.length} | 
                            <strong>Repos:</strong> ${project.githubRepos.length} | 
                            <strong>Tasks:</strong> ${project.tasks.length}
                        </div>
                    </div>
                `;
            })).then(html => html.join(''));
        } else {
            projectsDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No projects yet. Create one to get started!</p>';
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

// View project details
async function viewProject(projectId) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`);
        const data = await response.json();
        const project = data.project;
        const progress = data.progress;

        const modal = document.getElementById('projectModal');
        const detailDiv = document.getElementById('projectDetail');
        
        detailDiv.innerHTML = `
            <h2>${project.name}</h2>
            <p style="color: #666; margin-bottom: 20px;">${project.description || 'No description'}</p>
            
            ${progress ? `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span><strong>Progress:</strong> ${progress.completionPercentage}%</span>
                        <span><strong>Tasks:</strong> ${progress.completedTasks}/${progress.totalTasks}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.completionPercentage}%"></div>
                    </div>
                </div>
            ` : ''}

            <h3>Tasks</h3>
            <div id="projectTasks">
                ${project.tasks.map(task => `
                    <div class="task-item">
                        <div class="task-info">
                            <div class="task-title">${task.title}</div>
                            <div class="task-meta">
                                ${task.description || ''} | 
                                Priority: ${task.priority} | 
                                ${task.assignedAgent ? `Assigned to: ${task.assignedAgent}` : 'Unassigned'}
                            </div>
                        </div>
                        <span class="task-status task-${task.status}">${task.status}</span>
                    </div>
                `).join('')}
            </div>

            <h3 style="margin-top: 30px;">Milestones</h3>
            <div id="projectMilestones">
                ${project.milestones.map(milestone => `
                    <div class="milestone-item ${milestone.status === 'completed' ? 'completed' : ''}">
                        <strong>${milestone.name}</strong>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            ${milestone.description || ''}
                            <br>Target: ${new Date(milestone.targetDate).toLocaleDateString()}
                            ${milestone.status === 'completed' && milestone.completedDate ? 
                                ` | Completed: ${new Date(milestone.completedDate).toLocaleDateString()}` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3 style="margin-top: 30px;">Directories</h3>
            <div>
                ${project.directories.map(dir => `
                    <div class="directory-item">
                        <div>
                            <strong>${dir.path}</strong>
                            <div style="font-size: 12px; color: #666;">${dir.type} ${dir.branch ? `- ${dir.branch}` : ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3 style="margin-top: 30px;">GitHub Repositories</h3>
            <div>
                ${project.githubRepos.map(repo => `
                    <div class="repo-item">
                        <div>
                            <strong><a href="${repo.url}" target="_blank">${repo.owner}/${repo.repo}</a></strong>
                            <div style="font-size: 12px; color: #666;">${repo.defaultBranch}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.classList.add('active');
    } catch (error) {
        showMessage(`Failed to load project: ${error.message}`, 'error');
    }
}

// Close project modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// Create project
document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const directories = Array.from(document.querySelectorAll('.directory-item')).map(item => ({
        path: item.querySelector('input[type="text"]').value,
        type: item.querySelector('select').value,
        branch: item.querySelector('input[type="text"][placeholder*="Branch"]')?.value || undefined,
        isActive: true,
    })).filter(dir => dir.path);

    const githubRepos = Array.from(document.querySelectorAll('.repo-item')).map(item => ({
        owner: item.querySelector('input[placeholder*="Owner"]').value,
        repo: item.querySelector('input[placeholder*="Repo"]').value,
        url: `https://github.com/${item.querySelector('input[placeholder*="Owner"]').value}/${item.querySelector('input[placeholder*="Repo"]').value}`,
        defaultBranch: item.querySelector('input[placeholder*="Branch"]').value || 'main',
        isActive: true,
    })).filter(repo => repo.owner && repo.repo);

    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('projectName').value,
                description: document.getElementById('projectDescription').value,
                directories,
                githubRepos,
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showMessage(`Project "${data.project.name}" created successfully!`);
            document.getElementById('projectForm').reset();
            document.getElementById('directoriesList').innerHTML = '';
            document.getElementById('githubReposList').innerHTML = '';
            loadProjects();
            showTab('projects');
        } else {
            showMessage(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Failed to create project: ${error.message}`, 'error');
    }
});

// Add directory
function addDirectory() {
    const list = document.getElementById('directoriesList');
    const item = document.createElement('div');
    item.className = 'directory-item';
    item.innerHTML = `
        <div style="flex: 1;">
            <input type="text" placeholder="Directory path" style="margin-bottom: 5px;">
            <select style="margin-bottom: 5px;">
                <option value="local">Local</option>
                <option value="github">GitHub</option>
            </select>
            <input type="text" placeholder="Branch (optional)">
        </div>
        <button type="button" class="btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(item);
}

// Add GitHub repo
function addGitHubRepo() {
    const list = document.getElementById('githubReposList');
    const item = document.createElement('div');
    item.className = 'repo-item';
    item.innerHTML = `
        <div style="flex: 1;">
            <input type="text" placeholder="Owner (username/org)" style="margin-bottom: 5px;">
            <input type="text" placeholder="Repo name" style="margin-bottom: 5px;">
            <input type="text" placeholder="Default branch (default: main)">
        </div>
        <button type="button" class="btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(item);
}

// Load user action items
async function loadUserActions() {
    try {
        const response = await fetch(`${API_BASE}/user-actions?status=pending`);
        const data = await response.json();
        
        const actionsDiv = document.getElementById('userActionsList');
        
        if (data.items && data.items.length > 0) {
            actionsDiv.innerHTML = data.items.map(item => `
                <div class="user-action-item ${item.priority === 'critical' ? 'critical' : ''}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div style="font-size: 12px; color: #666; margin-top: 10px;">
                        <strong>Type:</strong> ${item.type} | 
                        <strong>Priority:</strong> ${item.priority} |
                        <strong>Project:</strong> ${item.projectId}
                    </div>
                    ${item.notes ? `<div style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px; font-size: 12px;">${item.notes}</div>` : ''}
                    <div class="action-buttons">
                        <button class="btn-success" onclick="completeAction('${item.id}', true)">Complete</button>
                        <button class="btn-secondary" onclick="viewActionDetails('${item.id}')">View Details</button>
                    </div>
                </div>
            `).join('');
        } else {
            actionsDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pending tasks. You\'re all caught up! 🎉</p>';
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
    // Could show more details in a modal
    alert('Action details - full implementation coming soon');
}

// Initial load
loadProjects();
loadUserActions();

// Refresh every 10 seconds
setInterval(() => {
    if (document.getElementById('projects-tab').classList.contains('active')) {
        loadProjects();
    }
    if (document.getElementById('user-actions-tab').classList.contains('active')) {
        loadUserActions();
    }
}, 10000);
