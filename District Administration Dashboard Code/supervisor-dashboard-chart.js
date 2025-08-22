
// Chart components for Supervisor Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts after user authentication is verified
    if (isLoggedIn() && getCurrentUser().role === 'supervisor') {
        // Ensure Chart.js is loaded before rendering charts
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
            script.onload = function() {
                console.log('Chart.js loaded for charts');
                renderCharts();
            };
            document.head.appendChild(script);
        } else {
            console.log('Chart.js already loaded for charts');
            renderCharts();
        }
    }
});

function renderCharts() {
    renderProjectProgressChart();
    renderBudgetAllocationChart();
}

// Render project progress chart
function renderProjectProgressChart() {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    
    // Filter projects for this supervisor
    const myProjects = projects.filter(project => project.supervisorId === currentUser.id);
    
    // Create chart container if it doesn't exist
    if (!document.getElementById('project-progress-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'project-progress-chart';
        
        // Find the correct position to insert the chart
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            const statsContainer = dashboardSection.querySelector('.stats-container');
            if (statsContainer) {
                dashboardSection.insertBefore(chartContainer, statsContainer.nextSibling);
            } else {
                dashboardSection.appendChild(chartContainer);
            }
        } else {
            // If dashboard section doesn't exist, add to body
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.appendChild(chartContainer);
            }
        }
    }
    
    // Group projects by status
    const projectStatuses = {
        'completed': myProjects.filter(p => p.status === 'completed').length,
        'in-progress': myProjects.filter(p => p.status === 'in-progress').length,
        'pending-approval': myProjects.filter(p => p.status === 'pending-approval').length,
        'not-started': myProjects.filter(p => p.status === 'not-started').length
    };
    
    // Render the chart
    const chartContainer = document.getElementById('project-progress-chart');
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    
    chartContainer.innerHTML = '<h3>Project Status Overview</h3>';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    
    try {
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Completed', 'In Progress', 'Pending Approval', 'Not Started'],
                datasets: [{
                    data: [
                        projectStatuses['completed'], 
                        projectStatuses['in-progress'], 
                        projectStatuses['pending-approval'],
                        projectStatuses['not-started']
                    ],
                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E'],
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
        
        // Add project completion timeline
        if (myProjects.length > 0) {
            renderProjectCompletionTimeline(myProjects);
        }
    } catch (error) {
        console.error('Error rendering project progress chart:', error);
        chartContainer.innerHTML += '<p class="error-message">Failed to load chart. Please refresh the page.</p>';
    }
}

// Render project completion timeline
function renderProjectCompletionTimeline(projects) {
    // Create chart container if it doesn't exist
    if (!document.getElementById('project-timeline-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'project-timeline-chart';
        
        // Find the correct position to insert the chart
        const projectsSection = document.getElementById('projects-section');
        if (projectsSection) {
            projectsSection.insertBefore(chartContainer, projectsSection.querySelector('.card'));
        } else {
            // If projects section doesn't exist, add after the progress chart
            const progressChart = document.getElementById('project-progress-chart');
            if (progressChart && progressChart.parentNode) {
                progressChart.parentNode.insertBefore(chartContainer, progressChart.nextSibling);
            }
        }
    }
    
    // Sort projects by progress
    const sortedProjects = [...projects].sort((a, b) => b.progress - a.progress);
    
    // Limit to top 5 for clarity
    const topProjects = sortedProjects.slice(0, 5);
    
    // Render the chart
    document.getElementById('project-timeline-chart').innerHTML = '<h3>Project Completion Status</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('project-timeline-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProjects.map(p => p.title),
            datasets: [{
                label: 'Progress (%)',
                data: topProjects.map(p => p.progress || 0),
                backgroundColor: topProjects.map(p => {
                    if (p.progress < 30) return '#F44336';
                    if (p.progress < 70) return '#FFC107';
                    return '#4CAF50';
                }),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
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

// Render budget allocation chart
function renderBudgetAllocationChart() {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects'));
    const materials = JSON.parse(localStorage.getItem('materials'));
    
    // Filter projects for this supervisor
    const myProjects = projects.filter(project => project.supervisorId === currentUser.id);
    
    // Create chart container if it doesn't exist
    if (!document.getElementById('budget-allocation-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'budget-allocation-chart';
        
        // Find the correct position to insert the chart
        const materialsSection = document.getElementById('materials-section');
        if (materialsSection) {
            materialsSection.insertBefore(chartContainer, materialsSection.querySelector('.card'));
        } else {
            // If materials section doesn't exist, add after the timeline chart
            const timelineChart = document.getElementById('project-timeline-chart');
            if (timelineChart && timelineChart.parentNode) {
                timelineChart.parentNode.insertBefore(chartContainer, timelineChart.nextSibling);
            }
        }
    }
    
    // Calculate budget data
    const budgetData = myProjects.map(project => {
        // Calculate material costs for this project
        const projectMaterials = materials.filter(m => m.projectId === project.id);
        let materialCost = 0;
        projectMaterials.forEach(material => {
            materialCost += material.unitPrice * material.used;
        });
        
        return {
            name: project.title,
            allocated: project.budget,
            used: materialCost
        };
    });
    
    // Sort by budget allocation (highest first)
    budgetData.sort((a, b) => b.allocated - a.allocated);
    
    // Limit to top 5 for clarity
    const topBudgets = budgetData.slice(0, 5);
    
    // Render the chart
    document.getElementById('budget-allocation-chart').innerHTML = '<h3>Budget Allocation vs Usage (Top 5 Projects)</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('budget-allocation-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topBudgets.map(b => b.name),
            datasets: [
                {
                    label: 'Allocated Budget',
                    data: topBudgets.map(b => b.allocated),
                    backgroundColor: '#4CAF50',
                    barThickness: 20,
                },
                {
                    label: 'Used Budget',
                    data: topBudgets.map(b => b.used),
                    backgroundColor: '#2196F3',
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
    
    // Add material usage chart
    renderMaterialUsageChart(myProjects, materials);
}

// Render material usage chart
function renderMaterialUsageChart(projects, materials) {
    // Create chart container if it doesn't exist
    if (!document.getElementById('material-usage-chart')) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'material-usage-chart';
        
        // Find the correct position to insert the chart
        const budgetChart = document.getElementById('budget-allocation-chart');
        if (budgetChart && budgetChart.parentNode) {
            budgetChart.parentNode.insertBefore(chartContainer, budgetChart.nextSibling);
        }
    }
    
    // Get all materials for all supervisor's projects
    const projectIds = projects.map(p => p.id);
    const projectMaterials = materials.filter(m => projectIds.includes(m.projectId));
    
    // Group materials by name and sum up the allocated and used quantities
    const materialUsage = {};
    
    projectMaterials.forEach(material => {
        if (!materialUsage[material.name]) {
            materialUsage[material.name] = {
                allocated: 0,
                used: 0
            };
        }
        
        materialUsage[material.name].allocated += material.allocated;
        materialUsage[material.name].used += material.used;
    });
    
    // Convert to array and sort by allocation (highest first)
    const materialUsageArray = Object.entries(materialUsage).map(([name, data]) => ({
        name,
        allocated: data.allocated,
        used: data.used,
        usage: data.allocated > 0 ? (data.used / data.allocated * 100) : 0
    }));
    
    materialUsageArray.sort((a, b) => b.allocated - a.allocated);
    
    // Limit to top 5 for clarity
    const topMaterials = materialUsageArray.slice(0, 5);
    
    // Render the chart
    document.getElementById('material-usage-chart').innerHTML = '<h3>Material Usage (Top 5 Materials)</h3>';
    const ctx = document.createElement('canvas');
    document.getElementById('material-usage-chart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topMaterials.map(m => m.name),
            datasets: [
                {
                    label: 'Allocated',
                    data: topMaterials.map(m => m.allocated),
                    backgroundColor: '#9C27B0',
                    barThickness: 20,
                },
                {
                    label: 'Used',
                    data: topMaterials.map(m => m.used),
                    backgroundColor: '#FF9800',
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
