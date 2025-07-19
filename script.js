// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Sample charts for visualization
window.onload = function() {
    // Histogram
    const histCtx = document.getElementById('histogram').getContext('2d');
    new Chart(histCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales Distribution',
                data: [65, 59, 80, 81, 56, 72],
                backgroundColor: 'rgba(77, 171, 247, 0.7)',
                borderColor: 'rgba(77, 171, 247, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Scatter plot
    const scatterCtx = document.getElementById('scatter').getContext('2d');
    new Chart(scatterCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Age vs Income',
                data: [
                    {x: 20, y: 30},
                    {x: 25, y: 45},
                    {x: 30, y: 60},
                    {x: 35, y: 75},
                    {x: 40, y: 85},
                    {x: 45, y: 95},
                    {x: 50, y: 90},
                    {x: 55, y: 85},
                    {x: 60, y: 75},
                    {x: 65, y: 60}
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Income (k)',
                        color: '#aaa'
                    },
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Age',
                        color: '#aaa'
                    },
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    // Bar chart
    const barCtx = document.getElementById('bar').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
            datasets: [{
                label: 'Sales Performance',
                data: [45, 60, 75, 40, 90],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
};