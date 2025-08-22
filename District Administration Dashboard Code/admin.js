
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // Set user name in header
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Load dashboard data
    loadDashboardData();
    
    // Load projects data
    loadProjectsData();
    
    // Load supervisors data
    loadSupervisorsData();
    
    // Load budget data
    loadBudgetData();
    
    // Load feedback data
    loadFeedbackData();
    
    // Navigation
    setupNavigation();
    
    // Setup modals
    setupModals();
    
    // Setup forms
    setupForms();
});

// Load dashboard data
function loadDashboardData() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Count statistics
    const totalProjects = projects.length;
    const pendingApprovals = projects.filter(p => !p.approved).length;
    const supervisors = users.filter(u => u.role === 'supervisor').length;
    const workers = users.filter(u => u.role === 'worker').length;
    
    // Update statistics display
    document.getElementById('total-projects').textContent = totalProjects;
    document.getElementById('pending-approvals').textContent = pendingApprovals;
    document.getElementById('total-supervisors').textContent = supervisors;
    document.getElementById('total-workers').textContent = workers;
    
    // Load recent projects (last 5)
    const recentProjects = [...projects].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).slice(0, 5);
    const recentProjectsBody = document.getElementById('recent-projects-body');
    recentProjectsBody.innerHTML = '';
    
    recentProjects.forEach(project => {
        const row = document.createElement('tr');
        
        let statusBadge = '';
        switch(project.status) {
            case 'completed':
                statusBadge = '<span class="badge badge-success">Completed</span>';
                break;
            case 'in-progress':
                statusBadge = '<span class="badge badge-warning">In Progress</span>';
                break;
            case 'pending-approval':
                statusBadge = '<span class="badge badge-error">Pending Approval</span>';
                break;
            default:
                statusBadge = '<span class="badge">' + project.status + '</span>';
        }
        
        row.innerHTML = `
            <td>${project.title}</td>
            <td>${project.taluk}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress" style="width: ${project.progress}%"></div>
                    <span>${project.progress}%</span>
                </div>
            </td>
            <td>₹${project.budget.toLocaleString('en-IN')}</td>
        `;
        
        recentProjectsBody.appendChild(row);
    });
    
    // If no recent projects
    if (recentProjects.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No recent projects found.</td>';
        recentProjectsBody.appendChild(row);
    }
}

// Load projects data
function loadProjectsData() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Load pending approval projects
    const pendingProjects = projects.filter(p => !p.approved);
    const projectApprovalsBody = document.getElementById('project-approvals-body');
    projectApprovalsBody.innerHTML = '';
    
    pendingProjects.forEach(project => {
        const supervisor = users.find(u => u.id === project.supervisorId);
        const supervisorName = supervisor ? supervisor.name : 'Unknown';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.title}</td>
            <td>${project.taluk}</td>
            <td>${supervisorName}</td>
            <td>₹${project.budget.toLocaleString('en-IN')}</td>
            <td>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</td>
            <td>
                <button class="view-project-btn" data-id="${project.id}">View</button>
                <button class="approve-project-btn" data-id="${project.id}">Approve</button>
                <button class="reject-project-btn" data-id="${project.id}">Reject</button>
            </td>
        `;
        
        projectApprovalsBody.appendChild(row);
    });
    
    // If no pending projects
    if (pendingProjects.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No projects pending approval.</td>';
        projectApprovalsBody.appendChild(row);
    }
    
    // Load all projects
    const allProjectsBody = document.getElementById('all-projects-body');
    allProjectsBody.innerHTML = '';
    
    projects.forEach(project => {
        const supervisor = users.find(u => u.id === project.supervisorId);
        const supervisorName = supervisor ? supervisor.name : 'Unknown';
        
        let statusBadge = '';
        switch(project.status) {
            case 'completed':
                statusBadge = '<span class="badge badge-success">Completed</span>';
                break;
            case 'in-progress':
                statusBadge = '<span class="badge badge-warning">In Progress</span>';
                break;
            case 'pending-approval':
                statusBadge = '<span class="badge badge-error">Pending Approval</span>';
                break;
            default:
                statusBadge = '<span class="badge">' + project.status + '</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.title}</td>
            <td>${project.taluk}</td>
            <td>${supervisorName}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress" style="width: ${project.progress}%"></div>
                    <span>${project.progress}%</span>
                </div>
            </td>
            <td>₹${project.budget.toLocaleString('en-IN')}</td>
            <td>
                <button class="view-project-btn" data-id="${project.id}">View</button>
            </td>
        `;
        
        allProjectsBody.appendChild(row);
    });
    
    // If no projects
    if (projects.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">No projects found.</td>';
        allProjectsBody.appendChild(row);
    }
    
    // Add event listeners to buttons
    const viewButtons = document.querySelectorAll('.view-project-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            viewProjectDetails(projectId);
        });
    });
    
    const approveButtons = document.querySelectorAll('.approve-project-btn');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            approveProject(projectId);
        });
    });
    
    const rejectButtons = document.querySelectorAll('.reject-project-btn');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            rejectProject(projectId);
        });
    });
}

// Load supervisors data
function loadSupervisorsData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Filter supervisors
    const supervisors = users.filter(u => u.role === 'supervisor');
    
    const supervisorsBody = document.getElementById('supervisors-body');
    supervisorsBody.innerHTML = '';
    
    supervisors.forEach(supervisor => {
        // Count projects and workers for this supervisor
        const supervisorProjects = projects.filter(p => p.supervisorId === supervisor.id).length;
        const workers = users.filter(u => u.role === 'worker' && u.supervisor === supervisor.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supervisor.name}</td>
            <td>${supervisor.taluk}</td>
            <td>${supervisor.email}<br>${supervisor.phone}</td>
            <td>${supervisorProjects}</td>
            <td>${workers}</td>
            <td>
                <button class="edit-supervisor-btn" data-id="${supervisor.id}">Edit</button>
                <button class="delete-supervisor-btn" data-id="${supervisor.id}">Delete</button>
            </td>
        `;
        
        supervisorsBody.appendChild(row);
    });
    
    // If no supervisors
    if (supervisors.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No supervisors found.</td>';
        supervisorsBody.appendChild(row);
    }
    
    // Add event listeners to buttons
    const editButtons = document.querySelectorAll('.edit-supervisor-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const supervisorId = parseInt(this.getAttribute('data-id'));
            // Edit supervisor functionality (to be implemented)
        });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-supervisor-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const supervisorId = parseInt(this.getAttribute('data-id'));
            deleteSupervisor(supervisorId);
        });
    });
}

// Load budget data
function loadBudgetData() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    
    // Calculate total budget statistics
    const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
    
    // Calculate budget utilized (based on material costs for simplicity)
    let budgetUtilized = 0;
    materials.forEach(material => {
        budgetUtilized += material.unitPrice * material.used;
    });
    
    const budgetAvailable = totalBudget - budgetUtilized;
    
    // Update statistics display
    document.getElementById('total-budget').textContent = '₹' + totalBudget.toLocaleString('en-IN');
    document.getElementById('budget-utilized').textContent = '₹' + budgetUtilized.toLocaleString('en-IN');
    document.getElementById('budget-available').textContent = '₹' + budgetAvailable.toLocaleString('en-IN');
    
    // Calculate budget by taluk
    const talukBudgets = {};
    
    projects.forEach(project => {
        if (!talukBudgets[project.taluk]) {
            talukBudgets[project.taluk] = {
                taluk: project.taluk,
                projects: 0,
                allocated: 0,
                utilized: 0
            };
        }
        
        talukBudgets[project.taluk].projects++;
        talukBudgets[project.taluk].allocated += project.budget;
        
        // Calculate utilization for this project's materials
        const projectMaterials = materials.filter(m => m.projectId === project.id);
        let projectUtilization = 0;
        projectMaterials.forEach(material => {
            projectUtilization += material.unitPrice * material.used;
        });
        
        talukBudgets[project.taluk].utilized += projectUtilization;
    });
    
    // Display budget by taluk
    const budgetTalukBody = document.getElementById('budget-taluk-body');
    budgetTalukBody.innerHTML = '';
    
    Object.values(talukBudgets).forEach(budget => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${budget.taluk}</td>
            <td>${budget.projects}</td>
            <td>₹${budget.allocated.toLocaleString('en-IN')}</td>
            <td>₹${budget.utilized.toLocaleString('en-IN')}</td>
        `;
        
        budgetTalukBody.appendChild(row);
    });
    
    // If no taluk budgets
    if (Object.keys(talukBudgets).length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">No budget data available.</td>';
        budgetTalukBody.appendChild(row);
    }
}

// Load feedback data
function loadFeedbackData() {
    const feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    const feedbackBody = document.getElementById('feedback-body');
    feedbackBody.innerHTML = '';
    
    feedback.forEach(item => {
        const user = users.find(u => u.id === item.submittedBy);
        const project = projects.find(p => p.id === item.projectId);
        
        const userName = user ? user.name : 'Unknown';
        const projectTitle = project ? project.title : 'Unknown Project';
        
        let statusBadge = '';
        switch(item.status) {
            case 'resolved':
                statusBadge = '<span class="badge badge-success">Resolved</span>';
                break;
            case 'in-progress':
                statusBadge = '<span class="badge badge-warning">In Progress</span>';
                break;
            case 'pending':
                statusBadge = '<span class="badge badge-error">Pending</span>';
                break;
            case 'rejected':
                statusBadge = '<span class="badge badge-error">Rejected</span>';
                break;
            default:
                statusBadge = '<span class="badge">' + item.status + '</span>';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userName}</td>
            <td>${projectTitle}</td>
            <td>${formatDate(item.date)}</td>
            <td>${statusBadge}</td>
            <td>${item.message}</td>
            <td>
                <button class="respond-feedback-btn" data-id="${item.id}">Respond</button>
            </td>
        `;
        
        feedbackBody.appendChild(row);
    });
    
    // If no feedback
    if (feedback.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No feedback found.</td>';
        feedbackBody.appendChild(row);
    }
    
    // Add event listeners to buttons
    const respondButtons = document.querySelectorAll('.respond-feedback-btn');
    respondButtons.forEach(button => {
        button.addEventListener('click', function() {
            const feedbackId = parseInt(this.getAttribute('data-id'));
            openRespondFeedbackModal(feedbackId);
        });
    });
}

// View project details
function viewProjectDetails(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const supervisor = users.find(u => u.id === project.supervisorId);
    const supervisorName = supervisor ? supervisor.name : 'Unknown';
    
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectMaterials = materials.filter(m => m.projectId === projectId);
    
    // Get workers assigned to this project's tasks
    const workerIds = [...new Set(projectTasks.map(t => t.assignedTo))];
    const workers = users.filter(u => workerIds.includes(u.id));
    
    // Calculate material costs
    let materialCost = 0;
    projectMaterials.forEach(material => {
        materialCost += material.unitPrice * material.used;
    });
    
    const projectDetailsContent = document.getElementById('project-details-content');
    
    let statusBadge = '';
    switch(project.status) {
        case 'completed':
            statusBadge = '<span class="badge badge-success">Completed</span>';
            break;
        case 'in-progress':
            statusBadge = '<span class="badge badge-warning">In Progress</span>';
            break;
        case 'pending-approval':
            statusBadge = '<span class="badge badge-error">Pending Approval</span>';
            break;
        default:
            statusBadge = '<span class="badge">' + project.status + '</span>';
    }
    
    let tasksHTML = '';
    projectTasks.forEach(task => {
        const worker = users.find(u => u.id === task.assignedTo);
        const workerName = worker ? worker.name : 'Unknown';
        
        let taskStatusBadge = '';
        switch(task.status) {
            case 'completed':
                taskStatusBadge = '<span class="badge badge-success">Completed</span>';
                break;
            case 'in-progress':
                taskStatusBadge = '<span class="badge badge-warning">In Progress</span>';
                break;
            case 'not-started':
                taskStatusBadge = '<span class="badge badge-error">Not Started</span>';
                break;
            default:
                taskStatusBadge = '<span class="badge">' + task.status + '</span>';
        }
        
        tasksHTML += `
            <tr>
                <td>${task.title}</td>
                <td>${workerName}</td>
                <td>${taskStatusBadge}</td>
                <td>${formatDate(task.startDate)} - ${formatDate(task.endDate)}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${task.progress}%"></div>
                        <span>${task.progress}%</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    if (projectTasks.length === 0) {
        tasksHTML = '<tr><td colspan="5" class="text-center">No tasks found for this project.</td></tr>';
    }
    
    let materialsHTML = '';
    projectMaterials.forEach(material => {
        const usedCost = material.unitPrice * material.used;
        
        materialsHTML += `
            <tr>
                <td>${material.name}</td>
                <td>${material.unit}</td>
                <td>₹${material.unitPrice.toLocaleString('en-IN')}</td>
                <td>${material.allocated}</td>
                <td>${material.used}</td>
                <td>₹${usedCost.toLocaleString('en-IN')}</td>
            </tr>
        `;
    });
    
    if (projectMaterials.length === 0) {
        materialsHTML = '<tr><td colspan="6" class="text-center">No materials found for this project.</td></tr>';
    }
    
    projectDetailsContent.innerHTML = `
        <div class="project-details">
            <div class="project-header">
                <h3>${project.title} ${statusBadge}</h3>
                <p>${project.description}</p>
            </div>
            
            <div class="project-info">
                <div class="info-group">
                    <label>Taluk:</label>
                    <span>${project.taluk}</span>
                </div>
                <div class="info-group">
                    <label>Supervisor:</label>
                    <span>${supervisorName}</span>
                </div>
                <div class="info-group">
                    <label>Timeline:</label>
                    <span>${formatDate(project.startDate)} to ${formatDate(project.endDate)}</span>
                </div>
                <div class="info-group">
                    <label>Budget:</label>
                    <span>₹${project.budget.toLocaleString('en-IN')}</span>
                </div>
                <div class="info-group">
                    <label>Material Cost (Used):</label>
                    <span>₹${materialCost.toLocaleString('en-IN')}</span>
                </div>
                <div class="info-group">
                    <label>Progress:</label>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${project.progress}%"></div>
                        <span>${project.progress}%</span>
                    </div>
                </div>
            </div>
            
            <h4>Tasks</h4>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Timeline</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasksHTML}
                    </tbody>
                </table>
            </div>
            
            <h4>Materials</h4>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Unit</th>
                            <th>Unit Price</th>
                            <th>Allocated</th>
                            <th>Used</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${materialsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Show the modal
    const modal = document.getElementById('project-details-modal');
    modal.style.display = 'block';
}

// Approve project
function approveProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
            project.approved = true;
            project.status = 'in-progress';
        }
        return project;
    });
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Reload projects data
    loadProjectsData();
    
    // Reload dashboard data
    loadDashboardData();
    
    // Show notification
    alert('Project approved successfully!');
}

// Reject project
function rejectProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Filter out the project
    const updatedProjects = projects.filter(project => project.id !== projectId);
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Reload projects data
    loadProjectsData();
    
    // Reload dashboard data
    loadDashboardData();
    
    // Show notification
    alert('Project rejected and removed from the system.');
}

// Delete supervisor
function deleteSupervisor(supervisorId) {
    if (!confirm('Are you sure you want to delete this supervisor? This action cannot be undone.')) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Check if supervisor has projects
    const supervisorProjects = projects.filter(p => p.supervisorId === supervisorId);
    if (supervisorProjects.length > 0) {
        alert('Cannot delete supervisor with assigned projects. Please reassign or delete the projects first.');
        return;
    }
    
    // Check if supervisor has workers
    const supervisorWorkers = users.filter(u => u.role === 'worker' && u.supervisor === supervisorId);
    if (supervisorWorkers.length > 0) {
        alert('Cannot delete supervisor with assigned workers. Please reassign or delete the workers first.');
        return;
    }
    
    // Filter out the supervisor
    const updatedUsers = users.filter(user => user.id !== supervisorId);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Reload supervisors data
    loadSupervisorsData();
    
    // Reload dashboard data
    loadDashboardData();
    
    // Show notification
    alert('Supervisor deleted successfully!');
}

// Open respond to feedback modal
function openRespondFeedbackModal(feedbackId) {
    const feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    if (!feedbackItem) return;
    
    document.getElementById('feedback-id').value = feedbackId;
    document.getElementById('feedback-message').value = feedbackItem.message;
    document.getElementById('feedback-status').value = feedbackItem.status;
    
    // Show the modal
    const modal = document.getElementById('respond-feedback-modal');
    modal.style.display = 'block';
}

// Respond to feedback
function respondToFeedback(feedbackId, response, status) {
    const feedback = JSON.parse(localStorage.getItem('feedback')) || [];
    
    const updatedFeedback = feedback.map(item => {
        if (item.id === feedbackId) {
            item.response = response;
            item.status = status;
            item.responseDate = new Date().toISOString().split('T')[0];
        }
        return item;
    });
    
    localStorage.setItem('feedback', JSON.stringify(updatedFeedback));
    
    // Reload feedback data
    loadFeedbackData();
    
    // Close the modal
    const modal = document.getElementById('respond-feedback-modal');
    modal.style.display = 'none';
    
    // Show notification
    alert('Response submitted successfully!');
}

// Add supervisor
function addSupervisor(name, taluk, email, phone, username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        alert('Username already exists. Please choose a different username.');
        return false;
    }
    
    // Create new supervisor
    const newSupervisor = {
        id: getNextId('nextUserId'),
        username,
        password,
        role: 'supervisor',
        name,
        taluk,
        email,
        phone,
        district: getCurrentUser().district
    };
    
    // Add to users array
    users.push(newSupervisor);
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Reload supervisors data
    loadSupervisorsData();
    
    // Reload dashboard data
    loadDashboardData();
    
    // Show notification
    alert('Supervisor added successfully!');
    
    return true;
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.style.display = 'none');
            
            // Show the selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).style.display = 'block';
        });
    });
}

// Setup modals
function setupModals() {
    // Close modal when clicking close button or outside the modal
    document.querySelectorAll('.close-btn, .close-modal-btn, .cancel-btn').forEach(element => {
        element.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Open add supervisor modal
    document.getElementById('add-supervisor-btn').addEventListener('click', function() {
        const modal = document.getElementById('add-supervisor-modal');
        modal.style.display = 'block';
    });
    
    // When clicking outside the modal content, close the modal
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Setup forms
function setupForms() {
    // Add supervisor form
    document.getElementById('add-supervisor-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('supervisor-name').value;
        const taluk = document.getElementById('supervisor-taluk').value;
        const email = document.getElementById('supervisor-email').value;
        const phone = document.getElementById('supervisor-phone').value;
        const username = document.getElementById('supervisor-username').value;
        const password = document.getElementById('supervisor-password').value;
        
        const success = addSupervisor(name, taluk, email, phone, username, password);
        
        if (success) {
            // Clear form
            this.reset();
            
            // Close modal
            document.getElementById('add-supervisor-modal').style.display = 'none';
        }
    });
    
    // Respond to feedback form
    document.getElementById('respond-feedback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const feedbackId = parseInt(document.getElementById('feedback-id').value);
        const response = document.getElementById('feedback-response').value;
        const status = document.getElementById('feedback-status').value;
        
        respondToFeedback(feedbackId, response, status);
        
        // Clear form
        this.reset();
    });
}

// Additional CSS for project details
const style = document.createElement('style');
style.textContent = `
    .project-details {
        padding: 20px;
    }
    
    .project-header {
        margin-bottom: 20px;
    }
    
    .project-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .info-group {
        display: flex;
        flex-direction: column;
    }
    
    .info-group label {
        font-weight: bold;
        margin-bottom: 5px;
        color: var(--text-light);
    }
    
    .progress-bar {
        background-color: #e9e9e9;
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
        position: relative;
        width: 100%;
    }
    
    .progress {
        background-color: var(--primary-color);
        height: 100%;
        border-radius: 10px;
    }
    
    .progress-bar span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #333;
        font-size: 12px;
        font-weight: bold;
    }
    
    h4 {
        margin-top: 30px;
        margin-bottom: 15px;
        color: var(--primary-dark);
        padding-bottom: 5px;
        border-bottom: 1px solid var(--primary-light);
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        background-color: var(--primary-color);
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
        z-index: 1100;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification-info {
        background-color: var(--primary-color);
    }
    
    .notification-success {
        background-color: var(--success-color);
    }
    
    .notification-warning {
        background-color: var(--warning-color);
    }
    
    .notification-error {
        background-color: var(--error-color);
    }
`;

document.head.appendChild(style);
