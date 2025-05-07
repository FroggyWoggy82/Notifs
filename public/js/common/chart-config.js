

document.addEventListener('DOMContentLoaded', function() {

    setTimeout(function() {
        if (typeof Chart !== 'undefined') {
            console.log('[Chart Config] Configuring global Chart.js defaults');

            const formatLargeNumber = (value) => {
                if (!value && value !== 0) return '';

                if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'k';
                }
                return value;
            };

            Chart.defaults.font.family = "'Roboto', 'Helvetica', 'Arial', sans-serif";
            Chart.defaults.font.size = 12;
            Chart.defaults.color = '#e0e0e0'; // Light text for dark theme

            Chart.defaults.scales.linear.beginAtZero = true;

            Chart.defaults.scales.linear.grid = {
                color: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
            };

            Chart.defaults.backgroundColor = 'rgba(0, 230, 118, 0.2)';
            Chart.defaults.borderColor = '#00E676';

            Chart.defaults.scales.linear.ticks = {
                precision: 0,
                callback: function(value, index, values) {
                    return formatLargeNumber(value);
                }
            };

            Chart.defaults.plugins.tooltip.callbacks = {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }

                    const value = context.parsed.y;
                    if (value !== null && value !== undefined) {

                        label += value.toLocaleString();

                        if (value >= 1000) {
                            label += ` (${formatLargeNumber(value)})`;
                        }
                    }

                    return label;
                }
            };



            console.log('[Chart Config] Chart.js global defaults configured successfully');
        } else {
            console.warn('[Chart Config] Chart.js not loaded, skipping global configuration');
        }
    }, 1000); // Wait 1 second to ensure Chart.js is fully loaded
});

window.createScaledChart = function(ctx, type, data, options = {}) {

    let maxValue = 100; // Default if no data

    if (data && data.datasets && data.datasets.length > 0) {

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

            maxValue = maxValue * 1.2;
        }
    }

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

    return new Chart(ctx, {
        type: type,
        data: data,
        options: mergedOptions
    });
};
