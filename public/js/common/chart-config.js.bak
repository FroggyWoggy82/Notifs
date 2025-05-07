// Global Chart.js configuration for better handling of large numbers

// Wait for Chart.js to load
document.addEventListener('DOMContentLoaded', function() {
    // Give time for Chart.js to fully initialize
    setTimeout(function() {
        if (typeof Chart !== 'undefined') {
            console.log('[Chart Config] Configuring global Chart.js defaults');

            // Helper function to format large numbers
            const formatLargeNumber = (value) => {
                if (!value && value !== 0) return '';

                if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'k';
                }
                return value;
            };

            // Set global defaults for all charts
            Chart.defaults.font.family = "'Roboto', 'Helvetica', 'Arial', sans-serif";
            Chart.defaults.font.size = 12;
            Chart.defaults.color = '#e0e0e0'; // Light text for dark theme

            // Configure scale defaults
            Chart.defaults.scales.linear.beginAtZero = true;

            // Set dark theme colors for grid lines and ticks
            Chart.defaults.scales.linear.grid = {
                color: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
            };

            // Set dark theme colors for the chart
            Chart.defaults.backgroundColor = 'rgba(0, 230, 118, 0.2)';
            Chart.defaults.borderColor = '#00E676';

            // Configure tick callbacks for y-axis
            Chart.defaults.scales.linear.ticks = {
                precision: 0,
                callback: function(value, index, values) {
                    return formatLargeNumber(value);
                }
            };

            // Configure tooltip callbacks
            Chart.defaults.plugins.tooltip.callbacks = {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }

                    const value = context.parsed.y;
                    if (value !== null && value !== undefined) {
                        // Always show full value in tooltip
                        label += value.toLocaleString();

                        // Add formatted version for readability if value is large
                        if (value >= 1000) {
                            label += ` (${formatLargeNumber(value)})`;
                        }
                    }

                    return label;
                }
            };

            // Skip annotation plugin registration here - it's handled in food.html
            // This avoids potential double registration issues

            console.log('[Chart Config] Chart.js global defaults configured successfully');
        } else {
            console.warn('[Chart Config] Chart.js not loaded, skipping global configuration');
        }
    }, 1000); // Wait 1 second to ensure Chart.js is fully loaded
});

// Function to create a chart with proper scaling for large numbers
window.createScaledChart = function(ctx, type, data, options = {}) {
    // Calculate appropriate y-axis range
    let maxValue = 100; // Default if no data

    if (data && data.datasets && data.datasets.length > 0) {
        // Find the maximum value across all datasets
        const allValues = [];
        data.datasets.forEach(dataset => {
            if (dataset.data && dataset.data.length > 0) {
                dataset.data.forEach(val => {
                    if (!isNaN(val) && val !== null && val !== undefined) {
                        allValues.push(val);
                    }
                });
            }
        });

        if (allValues.length > 0) {
            maxValue = Math.max(...allValues);
            // Add padding to the max value (20% padding)
            maxValue = maxValue * 1.2;
        }
    }

    // Merge provided options with our defaults
    const mergedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500 // Faster animation for better responsiveness
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMin: 0,
                suggestedMax: maxValue,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                },
                ticks: {
                    color: '#e0e0e0'
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                },
                ticks: {
                    color: '#e0e0e0'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 30, 30, 0.9)',
                titleColor: '#00E676',
                bodyColor: '#e0e0e0',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        ...options
    };

    // Create and return the chart
    return new Chart(ctx, {
        type: type,
        data: data,
        options: mergedOptions
    });
};
