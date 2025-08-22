
// Initialize local storage with demo data if it doesn't exist
function initializeData() {
    if (!localStorage.getItem('users')) {
        const users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'District Collector',
                district: 'Central District',
                email: 'collector@district.gov',
                phone: '9876543210'
            },
            {
                id: 2,
                username: 'supervisor1',
                password: 'super123',
                role: 'supervisor',
                name: 'Raj Kumar',
                taluk: 'North Taluk',
                email: 'raj@district.gov',
                phone: '9876543211',
                district: 'Central District'
            },
            {
                id: 3,
                username: 'worker1',
                password: 'work123',
                role: 'worker',
                name: 'Vijay Singh',
                taluk: 'North Taluk',
                email: 'vijay@district.gov',
                phone: '9876543212',
                supervisor: 2
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));

        const projects = [
            {
                id: 1,
                title: 'Road Construction Phase 1',
                description: 'Construction of 5km road connecting villages A and B',
                status: 'in-progress',
                budget: 500000,
                taluk: 'North Taluk',
                supervisorId: 2,
                startDate: '2025-04-01',
                endDate: '2025-06-30',
                progress: 35,
                approved: true
            },
            {
                id: 2,
                title: 'School Building Renovation',
                description: 'Renovation of government school in Village C',
                status: 'pending-approval',
                budget: 300000,
                taluk: 'North Taluk',
                supervisorId: 2,
                startDate: '2025-05-15',
                endDate: '2025-08-15',
                progress: 0,
                approved: false
            }
        ];
        localStorage.setItem('projects', JSON.stringify(projects));

        const tasks = [
            {
                id: 1,
                projectId: 1,
                title: 'Land clearing and preparation',
                description: 'Clear vegetation and prepare the ground for road construction',
                assignedTo: 3,
                status: 'completed',
                startDate: '2025-04-01',
                endDate: '2025-04-15',
                progress: 100
            },
            {
                id: 2,
                projectId: 1,
                title: 'Laying foundation',
                description: 'Lay the foundation for the road',
                assignedTo: 3,
                status: 'in-progress',
                startDate: '2025-04-16',
                endDate: '2025-05-15',
                progress: 60
            }
        ];
        localStorage.setItem('tasks', JSON.stringify(tasks));

        const materials = [
            {
                id: 1,
                name: 'Cement',
                unit: 'bags',
                unitPrice: 350,
                projectId: 1,
                allocated: 500,
                used: 200
            },
            {
                id: 2,
                name: 'Sand',
                unit: 'cubic meters',
                unitPrice: 2000,
                projectId: 1,
                allocated: 50,
                used: 20
            }
        ];
        localStorage.setItem('materials', JSON.stringify(materials));

        const feedback = [
            {
                id: 1,
                submittedBy: 3,
                projectId: 1,
                message: 'Need additional workers for the road construction project',
                date: '2025-04-10',
                status: 'pending'
            }
        ];
        localStorage.setItem('feedback', JSON.stringify(feedback));

        // Set next IDs
        localStorage.setItem('nextUserId', '4');
        localStorage.setItem('nextProjectId', '3');
        localStorage.setItem('nextTaskId', '3');
        localStorage.setItem('nextMaterialId', '3');
        localStorage.setItem('nextFeedbackId', '2');
    }
}

// Authentication function
function authenticate(username, password, role) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password && u.role === role);
    
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    
    return false;
}

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser'));
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Redirect based on role
function redirectToDashboard(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'supervisor':
            window.location.href = 'supervisor-dashboard.html';
            break;
        case 'worker':
            window.location.href = 'worker-dashboard.html';
            break;
        default:
            break;
    }
}

// Initialize data
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Check if we're on the login page
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const errorMessage = document.getElementById('error-message');
            
            if (!username || !password) {
                errorMessage.textContent = 'Please enter both username and password';
                return;
            }
            
            if (authenticate(username, password, role)) {
                redirectToDashboard(role);
            } else {
                errorMessage.textContent = 'Invalid username, password, or role';
            }
        });

        // Add enter key press event listener for login
        document.getElementById('password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }
    
    // Check if user is logged in on dashboard pages
    const isDashboardPage = window.location.href.includes('dashboard');
    if (isDashboardPage && !isLoggedIn()) {
        window.location.href = 'index.html';
    } else if (isDashboardPage) {
        // Display user information on dashboard pages
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            const currentUser = getCurrentUser();
            userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
        }
    }
    
    // Logout button functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

function calculateProjectProgress(projectId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    if (projectTasks.length === 0) return 0;
    
    const totalProgress = projectTasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / projectTasks.length);
}

function updateProjectProgress(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const progress = calculateProjectProgress(projectId);
    
    const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
            project.progress = progress;
        }
        return project;
    });
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    return progress;
}

// Generate unique IDs
function getNextId(key) {
    const nextId = parseInt(localStorage.getItem(key));
    localStorage.setItem(key, (nextId + 1).toString());
    return nextId;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
