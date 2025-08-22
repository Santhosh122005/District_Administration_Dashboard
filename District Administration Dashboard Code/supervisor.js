// Supervisor Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a supervisor
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = getCurrentUser();
    if (currentUser.role !== 'supervisor') {
        logout();
        return;
    }

    // Display user information
    document.getElementById('user-name').textContent = currentUser.name;

    // Set up sidebar navigation
    setupSidebarNavigation();

    // Load dashboard data
    loadDashboardData();
    
    // Load projects data
    loadProjectsData();
    
    // Load tasks data
    loadTasksData();
    
    // Load workers data
    loadWorkersData();
    
    // Load materials data
    loadMaterialsData();
    
    // Load feedback data
    loadFeedbackData();
    
    // Set up modals
    setupModals();
    
    // Set up form submissions
    setupFormSubmissions();

    // Make sure Chart.js is loaded
    ensureChartJsLoaded();
});

// Ensure Chart.js is loaded before trying to render charts
function ensureChartJsLoaded() {
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
        script.onload = function() {
            console.log('Chart.js loaded');
            // Render charts if they exist
            if (typeof renderProjectProgressChart === 'function') {
                renderProjectProgressChart();
            }
        };
        document.head.appendChild(script);
    } else {
        console.log('Chart.js already loaded');
        // Render charts if they exist
        if (typeof renderProjectProgressChart === 'function') {
            renderProjectProgressChart();
        }
    }
}

// Set up sidebar navigation
function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items
            menuItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.style.display = 'none');
            
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).style.display = 'block';
        });
    });
}

// Load dashboard data
function loadDashboardData() {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const users = JSON.parse(localStorage.getItem('users'));
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    
    // Filter data for this supervisor
    const supervisorProjects = projects.filter(project => project.supervisorId === currentUser.id);
    const workersUnderSupervisor = users.filter(user => user.role === 'worker' && user.supervisor === currentUser.id);
    
    // Calculate statistics
    const activeProjects = supervisorProjects.filter(project => project.status === 'in-progress').length;
    let totalTasks = 0;
    
    supervisorProjects.forEach(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        totalTasks += projectTasks.length;
    });
    
    const pendingFeedback = feedback.filter(item => {
        const worker = users.find(user => user.id === item.submittedBy);
        return worker && worker.supervisor === currentUser.id && item.status === 'pending';
    }).length;
    
    // Update dashboard stats
    document.getElementById('active-projects').textContent = activeProjects;
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('total-workers').textContent = workersUnderSupervisor.length;
    document.getElementById('pending-feedback').textContent = pendingFeedback;
    
    // Display current projects
    const currentProjectsBody = document.getElementById('current-projects-body');
    currentProjectsBody.innerHTML = '';
    
    supervisorProjects.slice(0, 5).forEach(project => {
        const row = document.createElement('tr');
        
        const progress = project.progress || 0;
        const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';
        
        row.innerHTML = `
            <td>${project.title}</td>
            <td><span class="status-badge status-${project.status}">${formatStatus(project.status)}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    <span>${progress}%</span>
                </div>
            </td>
            <td>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</td>
        `;
        
        currentProjectsBody.appendChild(row);
    });
    
    // Display recent tasks
    const recentTasksBody = document.getElementById('recent-tasks-body');
    recentTasksBody.innerHTML = '';
    
    const supervisorTasks = [];
    supervisorProjects.forEach(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        supervisorTasks.push(...projectTasks);
    });
    
    // Sort tasks by status priority (in-progress first, then not-started, then completed)
    supervisorTasks.sort((a, b) => {
        const priorityMap = { 'in-progress': 0, 'not-started': 1, 'completed': 2 };
        return priorityMap[a.status] - priorityMap[b.status];
    });
    
    supervisorTasks.slice(0, 5).forEach(task => {
        const project = projects.find(p => p.id === task.projectId);
        const worker = users.find(u => u.id === task.assignedTo);
        
        const row = document.createElement('tr');
        
        const progress = task.progress || 0;
        const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';
        
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${project ? project.title : 'N/A'}</td>
            <td>${worker ? worker.name : 'N/A'}</td>
            <td><span class="status-badge status-${task.status}">${formatStatus(task.status)}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    <span>${progress}%</span>
                </div>
            </td>
        `;
        
        recentTasksBody.appendChild(row);
    });
}

// Load projects data
function loadProjectsData() {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Filter projects for this supervisor
    const supervisorProjects = projects.filter(project => project.supervisorId === currentUser.id);
    
    // Display projects
    const projectsBody = document.getElementById('supervisor-projects-body');
    if (!projectsBody) {
        console.error('Projects body element not found');
        return;
    }
    
    projectsBody.innerHTML = '';
    
    supervisorProjects.forEach(project => {
        const row = document.createElement('tr');
        
        const progress = project.progress || 0;
        const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';
        
        row.innerHTML = `
            <td>${project.title}</td>
            <td><span class="status-badge status-${project.status}">${formatStatus(project.status)}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    <span>${progress}%</span>
                </div>
            </td>
            <td>₹${project.budget.toLocaleString()}</td>
            <td>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</td>
            <td>
                <button class="btn-sm view-project-btn" data-id="${project.id}">View</button>
                ${project.status !== 'completed' ? `<button class="btn-sm edit-project-btn" data-id="${project.id}">Edit</button>` : ''}
            </td>
        `;
        
        projectsBody.appendChild(row);
    });
    
    // Set up view and edit buttons
    document.querySelectorAll('.view-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            viewProjectDetails(projectId);
        });
    });
    
    document.querySelectorAll('.edit-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            editProjectDetails(projectId);
        });
    });
    
    // Populate project select for feedback form
    const feedbackProjectSelect = document.getElementById('feedback-project');
    if (feedbackProjectSelect) {
        feedbackProjectSelect.innerHTML = '<option value="">Select Project</option>';
        
        supervisorProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            feedbackProjectSelect.appendChild(option);
        });
    }
}

// View project details
function viewProjectDetails(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        showNotification('Project not found', 'error');
        return;
    }
    
    // Create modal for project details if it doesn't exist
    let modal = document.getElementById('view-project-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'view-project-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Project Details</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="project-details">
                    <h3 id="view-project-title"></h3>
                    <div class="project-status">
                        <span class="status-badge" id="view-project-status"></span>
                        <div class="progress-bar">
                            <div class="progress-fill" id="view-project-progress-fill"></div>
                            <span id="view-project-progress-text"></span>
                        </div>
                    </div>
                    <div class="project-info">
                        <div class="info-item">
                            <span class="info-label">Description:</span>
                            <span id="view-project-description"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Budget:</span>
                            <span id="view-project-budget"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Timeline:</span>
                            <span id="view-project-timeline"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Approval Status:</span>
                            <span id="view-project-approved"></span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary close-view-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close buttons
        modal.querySelector('.close-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.close-view-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside modal content
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Fill modal with project data
    document.getElementById('view-project-title').textContent = project.title;
    
    const statusBadge = document.getElementById('view-project-status');
    statusBadge.textContent = formatStatus(project.status);
    statusBadge.className = `status-badge status-${project.status}`;
    
    const progress = project.progress || 0;
    const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';
    
    const progressFill = document.getElementById('view-project-progress-fill');
    progressFill.style.width = `${progress}%`;
    progressFill.className = `progress-fill ${progressClass}`;
    
    document.getElementById('view-project-progress-text').textContent = `${progress}%`;
    document.getElementById('view-project-description').textContent = project.description;
    document.getElementById('view-project-budget').textContent = `₹${project.budget.toLocaleString()}`;
    document.getElementById('view-project-timeline').textContent = `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`;
    document.getElementById('view-project-approved').textContent = project.approved ? 'Approved' : 'Pending Approval';
    
    // Show the modal
    modal.style.display = 'block';
}

// Edit project details
function editProjectDetails(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        showNotification('Project not found', 'error');
        return;
    }
    
    // Create modal for editing project if it doesn't exist
    let modal = document.getElementById('edit-project-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-project-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Project</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <form id="edit-project-form">
                    <input type="hidden" id="edit-project-id">
                    <div class="input-group">
                        <label for="edit-project-title">Project Title</label>
                        <input type="text" id="edit-project-title" required>
                    </div>
                    <div class="input-group">
                        <label for="edit-project-description">Description</label>
                        <textarea id="edit-project-description" rows="3" required></textarea>
                    </div>
                    <div class="input-group">
                        <label for="edit-project-status">Status</label>
                        <select id="edit-project-status" required>
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="edit-project-progress">Progress (%)</label>
                        <input type="range" id="edit-project-progress" min="0" max="100" step="5">
                        <span id="edit-project-progress-value">0%</span>
                    </div>
                    <div class="form-row">
                        <div class="input-group">
                            <label for="edit-project-start-date">Start Date</label>
                            <input type="date" id="edit-project-start-date" required>
                        </div>
                        <div class="input-group">
                            <label for="edit-project-end-date">End Date</label>
                            <input type="date" id="edit-project-end-date" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="submit-btn">Update Project</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close buttons
        modal.querySelector('.close-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Add event listener for progress range
        const progressRange = document.getElementById('edit-project-progress');
        const progressValue = document.getElementById('edit-project-progress-value');
        
        progressRange.addEventListener('input', function() {
            progressValue.textContent = `${this.value}%`;
        });
        
        // Add form submission handler
        modal.querySelector('#edit-project-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = parseInt(document.getElementById('edit-project-id').value);
            const title = document.getElementById('edit-project-title').value;
            const description = document.getElementById('edit-project-description').value;
            const status = document.getElementById('edit-project-status').value;
            const progress = parseInt(document.getElementById('edit-project-progress').value);
            const startDate = document.getElementById('edit-project-start-date').value;
            const endDate = document.getElementById('edit-project-end-date').value;
            
            updateProject(id, title, description, status, progress, startDate, endDate);
            modal.style.display = 'none';
        });
    }
    
    // Fill form with project data
    document.getElementById('edit-project-id').value = project.id;
    document.getElementById('edit-project-title').value = project.title;
    document.getElementById('edit-project-description').value = project.description;
    document.getElementById('edit-project-status').value = project.status;
    document.getElementById('edit-project-progress').value = project.progress || 0;
    document.getElementById('edit-project-progress-value').textContent = `${project.progress || 0}%`;
    document.getElementById('edit-project-start-date').value = project.startDate;
    document.getElementById('edit-project-end-date').value = project.endDate;
    
    // Show the modal
    modal.style.display = 'block';
}

// Update project
function updateProject(id, title, description, status, progress, startDate, endDate) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    const updatedProjects = projects.map(project => {
        if (project.id === id) {
            project.title = title;
            project.description = description;
            project.status = status;
            project.progress = progress;
            project.startDate = startDate;
            project.endDate = endDate;
        }
        return project;
    });
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Reload projects data
    loadProjectsData();
    
    // Reload dashboard data
    loadDashboardData();
    
    // Refresh charts if they exist
    if (typeof renderProjectProgressChart === 'function') {
        renderProjectProgressChart();
    }
    
    // Show notification
    showNotification('Project updated successfully', 'success');
}

// Helper functions for formatting
function formatStatus(status) {
    switch (status) {
        case 'not-started': return 'Not Started';
        case 'in-progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'pending-approval': return 'Pending Approval';
        default: return status;
    }
}

// Set up modals
function setupModals() {
    // Add Project Modal
    setupModal('add-project-modal', 'add-project-btn');
    
    // Add Task Modal
    setupModal('add-task-modal', 'add-task-btn');
    
    // Add Worker Modal
    setupModal('add-worker-modal', 'add-worker-btn');
    
    // Add Material Modal
    setupModal('add-material-modal', 'add-material-btn');
}

// Set up modal
function setupModal(modalId, buttonId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }
    
    // Close button
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Cancel button
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Set up form submissions
function setupFormSubmissions() {
    // Add Project Form
    setupAddProjectForm();
    
    // Add Task Form
    setupAddTaskForm();
    
    // Add Worker Form
    setupAddWorkerForm();
    
    // Add Material Form
    setupAddMaterialForm();
}

// Setup Add Project Form
function setupAddProjectForm() {
    const form = document.getElementById('add-project-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        const title = document.getElementById('project-title').value;
        const description = document.getElementById('project-description').value;
        const budget = parseInt(document.getElementById('project-budget').value);
        const startDate = document.getElementById('project-start-date').value;
        const endDate = document.getElementById('project-end-date').value;
        
        const projects = JSON.parse(localStorage.getItem('projects'));
        const nextId = getNextId('nextProjectId');
        
        const newProject = {
            id: nextId,
            title,
            description,
            status: 'pending-approval',
            budget,
            taluk: currentUser.taluk,
            supervisorId: currentUser.id,
            startDate,
            endDate,
            progress: 0,
            approved: false
        };
        
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        document.getElementById('add-project-modal').style.display = 'none';
        form.reset();
        
        // Reload projects data
        loadProjectsData();
        
        // Reload dashboard data
        loadDashboardData();
        
        // Show notification
        showNotification('Project submitted for approval', 'success');
    });
}

// Load tasks data
function loadTasksData() {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Filter tasks for this supervisor's projects
    const supervisorProjects = projects.filter(project => project.supervisorId === currentUser.id);
    const supervisorTasks = [];
    
    supervisorProjects.forEach(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        supervisorTasks.push(...projectTasks);
    });
    
    // Display tasks
    const tasksBody = document.getElementById('tasks-body');
    tasksBody.innerHTML = '';
    
    supervisorTasks.forEach(task => {
        const project = projects.find(p => p.id === task.projectId);
        const worker = users.find(u => u.id === task.assignedTo);
        
        const row = document.createElement('tr');
        
        const progress = task.progress || 0;
        const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';
        
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${project ? project.title : 'N/A'}</td>
            <td>${worker ? worker.name : 'N/A'}</td>
            <td><span class="status-badge status-${task.status}">${formatStatus(task.status)}</span></td>
            <td>${formatDate(task.startDate)} - ${formatDate(task.endDate)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    <span>${progress}%</span>
                </div>
            </td>
            <td>
                <button class="btn-sm update-task-btn" data-id="${task.id}">Update</button>
            </td>
        `;
        
        tasksBody.appendChild(row);
    });
    
    // Add event listeners to update buttons
    document.querySelectorAll('.update-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            openUpdateTaskModal(taskId);
        });
    });
    
    // Populate project select for task form
    const taskProjectSelect = document.getElementById('task-project');
    if (taskProjectSelect) {
        taskProjectSelect.innerHTML = '<option value="">Select Project</option>';
        
        // Only include approved projects
        const approvedProjects = supervisorProjects.filter(project => project.approved);
        
        approvedProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            taskProjectSelect.appendChild(option);
        });
    }
}

// Load workers data
function loadWorkersData() {
    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users'));
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    // Filter workers for this supervisor
    const workers = users.filter(user => user.role === 'worker' && user.supervisor === currentUser.id);
    
    // Display workers
    const workersBody = document.getElementById('workers-body');
    workersBody.innerHTML = '';
    
    workers.forEach(worker => {
        // Calculate tasks for this worker
        const workerTasks = tasks.filter(task => task.assignedTo === worker.id);
        const completedTasks = workerTasks.filter(task => task.status === 'completed').length;
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${worker.name}</td>
            <td>${worker.email}<br>${worker.phone}</td>
            <td>${workerTasks.length}</td>
            <td>${completedTasks}</td>
            <td>
                <button class="btn-sm view-worker-btn" data-id="${worker.id}">View</button>
                <button class="btn-sm edit-worker-btn" data-id="${worker.id}">Edit</button>
            </td>
        `;
        
        workersBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-worker-btn').forEach(button => {
        button.addEventListener('click', function() {
            const workerId = parseInt(this.getAttribute('data-id'));
            viewWorkerDetails(workerId);
        });
    });
    
    document.querySelectorAll('.edit-worker-btn').forEach(button => {
        button.addEventListener('click', function() {
            const workerId = parseInt(this.getAttribute('data-id'));
            editWorkerDetails(workerId);
        });
    });
    
    // Populate worker select for task form
    const taskWorkerSelect = document.getElementById('task-worker');
    if (taskWorkerSelect) {
        taskWorkerSelect.innerHTML = '<option value="">Select Worker</option>';
        
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker.id;
            option.textContent = worker.name;
            taskWorkerSelect.appendChild(option);
        });
    }
}

// Setup Add Task Form
function setupAddTaskForm() {
    const form = document.getElementById('add-task-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectId = parseInt(document.getElementById('task-project').value);
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const assignedTo = parseInt(document.getElementById('task-worker').value);
        const startDate = document.getElementById('task-start-date').value;
        const endDate = document.getElementById('task-end-date').value;
        
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const nextId = getNextId('nextTaskId');
        
        const newTask = {
            id: nextId,
            projectId,
            title,
            description,
            assignedTo,
            status: 'not-started',
            startDate,
            endDate,
            progress: 0
        };
        
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        document.getElementById('add-task-modal').style.display = 'none';
        form.reset();
        
        // Reload tasks data
        loadTasksData();
        
        // Reload dashboard data
        loadDashboardData();
        
        // Show notification
        showNotification('Task added successfully', 'success');
    });
}

// Setup Add Worker Form
function setupAddWorkerForm() {
    const form = document.getElementById('add-worker-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        const name = document.getElementById('worker-name').value;
        const email = document.getElementById('worker-email').value;
        const phone = document.getElementById('worker-phone').value;
        const username = document.getElementById('worker-username').value;
        const password = document.getElementById('worker-password').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if username already exists
        if (users.some(user => user.username === username)) {
            showNotification('Username already exists', 'error');
            return;
        }
        
        const nextId = getNextId('nextUserId');
        
        const newWorker = {
            id: nextId,
            username,
            password,
            role: 'worker',
            name,
            email,
            phone,
            supervisor: currentUser.id,
            taluk: currentUser.taluk,
            district: currentUser.district
        };
        
        users.push(newWorker);
        localStorage.setItem('users', JSON.stringify(users));
        
        document.getElementById('add-worker-modal').style.display = 'none';
        form.reset();
        
        // Reload workers data
        loadWorkersData();
        
        // Reload dashboard data
        loadDashboardData();
        
        // Show notification
        showNotification('Worker added successfully', 'success');
    });
}

// Load materials data
function loadMaterialsData() {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    const materials = JSON.parse(localStorage.getItem('materials'));
    
    // Filter projects for this supervisor
    const supervisorProjects = projects.filter(project => project.supervisorId === currentUser.id);
    
    // Populate project select for filtering
    const materialProjectSelect = document.getElementById('material-project');
    if (materialProjectSelect) {
        materialProjectSelect.innerHTML = '<option value="">All Projects</option>';
        
        supervisorProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            materialProjectSelect.appendChild(option);
        });
        
        materialProjectSelect.addEventListener('change', function() {
            displayMaterials(this.value ? parseInt(this.value) : null);
        });
    }
    
    // Populate project select for add material form
    const materialProjectFormSelect = document.getElementById('material-project-select');
    if (materialProjectFormSelect) {
        materialProjectFormSelect.innerHTML = '<option value="">Select Project</option>';
        
        // Only include approved projects
        const approvedProjects = supervisorProjects.filter(project => project.approved);
        
        approvedProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            materialProjectFormSelect.appendChild(option);
        });
    }
    
    // Display materials (initially all)
    displayMaterials();
    
    // Function to display materials based on project filter
    function displayMaterials(projectFilter = null) {
        const filteredMaterials = [];
        
        supervisorProjects.forEach(project => {
            if (projectFilter === null || project.id === projectFilter) {
                const projectMaterials = materials.filter(material => material.projectId === project.id);
                filteredMaterials.push(...projectMaterials);
            }
        });
        
        // Display materials
        const materialsBody = document.getElementById('materials-body');
        materialsBody.innerHTML = '';
        
        filteredMaterials.forEach(material => {
            const project = projects.find(p => p.id === material.projectId);
            
            const row = document.createElement('tr');
            
            const totalCost = material.unitPrice * material.used;
            
            row.innerHTML = `
                <td>${material.name}</td>
                <td>${project ? project.title : 'N/A'}</td>
                <td>${material.unit}</td>
                <td>₹${material.unitPrice.toLocaleString()}</td>
                <td>${material.allocated}</td>
                <td>${material.used}</td>
                <td>₹${totalCost.toLocaleString()}</td>
                <td>
                    <button class="btn-sm update-material-btn" data-id="${material.id}">Update</button>
                </td>
            `;
            
            materialsBody.appendChild(row);
        });
        
        // Add event listeners to update buttons
        document.querySelectorAll('.update-material-btn').forEach(button => {
            button.addEventListener('click', function() {
                const materialId = parseInt(this.getAttribute('data-id'));
                openUpdateMaterialModal(materialId);
            });
        });
    }
}

// Setup Add Material Form
function setupAddMaterialForm() {
    const form = document.getElementById('add-material-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectId = parseInt(document.getElementById('material-project-select').value);
        const name = document.getElementById('material-name').value;
        const unit = document.getElementById('material-unit').value;
        const unitPrice = parseFloat(document.getElementById('material-unit-price').value);
        const allocated = parseInt(document.getElementById('material-allocated').value);
        
        const materials = JSON.parse(localStorage.getItem('materials'));
        const nextId = getNextId('nextMaterialId');
        
        const newMaterial = {
            id: nextId,
            name,
            unit,
            unitPrice,
            projectId,
            allocated,
            used: 0
        };
        
        materials.push(newMaterial);
        localStorage.setItem('materials', JSON.stringify(materials));
        
        document.getElementById('add-material-modal').style.display = 'none';
        form.reset();
        
        // Reload materials data
        loadMaterialsData();
        
        // Show notification
        showNotification('Material added successfully', 'success');
    });
}

// Load feedback data
function loadFeedbackData() {
    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users'));
    const projects = JSON.parse(localStorage.getItem('projects'));
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    
    // Filter feedback from workers under this supervisor
    const supervisorWorkers = users.filter(user => user.role === 'worker' && user.supervisor === currentUser.id);
    const workerIds = supervisorWorkers.map(worker => worker.id);
    
    const supervisorFeedback = feedback.filter(item => workerIds.includes(item.submittedBy));
    
    // Display feedback
    const feedbackBody = document.getElementById('feedback-body');
    feedbackBody.innerHTML = '';
    
    supervisorFeedback.forEach(item => {
        const worker = users.find(user => user.id === item.submittedBy);
        const project = projects.find(p => p.id === item.projectId);
        
        const row = document.createElement('tr');
        
        const statusClass = item.status === 'pending' ? 'error' : item.status === 'resolved' ? 'success' : 'warning';
        
        row.innerHTML = `
            <td>${worker ? worker.name : 'Unknown'}</td>
            <td>${project ? project.title : 'N/A'}</td>
            <td>${formatDate(item.date)}</td>
            <td><span class="status-badge status-${statusClass}">${item.status}</span></td>
            <td>${item.message}</td>
            <td>
                ${item.status === 'pending' ? 
                    `<button class="btn-sm respond-feedback-btn" data-id="${item.id}">Respond</button>` : 
                    `<button class="btn-sm view-response-btn" data-id="${item.id}">View Response</button>`
                }
            </td>
        `;
        
        feedbackBody.appendChild(row);
    });
    
    // Add event listeners to respond buttons
    document.querySelectorAll('.respond-feedback-btn').forEach(button => {
        button.addEventListener('click', function() {
            const feedbackId = parseInt(this.getAttribute('data-id'));
            openRespondFeedbackModal(feedbackId);
        });
    });
    
    document.querySelectorAll('.view-response-btn').forEach(button => {
        button.addEventListener('click', function() {
            const feedbackId = parseInt(this.getAttribute('data-id'));
            viewFeedbackResponse(feedbackId);
        });
    });
    
    // Set up feedback form submission
    const sendFeedbackForm = document.getElementById('send-feedback-form');
    if (sendFeedbackForm) {
        sendFeedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = getCurrentUser();
            const projectId = parseInt(document.getElementById('feedback-project').value);
            const message = document.getElementById('feedback-message').value;
            
            const allFeedback = JSON.parse(localStorage.getItem('feedback'));
            const nextId = getNextId('nextFeedbackId');
            
            const newFeedback = {
                id: nextId,
                submittedBy: currentUser.id,
                projectId,
                message,
                date: new Date().toISOString().split('T')[0],
                status: 'pending'
            };
            
            allFeedback.push(newFeedback);
            localStorage.setItem('feedback', JSON.stringify(allFeedback));
            
            // Reset form
            sendFeedbackForm.reset();
            
            // Show notification
            showNotification('Feedback sent successfully', 'success');
        });
    }
}

// Open update task modal
function openUpdateTaskModal(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        showNotification('Task not found', 'error');
        return;
    }
    
    const modal = document.getElementById('update-task-modal');
    if (!modal) {
        showNotification('Modal not found', 'error');
        return;
    }
    
    // Fill form with task data
    document.getElementById('update-task-id').value = task.id;
    document.getElementById('update-task-title').value = task.title;
    document.getElementById('update-task-status').value = task.status;
    document.getElementById('update-task-progress').value = task.progress || 0;
    document.getElementById('update-task-progress-value').textContent = `${task.progress || 0}%`;
    document.getElementById('update-task-start-date').value = task.startDate;
    document.getElementById('update-task-end-date').value = task.endDate;
    
    // Add event listener for progress range
    const progressRange = document.getElementById('update-task-progress');
    const progressValue = document.getElementById('update-task-progress-value');
    
    progressRange.onchange = null;
    progressRange.oninput = function() {
        progressValue.textContent = `${this.value}%`;
    };
    
    // Add form submission handler
    const form = document.getElementById('update-task-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const taskId = parseInt(document.getElementById('update-task-id').value);
        const title = document.getElementById('update-task-title').value;
        const status = document.getElementById('update-task-status').value;
        const progress = parseInt(document.getElementById('update-task-progress').value);
        const startDate = document.getElementById('update-task-start-date').value;
        const endDate = document.getElementById('update-task-end-date').value;
        
        updateTask(taskId, title, status, progress, startDate, endDate);
        modal.style.display = 'none';
    };
    
    // Show the modal
    modal.style.display = 'block';
}

// Update task
function updateTask(id, title, status, progress, startDate, endDate) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    const updatedTasks = tasks.map(task => {
        if (task.id === id) {
            task.title = title;
            task.status = status;
            task.progress = progress;
            task.startDate = startDate;
            task.endDate = endDate;
            
            // Auto-update status based on progress if needed
            if (progress === 100 && task.status !== 'completed') {
                task.status = 'completed';
            } else if (progress > 0 && progress < 100 && task.status === 'not-started') {
                task.status = 'in-progress';
            }
        }
        return task;
    });
    
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Reload tasks data
    loadTasksData();
    
    // Update project progress based on tasks
    const task = tasks.find(t => t.id === id);
    if (task) {
        updateProjectProgress(task.projectId);
    }
    
    // Reload dashboard data
    loadDashboardData();
    
    // Show notification
    showNotification('Task updated successfully', 'success');
}

// Open update material modal
function openUpdateMaterialModal(materialId) {
    const materials = JSON.parse(localStorage.getItem('materials'));
    const material = materials.find(m => m.id === materialId);
    
    if (!material) {
        showNotification('Material not found', 'error');
        return;
    }
    
    const modal = document.getElementById('update-material-modal');
    if (!modal) {
        showNotification('Modal not found', 'error');
        return;
    }
    
    // Fill form with material data
    document.getElementById('update-material-id').value = material.id;
    document.getElementById('update-material-name').value = material.name;
    document.getElementById('update-material-allocated').value = material.allocated;
    document.getElementById('update-material-used').value = material.used;
    
    // Add form submission handler
    const form = document.getElementById('update-material-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const materialId = parseInt(document.getElementById('update-material-id').value);
        const allocated = parseInt(document.getElementById('update-material-allocated').value);
        const used = parseInt(document.getElementById('update-material-used').value);
        
        updateMaterial(materialId, allocated, used);
        modal.style.display = 'none';
    };
    
    // Show the modal
    modal.style.display = 'block';
}

// Update material
function updateMaterial(id, allocated, used) {
    const materials = JSON.parse(localStorage.getItem('materials'));
    
    const updatedMaterials = materials.map(material => {
        if (material.id === id) {
            material.allocated = allocated;
            material.used = used;
        }
        return material;
    });
    
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
    
    // Reload materials data
    loadMaterialsData();
    
    // Show notification
    showNotification('Material updated successfully', 'success');
}

// Open respond feedback modal
function openRespondFeedbackModal(feedbackId) {
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    
    if (!feedbackItem) {
        showNotification('Feedback not found', 'error');
        return;
    }
    
    const modal = document.getElementById('respond-feedback-modal');
    if (!modal) {
        showNotification('Modal not found', 'error');
        return;
    }
    
    // Fill form with feedback data
    document.getElementById('feedback-id').value = feedbackItem.id;
    document.getElementById('feedback-message-view').value = feedbackItem.message;
    
    // Add form submission handler
    const form = document.getElementById('respond-feedback-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const feedbackId = parseInt(document.getElementById('feedback-id').value);
        const response = document.getElementById('feedback-response').value;
        const status = document.getElementById('feedback-status').value;
        
        respondToFeedback(feedbackId, response, status);
        modal.style.display = 'none';
    };
    
    // Show the modal
    modal.style.display = 'block';
}

// Respond to feedback
function respondToFeedback(id, response, status) {
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    
    const updatedFeedback = feedback.map(item => {
        if (item.id === id) {
            item.response = response;
            item.status = status;
            item.responseDate = new Date().toISOString().split('T')[0];
        }
        return item;
    });
    
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    
    // Reload feedback data
    loadFeedbackData();
    
    // Show notification
    showNotification('Response submitted successfully', 'success');
}

// View feedback response
function viewFeedbackResponse(feedbackId) {
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    
    if (!feedbackItem || !feedbackItem.response) {
        showNotification('Response not found', 'error');
        return;
    }
    
    // Create modal to view response
    let modal = document.getElementById('view-response-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'view-response-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Feedback Response</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="feedback-details">
                    <div class="input-group">
                        <label>Original Message:</label>
                        <div id="view-original-message" class="message-box"></div>
                    </div>
                    <div class="input-group">
                        <label>Response:</label>
                        <div id="view-response-message" class="message-box"></div>
                    </div>
                    <div class="input-group">
                        <label>Status:</label>
                        <span id="view-response-status" class="status-badge"></span>
                    </div>
                    <div class="input-group">
                        <label>Response Date:</label>
                        <span id="view-response-date"></span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary close-view-btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close buttons
        modal.querySelector('.close-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.close-view-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside modal content
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Fill modal with response data
    document.getElementById('view-original-message').textContent = feedbackItem.message;
    document.getElementById('view-response-message').textContent = feedbackItem.response;
    
    const statusElement = document.getElementById('view-response-status');
    statusElement.textContent = feedbackItem.status;
    statusElement.className = `status-badge status-${feedbackItem.status === 'resolved' ? 'success' : feedbackItem.status === 'rejected' ? 'error' : 'warning'}`;
    
    document.getElementById('view-response-date').textContent = formatDate(feedbackItem.responseDate);
    
    // Show the modal
    modal.style.display = 'block';
}
