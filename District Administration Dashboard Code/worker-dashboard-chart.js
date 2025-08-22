
// Task Progress Chart for Worker Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts after user authentication is verified
    if (isLoggedIn() && getCurrentUser().role === 'worker') {
        renderTaskProgressChart();
        renderMaterialUsageChart();
    }
});

// Render task progress chart
function renderTaskProgressChart() {
    const currentUser = getCurrentUser();
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    // Filter tasks assigned to the current worker
    const myTasks = tasks.filter(task => task.assignedTo === currentUser.id);
    
    // Count tasks by status
    const completedTasks = myTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = myTasks.filter(task => task.status === 'not-started').length;
    
    // Create chart container if it doesn't exist
    if (!document.getElementById('task-progress-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'task-progress-chart';
        
        // Find the correct position to insert the chart
        const dashboardSection = document.getElementById('dashboard-section');
        dashboardSection.insertBefore(chartContainer, dashboardSection.querySelector('.card'));
    }
    
    // Prepare data for the chart
    const data = [
        { name: 'Completed', value: completedTasks, color: '#4CAF50' },
        { name: 'In Progress', value: inProgressTasks, color: '#FFC107' },
        { name: 'Not Started', value: pendingTasks, color: '#F44336' }
    ];
    
    // Create chart using Chart.js
    const ctx = document.createElement('canvas');
    document.getElementById('task-progress-chart').innerHTML = '<h3>Task Status Distribution</h3>';
    document.getElementById('task-progress-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: data.map(item => item.color),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Render material usage chart
function renderMaterialUsageChart() {
    const currentUser = getCurrentUser();
    const materials = JSON.parse(localStorage.getItem('materials'));
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Get supervisor ID and fetch projects for this worker
    const supervisorId = currentUser.supervisor;
    const supervisor = JSON.parse(localStorage.getItem('users')).find(user => user.id === supervisorId);
    const myProjects = projects.filter(project => project.taluk === supervisor.taluk);
    const projectIds = myProjects.map(project => project.id);
    
    // Filter materials by project
    const workerMaterials = materials.filter(material => projectIds.includes(material.projectId));
    
    // Create a chart container in the materials section if it doesn't exist
    if (!document.getElementById('material-usage-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'material-usage-chart';
        
        // Find the correct position to insert the chart
        const materialsSection = document.getElementById('materials-section');
        materialsSection.insertBefore(chartContainer, materialsSection.querySelector('.card'));
    }
    
    // Group materials by type and calculate usage percentage
    const materialUsageData = workerMaterials.map(material => {
        const usagePercentage = (material.used / material.allocated) * 100;
        return {
            name: material.name,
            used: material.used,
            allocated: material.allocated,
            percentage: Math.round(usagePercentage),
            project: projects.find(p => p.id === material.projectId)?.title || 'Unknown'
        };
    });
    
    // Sort by usage percentage
    materialUsageData.sort((a, b) => b.percentage - a.percentage);
    
    // Limit to top 5 for clarity
    const topMaterials = materialUsageData.slice(0, 5);
    
    // Create chart container
    document.getElementById('material-usage-chart').innerHTML = '<h3>Material Usage (Top 5)</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('material-usage-chart').appendChild(ctx);
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topMaterials.map(m => m.name),
            datasets: [
                {
                    label: 'Used',
                    data: topMaterials.map(m => m.used),
                    backgroundColor: '#36A2EB',
                    barThickness: 20,
                },
                {
                    label: 'Allocated',
                    data: topMaterials.map(m => m.allocated),
                    backgroundColor: '#FFCE56',
                    barThickness: 20,
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}
