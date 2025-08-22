
// Fix for view, edit, update, and delete buttons
document.addEventListener('DOMContentLoaded', function() {
    console.log('Button fixes script loaded');
    
    // Fix view project buttons in admin dashboard
    fixViewProjectButtons();
    
    // Fix edit and delete supervisor buttons
    fixSupervisorButtons();
    
    // Fix respond to feedback buttons
    fixFeedbackButtons();
    
    // Add event delegation for dynamically added buttons
    document.addEventListener('click', function(e) {
        // Handle view project button clicks
        if (e.target.classList.contains('view-project-btn')) {
            const projectId = parseInt(e.target.getAttribute('data-id'));
            console.log('View project button clicked for ID:', projectId);
            if (typeof viewProjectDetails === 'function') {
                viewProjectDetails(projectId);
            }
        }
        
        // Handle edit project button clicks
        if (e.target.classList.contains('edit-project-btn')) {
            const projectId = parseInt(e.target.getAttribute('data-id'));
            console.log('Edit project button clicked for ID:', projectId);
            if (typeof editProjectDetails === 'function') {
                editProjectDetails(projectId);
            }
        }
        
        // Handle edit supervisor button clicks
        if (e.target.classList.contains('edit-supervisor-btn')) {
            const supervisorId = parseInt(e.target.getAttribute('data-id'));
            console.log('Edit supervisor button clicked for ID:', supervisorId);
            if (typeof openEditSupervisorModal === 'function') {
                openEditSupervisorModal(supervisorId);
            }
        }
        
        // Handle delete supervisor button clicks
        if (e.target.classList.contains('delete-supervisor-btn')) {
            const supervisorId = parseInt(e.target.getAttribute('data-id'));
            console.log('Delete supervisor button clicked for ID:', supervisorId);
            if (typeof deleteSupervisor === 'function') {
                deleteSupervisor(supervisorId);
            }
        }
        
        // Handle respond to feedback button clicks
        if (e.target.classList.contains('respond-feedback-btn')) {
            const feedbackId = parseInt(e.target.getAttribute('data-id'));
            console.log('Respond feedback button clicked for ID:', feedbackId);
            if (typeof openRespondFeedbackModal === 'function') {
                openRespondFeedbackModal(feedbackId);
            }
        }
        
        // Handle update task button clicks
        if (e.target.classList.contains('update-task-btn')) {
            const taskId = parseInt(e.target.getAttribute('data-id'));
            console.log('Update task button clicked for ID:', taskId);
            if (typeof openUpdateTaskModal === 'function') {
                openUpdateTaskModal(taskId);
            }
        }
        
        // Handle update material button clicks
        if (e.target.classList.contains('update-material-btn')) {
            const materialId = parseInt(e.target.getAttribute('data-id'));
            console.log('Update material button clicked for ID:', materialId);
            if (typeof openUpdateMaterialModal === 'function') {
                openUpdateMaterialModal(materialId);
            }
        }
        
        // Handle view worker button clicks
        if (e.target.classList.contains('view-worker-btn')) {
            const workerId = parseInt(e.target.getAttribute('data-id'));
            console.log('View worker button clicked for ID:', workerId);
            if (typeof viewWorkerDetails === 'function') {
                viewWorkerDetails(workerId);
            }
        }
        
        // Handle edit worker button clicks
        if (e.target.classList.contains('edit-worker-btn')) {
            const workerId = parseInt(e.target.getAttribute('data-id'));
            console.log('Edit worker button clicked for ID:', workerId);
            if (typeof editWorkerDetails === 'function') {
                editWorkerDetails(workerId);
            }
        }
    });
});

// Fix view project buttons
function fixViewProjectButtons() {
    const viewButtons = document.querySelectorAll('.view-project-btn');
    console.log('Found view project buttons:', viewButtons.length);
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            console.log('View project button clicked with ID:', projectId);
            if (typeof viewProjectDetails === 'function') {
                viewProjectDetails(projectId);
            }
        });
    });
}

// Fix supervisor buttons
function fixSupervisorButtons() {
    const editButtons = document.querySelectorAll('.edit-supervisor-btn');
    console.log('Found edit supervisor buttons:', editButtons.length);
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const supervisorId = parseInt(this.getAttribute('data-id'));
            console.log('Edit supervisor button clicked with ID:', supervisorId);
            if (typeof openEditSupervisorModal === 'function') {
                openEditSupervisorModal(supervisorId);
            }
        });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-supervisor-btn');
    console.log('Found delete supervisor buttons:', deleteButtons.length);
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const supervisorId = parseInt(this.getAttribute('data-id'));
            console.log('Delete supervisor button clicked with ID:', supervisorId);
            if (typeof deleteSupervisor === 'function') {
                deleteSupervisor(supervisorId);
            }
        });
    });
}

// Fix feedback buttons
function fixFeedbackButtons() {
    const respondButtons = document.querySelectorAll('.respond-feedback-btn');
    console.log('Found respond feedback buttons:', respondButtons.length);
    respondButtons.forEach(button => {
        button.addEventListener('click', function() {
            const feedbackId = parseInt(this.getAttribute('data-id'));
            console.log('Respond feedback button clicked with ID:', feedbackId);
            if (typeof openRespondFeedbackModal === 'function') {
                openRespondFeedbackModal(feedbackId);
            }
        });
    });
}

// View worker details function (for supervisor dashboard)
function viewWorkerDetails(workerId) {
    console.log('View worker details function called with ID:', workerId);
    if (typeof getCurrentUser !== 'function') return;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const worker = users.find(user => user.id === workerId);
    
    if (!worker) {
        if (typeof showNotification === 'function') {
            showNotification('Worker not found', 'error');
        }
        return;
    }
    
    // Create modal for worker details if it doesn't exist
    let modal = document.getElementById('view-worker-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'view-worker-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Worker Details</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="worker-details">
                    <h3 id="view-worker-name"></h3>
                    <div class="worker-info">
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span id="view-worker-email"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span id="view-worker-phone"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tasks Assigned:</span>
                            <span id="view-worker-tasks"></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tasks Completed:</span>
                            <span id="view-worker-completed"></span>
                        </div>
                    </div>
                    <div class="task-list">
                        <h4>Assigned Tasks</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Timeline</th>
                                </tr>
                            </thead>
                            <tbody id="worker-tasks-body">
                                <!-- Worker tasks will be loaded here -->
                            </tbody>
                        </table>
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
    
    // Get worker tasks
    const workerTasks = tasks.filter(task => task.assignedTo === worker.id);
    const completedTasks = workerTasks.filter(task => task.status === 'completed').length;
    
    // Fill modal with worker data
    document.getElementById('view-worker-name').textContent = worker.name;
    document.getElementById('view-worker-email').textContent = worker.email;
    document.getElementById('view-worker-phone').textContent = worker.phone;
    document.getElementById('view-worker-tasks').textContent = workerTasks.length;
    document.getElementById('view-worker-completed').textContent = completedTasks;
    
    // Fill tasks table
    const tasksBody = document.getElementById('worker-tasks-body');
    tasksBody.innerHTML = '';
    
    if (workerTasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">No tasks assigned</td>';
        tasksBody.appendChild(row);
    } else {
        workerTasks.forEach(task => {
            const row = document.createElement('tr');
            
            const progress = task.progress || 0;
            const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';
            
            row.innerHTML = `
                <td>${task.title}</td>
                <td><span class="status-badge status-${task.status}">${formatStatus ? formatStatus(task.status) : task.status}</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                        <span>${progress}%</span>
                    </div>
                </td>
                <td>${formatDate ? formatDate(task.startDate) : task.startDate} - ${formatDate ? formatDate(task.endDate) : task.endDate}</td>
            `;
            
            tasksBody.appendChild(row);
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Edit worker details function (for supervisor dashboard)
function editWorkerDetails(workerId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const worker = users.find(user => user.id === workerId);
    
    if (!worker) {
        if (typeof showNotification === 'function') {
            showNotification('Worker not found', 'error');
        }
        return;
    }
    
    // Create modal for editing worker if it doesn't exist
    let modal = document.getElementById('edit-worker-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-worker-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Worker</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <form id="edit-worker-form">
                    <input type="hidden" id="edit-worker-id">
                    <div class="form-row">
                        <div class="input-group">
                            <label for="edit-worker-name">Full Name</label>
                            <input type="text" id="edit-worker-name" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="input-group">
                            <label for="edit-worker-email">Email</label>
                            <input type="email" id="edit-worker-email" required>
                        </div>
                        <div class="input-group">
                            <label for="edit-worker-phone">Phone</label>
                            <input type="text" id="edit-worker-phone" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="edit-worker-username">Username</label>
                        <input type="text" id="edit-worker-username" readonly>
                    </div>
                    <div class="input-group">
                        <label for="edit-worker-password">New Password (leave blank to keep current)</label>
                        <input type="password" id="edit-worker-password">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="submit-btn">Save Changes</button>
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
        
        // Add form submission handler
        modal.querySelector('#edit-worker-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = parseInt(document.getElementById('edit-worker-id').value);
            const name = document.getElementById('edit-worker-name').value;
            const email = document.getElementById('edit-worker-email').value;
            const phone = document.getElementById('edit-worker-phone').value;
            const password = document.getElementById('edit-worker-password').value;
            
            updateWorker(id, name, email, phone, password);
            modal.style.display = 'none';
        });
    }
    
    // Fill form with worker data
    document.getElementById('edit-worker-id').value = worker.id;
    document.getElementById('edit-worker-name').value = worker.name;
    document.getElementById('edit-worker-email').value = worker.email;
    document.getElementById('edit-worker-phone').value = worker.phone;
    document.getElementById('edit-worker-username').value = worker.username;
    
    // Show the modal
    modal.style.display = 'block';
}

// Update worker
function updateWorker(id, name, email, phone, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    
    const updatedUsers = users.map(user => {
        if (user.id === id) {
            user.name = name;
            user.email = email;
            user.phone = phone;
            
            // Update password if provided
            if (password.trim()) {
                user.password = password;
            }
        }
        return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Reload workers data if the function exists
    if (typeof loadWorkersData === 'function') {
        loadWorkersData();
    }
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Worker updated successfully', 'success');
    }
}

// Helper function for formatting status (for worker view)
function formatStatus(status) {
    switch (status) {
        case 'not-started': return 'Not Started';
        case 'in-progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'pending-approval': return 'Pending Approval';
        default: return status;
    }
}
