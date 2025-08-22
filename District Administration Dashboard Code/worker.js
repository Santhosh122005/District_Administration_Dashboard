document.addEventListener('DOMContentLoaded', function() {
    console.log('Worker dashboard script loaded');
    
    // Check if user is logged in and is a worker
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'worker') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display user name
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Initialize sidebar navigation
    initSidebarNavigation();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load tasks
    loadTasks();
    
    // Load materials
    loadProjects('material-project');
    loadMaterials();
    
    // Load feedback form and history
    loadProjects('feedback-project');
    loadFeedbackHistory();
    
    // Initialize forms
    initUpdateTaskForm();
    initUpdateMaterialForm();
    initSendFeedbackForm();
    
    // Initialize modals
    initModals();
});

// Initialize sidebar navigation
function initSidebarNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all menu items
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).style.display = 'block';
        });
    });
}

// Load dashboard data
function loadDashboardData() {
    const currentUser = getCurrentUser();
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    // Filter tasks assigned to the current worker
    const myTasks = tasks.filter(task => task.assignedTo === currentUser.id);
    
    // Update dashboard stats
    document.getElementById('total-tasks').textContent = myTasks.length;
    document.getElementById('completed-tasks').textContent = myTasks.filter(task => task.status === 'completed').length;
    document.getElementById('in-progress-tasks').textContent = myTasks.filter(task => task.status === 'in-progress').length;
    document.getElementById('pending-tasks').textContent = myTasks.filter(task => task.status === 'not-started').length;
    
    // Load current tasks table
    const currentTasksBody = document.getElementById('current-tasks-body');
    currentTasksBody.innerHTML = '';
    
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    myTasks.forEach(task => {
        const project = projects.find(project => project.id === task.projectId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${project ? project.title : 'Unknown Project'}</td>
            <td><span class="status-badge status-${task.status}">${formatStatus(task.status)}</span></td>
            <td>${formatDate(task.startDate)} - ${formatDate(task.endDate)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                    <span>${task.progress}%</span>
                </div>
            </td>
        `;
        
        currentTasksBody.appendChild(row);
    });
}

// Load tasks
function loadTasks() {
    const currentUser = getCurrentUser();
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Filter tasks assigned to the current worker
    const myTasks = tasks.filter(task => task.assignedTo === currentUser.id);
    
    // Load all tasks table
    const allTasksBody = document.getElementById('all-tasks-body');
    allTasksBody.innerHTML = '';
    
    myTasks.forEach(task => {
        const project = projects.find(project => project.id === task.projectId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${project ? project.title : 'Unknown Project'}</td>
            <td><span class="status-badge status-${task.status}">${formatStatus(task.status)}</span></td>
            <td>${formatDate(task.startDate)} - ${formatDate(task.endDate)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                    <span>${task.progress}%</span>
                </div>
            </td>
            <td>
                <button class="btn-primary btn-sm update-task-btn" data-id="${task.id}">Update Progress</button>
            </td>
        `;
        
        allTasksBody.appendChild(row);
    });
    
    // Add event listeners to update buttons
    document.querySelectorAll('.update-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            openUpdateTaskModal(taskId);
        });
    });
}

// Load projects for select elements
function loadProjects(selectId) {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Get assigned projects for this worker
    const supervisorId = currentUser.supervisor;
    const supervisor = JSON.parse(localStorage.getItem('users')).find(user => user.id === supervisorId);
    const myProjects = projects.filter(project => project.taluk === supervisor.taluk);
    
    const selectElement = document.getElementById(selectId);
    
    // Clear existing options except the first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add project options
    myProjects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        selectElement.appendChild(option);
    });
}

// Load materials
function loadMaterials() {
    const currentUser = getCurrentUser();
    const materials = JSON.parse(localStorage.getItem('materials'));
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Get project filter value
    const projectFilter = document.getElementById('material-project').value;
    
    // Get assigned projects for this worker
    const supervisorId = currentUser.supervisor;
    const supervisor = JSON.parse(localStorage.getItem('users')).find(user => user.id === supervisorId);
    const myProjects = projects.filter(project => project.taluk === supervisor.taluk);
    const projectIds = myProjects.map(project => project.id);
    
    // Filter materials by project
    let filteredMaterials = materials.filter(material => projectIds.includes(material.projectId));
    
    if (projectFilter) {
        filteredMaterials = filteredMaterials.filter(material => material.projectId === parseInt(projectFilter));
    }
    
    // Load materials table
    const materialsBody = document.getElementById('materials-body');
    materialsBody.innerHTML = '';
    
    filteredMaterials.forEach(material => {
        const project = projects.find(project => project.id === material.projectId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${material.name}</td>
            <td>${project ? project.title : 'Unknown Project'}</td>
            <td>${material.unit}</td>
            <td>${material.allocated}</td>
            <td>${material.used}</td>
            <td>
                <button class="btn-primary btn-sm update-material-btn" data-id="${material.id}">Update Usage</button>
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

// Load feedback history
function loadFeedbackHistory() {
    const currentUser = getCurrentUser();
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Filter feedback submitted by the current worker
    const myFeedback = feedback.filter(fb => fb.submittedBy === currentUser.id);
    
    // Load feedback history table
    const feedbackHistoryBody = document.getElementById('feedback-history-body');
    feedbackHistoryBody.innerHTML = '';
    
    myFeedback.forEach(fb => {
        const project = projects.find(project => project.id === fb.projectId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project ? project.title : 'Unknown Project'}</td>
            <td>${formatDate(fb.date)}</td>
            <td>${fb.message}</td>
            <td><span class="status-badge status-${fb.status === 'resolved' ? 'completed' : 'pending'}">${fb.status}</span></td>
            <td>${fb.response || '-'}</td>
        `;
        
        feedbackHistoryBody.appendChild(row);
    });
}

// Initialize update task form
function initUpdateTaskForm() {
    document.getElementById('update-task-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskId = parseInt(document.getElementById('update-task-id').value);
        const status = document.getElementById('task-status').value;
        const progress = parseInt(document.getElementById('task-progress').value);
        
        updateTaskProgress(taskId, status, progress);
        closeModal('update-task-modal');
        
        // Reload data
        loadDashboardData();
        loadTasks();
    });
    
    // Update progress value on range input change
    document.getElementById('task-progress').addEventListener('input', function() {
        document.getElementById('task-progress-value').textContent = this.value + '%';
    });
}

// Initialize update material form
function initUpdateMaterialForm() {
    document.getElementById('update-material-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const materialId = parseInt(document.getElementById('update-material-id').value);
        const used = parseInt(document.getElementById('material-used').value);
        
        updateMaterialUsage(materialId, used);
        closeModal('update-material-modal');
        
        // Reload data
        loadMaterials();
    });
}

// Initialize send feedback form
function initSendFeedbackForm() {
    document.getElementById('send-feedback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectId = parseInt(document.getElementById('feedback-project').value);
        const message = document.getElementById('feedback-message').value;
        
        sendFeedback(projectId, message);
        
        // Clear form
        document.getElementById('feedback-message').value = '';
        
        // Reload data
        loadFeedbackHistory();
    });
}

// Initialize modals
function initModals() {
    // Close button event listeners
    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Cancel button event listeners
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Add event listener to material project filter
    document.getElementById('material-project').addEventListener('change', loadMaterials);
}

// Open update task modal
function openUpdateTaskModal(taskId) {
    console.log('Opening update task modal for ID:', taskId);
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) {
        console.error('Task not found with ID:', taskId);
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects.find(project => project.id === task.projectId);
    
    document.getElementById('update-task-id').value = task.id;
    document.getElementById('task-name').value = task.title;
    document.getElementById('task-project').value = project ? project.title : '';
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-progress').value = task.progress;
    document.getElementById('task-progress-value').textContent = task.progress + '%';
    
    document.getElementById('update-task-modal').style.display = 'block';
}

// Open update material modal
function openUpdateMaterialModal(materialId) {
    console.log('Opening update material modal for ID:', materialId);
    const materials = JSON.parse(localStorage.getItem('materials'));
    const material = materials.find(material => material.id === materialId);
    
    if (!material) {
        console.error('Material not found with ID:', materialId);
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects'));
    const project = projects.find(project => project.id === material.projectId);
    
    document.getElementById('update-material-id').value = material.id;
    document.getElementById('material-name').value = material.name;
    document.getElementById('material-project').value = project ? project.title : '';
    document.getElementById('material-allocated').value = material.allocated;
    document.getElementById('material-used').value = material.used;
    
    document.getElementById('update-material-modal').style.display = 'block';
}

// Update task progress
function updateTaskProgress(taskId, status, progress) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            task.status = status;
            task.progress = progress;
            
            // If task is completed, set progress to 100%
            if (status === 'completed') {
                task.progress = 100;
            }
            
            // If task is not started, set progress to 0%
            if (status === 'not-started') {
                task.progress = 0;
            }
        }
        return task;
    });
    
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Update project progress
    const task = updatedTasks.find(task => task.id === taskId);
    updateProjectProgress(task.projectId);
    
    showNotification('Task progress updated successfully');
}

// Update material usage
function updateMaterialUsage(materialId, used) {
    const materials = JSON.parse(localStorage.getItem('materials'));
    
    const material = materials.find(material => material.id === materialId);
    
    if (used > material.allocated) {
        showNotification('Used quantity cannot exceed allocated quantity', 'error');
        return;
    }
    
    const updatedMaterials = materials.map(material => {
        if (material.id === materialId) {
            material.used = used;
        }
        return material;
    });
    
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
    
    showNotification('Material usage updated successfully');
}

// Send feedback
function sendFeedback(projectId, message) {
    const currentUser = getCurrentUser();
    const feedback = JSON.parse(localStorage.getItem('feedback'));
    const nextFeedbackId = getNextId('nextFeedbackId');
    
    const newFeedback = {
        id: nextFeedbackId,
        submittedBy: currentUser.id,
        projectId: projectId,
        message: message,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        response: null
    };
    
    feedback.push(newFeedback);
    localStorage.setItem('feedback', JSON.stringify(feedback));
    
    showNotification('Feedback sent successfully');
}

// Format status
function formatStatus(status) {
    switch (status) {
        case 'not-started':
            return 'Not Started';
        case 'in-progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        default:
            return status;
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
