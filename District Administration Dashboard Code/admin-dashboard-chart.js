
// Chart components for Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts after user authentication is verified
    if (isLoggedIn() && getCurrentUser().role === 'admin') {
        renderDistrictProgressChart();
        renderTalukBudgetChart();
        renderProjectStatusChart();
    }
});

// Render district progress chart
function renderDistrictProgressChart() {
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Create chart container if it doesn't exist
    if (!document.getElementById('district-progress-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'district-progress-chart';
        
        // Find the correct position to insert the chart
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.insertBefore(chartContainer, dashboardSection.querySelector('.stats-container').nextSibling);
        }
    }
    
    // Group projects by taluk
    const talukData = {};
    projects.forEach(project => {
        if (!talukData[project.taluk]) {
            talukData[project.taluk] = {
                projects: 0,
                completed: 0,
                inProgress: 0,
                totalProgress: 0
            };
        }
        
        talukData[project.taluk].projects++;
        talukData[project.taluk].totalProgress += project.progress;
        
        if (project.status === 'completed') {
            talukData[project.taluk].completed++;
        } else if (project.status === 'in-progress') {
            talukData[project.taluk].inProgress++;
        }
    });
    
    // Calculate average progress for each taluk
    Object.values(talukData).forEach(data => {
        data.averageProgress = data.projects > 0 ? Math.round(data.totalProgress / data.projects) : 0;
    });
    
    // Prepare data for chart
    const taluks = Object.keys(talukData);
    const averageProgressData = taluks.map(taluk => talukData[taluk].averageProgress);
    
    // Render the chart
    document.getElementById('district-progress-chart').innerHTML = '<h3>District-wide Progress by Taluk</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('district-progress-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: taluks,
            datasets: [{
                label: 'Average Project Progress (%)',
                data: averageProgressData,
                backgroundColor: '#2196F3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Render taluk budget allocation chart
function renderTalukBudgetChart() {
    const projects = JSON.parse(localStorage.getItem('projects'));
    const materials = JSON.parse(localStorage.getItem('materials'));
    
    // Create chart container if it doesn't exist
    if (!document.getElementById('taluk-budget-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'taluk-budget-chart';
        
        // Find the correct position to insert the chart
        const budgetSection = document.getElementById('budget-section');
        if (budgetSection) {
            budgetSection.insertBefore(chartContainer, budgetSection.querySelector('.card'));
        }
    }
    
    // Group budget data by taluk
    const talukBudgets = {};
    
    projects.forEach(project => {
        if (!talukBudgets[project.taluk]) {
            talukBudgets[project.taluk] = {
                allocated: 0,
                utilized: 0
            };
        }
        
        talukBudgets[project.taluk].allocated += project.budget;
        
        // Calculate utilization for this project's materials
        const projectMaterials = materials.filter(m => m.projectId === project.id);
        let projectUtilization = 0;
        projectMaterials.forEach(material => {
            projectUtilization += material.unitPrice * material.used;
        });
        
        talukBudgets[project.taluk].utilized += projectUtilization;
    });
    
    // Prepare data for chart
    const taluks = Object.keys(talukBudgets);
    const allocatedData = taluks.map(taluk => talukBudgets[taluk].allocated);
    const utilizedData = taluks.map(taluk => talukBudgets[taluk].utilized);
    
    // Render the chart
    document.getElementById('taluk-budget-chart').innerHTML = '<h3>Budget Allocation vs Utilization by Taluk</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('taluk-budget-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: taluks,
            datasets: [
                {
                    label: 'Allocated Budget (₹)',
                    data: allocatedData,
                    backgroundColor: '#4CAF50',
                    barThickness: 20,
                },
                {
                    label: 'Utilized Budget (₹)',
                    data: utilizedData,
                    backgroundColor: '#FFC107',
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + context.raw.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// Render project status chart
function renderProjectStatusChart() {
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Create chart container if it doesn't exist
    if (!document.getElementById('project-status-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'project-status-chart';
        
        // Find the correct position to insert the chart
        const projectsSection = document.getElementById('projects-section');
        if (projectsSection) {
            projectsSection.insertBefore(chartContainer, projectsSection.querySelector('.card'));
        }
    }
    
    // Count projects by status
    const statusCounts = {
        'completed': projects.filter(p => p.status === 'completed').length,
        'in-progress': projects.filter(p => p.status === 'in-progress').length,
        'pending-approval': projects.filter(p => p.status === 'pending-approval').length
    };
    
    // Render the chart
    document.getElementById('project-status-chart').innerHTML = '<h3>Project Status Distribution</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('project-status-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending Approval'],
            datasets: [{
                data: [statusCounts.completed, statusCounts['in-progress'], statusCounts['pending-approval']],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}
