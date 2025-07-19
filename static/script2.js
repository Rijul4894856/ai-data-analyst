// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Chart.js demo visualizations
window.onload = function () {
    // Histogram
    // const histCtx = document.getElementById('histogram').getContext('2d');
    // new Chart(histCtx, {
    //     type: 'bar',
    //     data: {
    //         labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //         datasets: [{
    //             label: 'Sales Distribution',
    //             data: [65, 59, 80, 81, 56, 72],
    //             backgroundColor: 'rgba(77, 171, 247, 0.7)',
    //             borderColor: 'rgba(77, 171, 247, 1)',
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         plugins: {
    //             legend: { labels: { color: '#fff' } }
    //         },
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //                 ticks: { color: '#aaa' },
    //                 grid: { color: 'rgba(255, 255, 255, 0.1)' }
    //             },
    //             x: {
    //                 ticks: { color: '#aaa' },
    //                 grid: { color: 'rgba(255, 255, 255, 0.1)' }
    //             }
    //         }
    //     }
    // });

    // // Scatter Plot
    // const scatterCtx = document.getElementById('scatter').getContext('2d');
    // new Chart(scatterCtx, {
    //     type: 'scatter',
    //     data: {
    //         datasets: [{
    //             label: 'Age vs Income',
    //             data: [
    //                 { x: 20, y: 30 }, { x: 25, y: 45 }, { x: 30, y: 60 },
    //                 { x: 35, y: 75 }, { x: 40, y: 85 }, { x: 45, y: 95 },
    //                 { x: 50, y: 90 }, { x: 55, y: 85 }, { x: 60, y: 75 }, { x: 65, y: 60 }
    //             ],
    //             backgroundColor: 'rgba(255, 99, 132, 0.7)',
    //             borderColor: 'rgba(255, 99, 132, 1)',
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         plugins: {
    //             legend: { labels: { color: '#fff' } }
    //         },
    //         scales: {
    //             y: {
    //                 title: { display: true, text: 'Income (k)', color: '#aaa' },
    //                 ticks: { color: '#aaa' },
    //                 grid: { color: 'rgba(255, 255, 255, 0.1)' }
    //             },
    //             x: {
    //                 title: { display: true, text: 'Age', color: '#aaa' },
    //                 ticks: { color: '#aaa' },
    //                 grid: { color: 'rgba(255, 255, 255, 0.1)' }
    //             }
    //         }
    //     }
    // });

    // // Bar Chart
    // const barCtx = document.getElementById('bar').getContext('2d');
    // new Chart(barCtx, {
    //     type: 'bar',
    //     data: {
    //         labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    //         datasets: [{
    //             label: 'Sales Performance',
    //             data: [45, 60, 75, 40, 90],
    //             backgroundColor: [
    //                 'rgba(255, 99, 132, 0.7)',
    //                 'rgba(54, 162, 235, 0.7)',
    //                 'rgba(255, 206, 86, 0.7)',
    //                 'rgba(75, 192, 192, 0.7)',
    //                 'rgba(153, 102, 255, 0.7)'
    //             ],
    //             borderColor: [
    //                 'rgba(255, 99, 132, 1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)',
    //                 'rgba(75, 192, 192, 1)',
    //                 'rgba(153, 102, 255, 1)'
    //             ],
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         plugins: {
    //             legend: { labels: { color: '#fff' } }
    //         },
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //                 ticks: { color: '#aaa' },
    //                 grid: { color: 'rgba(255, 255, 255, 0.1)' }
    //             },
    //             x: {
    //                 ticks: { color: '#aaa' },
    //                 grid: { color: 'rgba(255, 255, 255, 0.1)' }
    //             }
    //         }
    //     }
    // });

    // ✅ Upload Button Logic
    const uploadBtn = document.querySelector('.upload-btn');
    uploadBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv,.xlsx,.xls,.json,.sql';
        fileInput.click();

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                uploadBtn.innerHTML = `<i class="fas fa-check-circle"></i> ${file.name}`;

                const formData = new FormData();
                formData.append('file', file);

                fetch('http://localhost:5000/upload', {
                    method: 'POST',
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Summary from backend:', data.summary);
                        showSummary(data.summary);
                    })
                    .catch(error => {
                        alert('Something went wrong while uploading the file.');
                        console.error(error);
                    });
            }
        });
    });
};

function loadColumnDropdowns() {
    fetch('http://localhost:5000/columns')
        .then(res => res.json())
        .then(data => {
            if (data.columns) {
                const xCol = document.getElementById('x-col');
                const yCol = document.getElementById('y-col');

                xCol.innerHTML = '<option disabled selected>Select X column</option>';
                yCol.innerHTML = '<option disabled selected>Select Y column</option>';

                data.columns.forEach(col => {
                    const optX = document.createElement('option');
                    optX.value = col;
                    optX.textContent = col;
                    xCol.appendChild(optX);

                    const optY = document.createElement('option');
                    optY.value = col;
                    optY.textContent = col;
                    yCol.appendChild(optY);
                });
            }
        })
        .catch(err => {
            console.error("Error fetching columns:", err);
        });
}


// ✅ Function to display summary from backend
function showSummary(summaryData) {
    const basicTab = document.getElementById('basic');

    // Remove old summary box if present
    const oldBox = document.querySelector('.summary-box');
    if (oldBox) oldBox.remove();

    // If toggle button already exists, do not recreate
    let toggleCard = document.getElementById('summary-toggle-btn');
    if (!toggleCard) {
        // Create toggle card button
        toggleCard = document.createElement('div');
        toggleCard.className = 'card';
        toggleCard.id = 'summary-toggle-btn';
        toggleCard.style.cursor = 'pointer';
        toggleCard.setAttribute('data-visible', 'false');
        toggleCard.innerHTML = `
            <div class="card-header">
                <div class="card-icon"><i class="fas fa-table"></i></div>
                <h3 class="card-title">Data Summary</h3>
            </div>
            <div class="card-content">
                <p>Click to show or hide a statistical summary of your uploaded dataset.</p>
            </div>
        `;

        basicTab.appendChild(toggleCard);
    }

    // Add click functionality to toggle
    toggleCard.onclick = () => {
        const isVisible = toggleCard.getAttribute('data-visible') === 'true';

        const existingSummary = document.querySelector('.summary-box');
        if (isVisible && existingSummary) {
            existingSummary.remove();
            toggleCard.setAttribute('data-visible', 'false');
        } else {
            const summaryBox = document.createElement('div');
            summaryBox.className = 'summary-box';
            summaryBox.innerHTML = '<h2>Data Summary</h2>';

            for (const column in summaryData) {
                const stats = summaryData[column];
                const block = document.createElement('div');
                block.innerHTML = `<h4>${column}</h4><ul>` +
                    Object.entries(stats).map(([key, val]) => `<li>${key}: ${val}</li>`).join('') +
                    '</ul>';
                summaryBox.appendChild(block);
            }

            basicTab.appendChild(summaryBox);
            toggleCard.setAttribute('data-visible', 'true');
        }
    };
}

document.getElementById('clean-btn').addEventListener('click', () => {
    const form = document.getElementById('cleaning-form');

    // Collect options
    const options = {
        drop_duplicates: form.drop_duplicates.checked,
        strip_column_names: form.strip_column_names.checked,
        lowercase_columns: form.lowercase_columns.checked,
        fillna: form.fillna.value  // "na", "zero", or ""
    };

    // Send POST request to Flask backend
    fetch('http://localhost:5000/clean', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
    })
    .then(res => res.json())
    .then(data => {
        if (data.summary) {
            showSummary(data.summary); // Update the summary visually
            document.getElementById('download-link').href = 'http://localhost:5000/download';
            loadColumnDropdowns();  // Populate chart dropdowns

            alert("✅ Data cleaned successfully! Summary updated.");
        } else {
            alert("❌ Something went wrong during cleaning.");
        }

        
        
    })
    .catch(err => {
        console.error("Cleaning error:", err);
        alert("⚠️ Error connecting to backend. Is Flask running?");
    });
});

document.getElementById('plot-btn').addEventListener('click', () => {
    const chartType = document.getElementById('chart-type').value;
    const x = document.getElementById('x-col').value;
    const y = document.getElementById('y-col').value;

    // Check for histogram: only X is required
    if (chartType !== 'hist' && (!x || !y)) {
        return alert("Please select both X and Y columns.");
    } else if (chartType === 'hist' && !x) {
        return alert("Please select X column for histogram.");
    }

    const payload = { chart_type: chartType, x };
    if (chartType !== 'hist') payload.y = y;

    fetch('http://localhost:5000/plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error("Plot failed.");
        return response.blob();
    })
    .then(imageBlob => {
        const imageUrl = URL.createObjectURL(imageBlob);
        document.getElementById('plot-img').src = imageUrl;
    })
    .catch(err => {
        alert("⚠️ Chart error: " + err.message);
    });
});

// Auto-disable Y column for histogram
document.getElementById('chart-type').addEventListener('change', () => {
    const chartType = document.getElementById('chart-type').value;
    const ySelect = document.getElementById('y-col');

    if (chartType === 'hist') {
        ySelect.disabled = true;
        ySelect.value = '';
    } else {
        ySelect.disabled = false;
    }
});





