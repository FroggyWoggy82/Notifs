document.addEventListener('DOMContentLoaded', () => {
    const ingredientsList = document.getElementById('ingredients-list');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const createRecipeForm = document.getElementById('create-recipe-form');
    const recipeNameInput = document.getElementById('recipeName');
    const createRecipeStatus = document.getElementById('create-recipe-status');
    const recipeListContainer = document.getElementById('recipe-list');
    const recipesDisplayStatus = document.getElementById('recipes-display-status');

    // --- NEW: Weight Goal Elements ---
    const weightGoalForm = document.getElementById('weight-goal-form');
    const targetWeightInput = document.getElementById('targetWeight');
    const weeklyGainGoalInput = document.getElementById('weeklyGainGoal');
    const weightGoalStatus = document.getElementById('weight-goal-status');
    const weightGoalChartCanvas = document.getElementById('weight-goal-chart');
    const weightChartMessage = document.getElementById('weight-chart-message');
    const userSelector = document.getElementById('user-selector');
    const resetScaleButton = document.getElementById('reset-scale-button');
    const xAxisScaleSlider = document.getElementById('x-axis-scale');
    const yAxisScaleSlider = document.getElementById('y-axis-scale');
    const xScaleValue = document.getElementById('x-scale-value');
    const yScaleValue = document.getElementById('y-scale-value');
    let weightGoalChart = null; // To hold the Chart.js instance

    // Calorie Target Elements
    const calorieUserSelector = document.getElementById('calorie-user-selector');
    const calorieTargetInput = document.getElementById('calorie-target');
    const saveCalorieTargetBtn = document.getElementById('save-calorie-target');
    const currentCalorieTarget = document.getElementById('current-calorie-target');
    const calorieTargetStatus = document.getElementById('calorie-target-status');

    // Default scale values
    let xAxisScale = 1;
    let yAxisScale = 1;

    // Load saved user preference from localStorage or default to 1
    let currentUserId = localStorage.getItem('weightUserPreference') || 1;

    // Set the user selector to the saved preference
    if (userSelector && currentUserId) {
        userSelector.value = currentUserId;
    }
    // --- End Weight Goal Elements ---

    // Function to create HTML for a single ingredient row
    function createIngredientRowHtml() {
        return `
            <input type="text" placeholder="Ingredient Name" class="ingredient-name" required>
            <input type="number" placeholder="Calories" class="ingredient-calories" step="any" required>
            <input type="number" placeholder="Amount (g)" class="ingredient-amount" step="any" required>
            <input type="number" placeholder="Protein (g)" class="ingredient-protein" step="any" required>
            <input type="number" placeholder="Fat (g)" class="ingredient-fat" step="any" required>
            <input type="number" placeholder="Carbs (g)" class="ingredient-carbs" step="any" required>
            <input type="number" placeholder="Price" class="ingredient-price" step="any" required>
            <button type="button" class="remove-ingredient-btn">Remove</button>
        `;
    }

    // Function to add a new ingredient row to the DOM
    function addIngredientRow() {
        const ingredientItem = document.createElement('div');
        ingredientItem.classList.add('ingredient-item');
        ingredientItem.innerHTML = createIngredientRowHtml();
        ingredientsList.appendChild(ingredientItem);
        // Note: Remove button listener is handled by delegation
    }

    // Event listener for adding ingredients
    addIngredientBtn.addEventListener('click', addIngredientRow);

    // Event listener for removing ingredients (delegated to the list container)
    ingredientsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-ingredient-btn')) {
            // Prevent removing the last ingredient row
            if (ingredientsList.children.length > 1) {
                event.target.closest('.ingredient-item').remove();
            } else {
                alert("A recipe must have at least one ingredient.");
            }
        }
    });

    // Event listener for form submission
    createRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        showStatus(createRecipeStatus, 'Saving recipe...', 'info'); // Indicate processing

        const recipeName = recipeNameInput.value.trim();
        const ingredientItems = ingredientsList.querySelectorAll('.ingredient-item');
        const ingredientsData = [];
        let formIsValid = true;

        if (!recipeName) {
            showStatus(createRecipeStatus, 'Recipe name is required.', 'error');
            return;
        }

        if (ingredientItems.length === 0) {
            // This case should ideally not happen due to the remove button logic, but check anyway
            showStatus(createRecipeStatus, 'Recipe must have at least one ingredient.', 'error');
            return;
        }

        // Collect and validate ingredient data
        ingredientItems.forEach(item => {
            const name = item.querySelector('.ingredient-name').value.trim();
            const calories = parseFloat(item.querySelector('.ingredient-calories').value);
            const amount = parseFloat(item.querySelector('.ingredient-amount').value);
            const protein = parseFloat(item.querySelector('.ingredient-protein').value);
            const fat = parseFloat(item.querySelector('.ingredient-fat').value);
            const carbs = parseFloat(item.querySelector('.ingredient-carbs').value);
            const price = parseFloat(item.querySelector('.ingredient-price').value);

            if (!name || isNaN(calories) || isNaN(amount) || isNaN(protein) || isNaN(fat) || isNaN(carbs) || isNaN(price) || amount <= 0 || calories < 0 || protein < 0 || fat < 0 || carbs < 0 || price < 0) {
                formIsValid = false;
                item.style.border = '1px solid red'; // Highlight invalid rows
            } else {
                item.style.border = ''; // Clear highlight on valid rows
                ingredientsData.push({ name, calories, amount, protein, fat, carbs, price });
            }
        });

        if (!formIsValid) {
            showStatus(createRecipeStatus, 'Please fill all ingredient fields correctly (all values >= 0, amount > 0).', 'error');
            return;
        }

        // --- Send data to backend --- //
        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: recipeName, ingredients: ingredientsData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const newRecipe = await response.json();
            showStatus(createRecipeStatus, `Recipe '${newRecipe.name}' saved successfully!`, 'success');
            createRecipeForm.reset(); // Clear form fields
            // Reset ingredients list to one empty row
            ingredientsList.innerHTML = '';
            addIngredientRow();
            loadRecipes(); // Refresh the recipe list

        } catch (error) {
            console.error('Error saving recipe:', error);
            showStatus(createRecipeStatus, `Error saving recipe: ${error.message}`, 'error');
        }
    });

    // --- NEW: Weight Goal Functions --- //

    async function loadWeightGoal() {
        showStatus(weightGoalStatus, 'Loading weight goal...', 'info');
        try {
            const response = await fetch(`/api/weight/goal?user_id=${currentUserId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch goal');
            }
            const goalData = await response.json();

            // goalData might be { target_weight: null, weekly_gain_goal: null } if not set
            targetWeightInput.value = goalData.target_weight || '';
            weeklyGainGoalInput.value = goalData.weekly_gain_goal || '';
            showStatus(weightGoalStatus, '', ''); // Clear loading status

        } catch (error) {
            console.error('Error loading weight goal:', error);
            showStatus(weightGoalStatus, `Error loading goal: ${error.message}`, 'error');
        }
    }

    async function saveWeightGoal(event) {
        event.preventDefault();
        const targetWeight = parseFloat(targetWeightInput.value);
        const weeklyGain = parseFloat(weeklyGainGoalInput.value);

        if (isNaN(targetWeight) || targetWeight <= 0 || isNaN(weeklyGain) || weeklyGain === 0) {
            showStatus(weightGoalStatus, 'Please enter a valid positive number for target weight and a non-zero value for weekly goal.', 'error');
            return;
        }

        showStatus(weightGoalStatus, 'Saving goal...', 'info');
        try {
            const response = await fetch('/api/weight/goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetWeight: targetWeight,
                    weeklyGain: weeklyGain,
                    user_id: currentUserId
                })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'Failed to save goal');
            }

            const result = await response.json();
            console.log("Goal saved:", result);

            // Update inputs to reflect saved values (in case of rounding/validation on backend)
            targetWeightInput.value = result.target_weight || '';
            weeklyGainGoalInput.value = result.weekly_gain_goal || '';

            showStatus(weightGoalStatus, 'Weight goal saved successfully!', 'success');
            // Trigger graph update as the goal line might change
            loadAndRenderWeightChart();

        } catch (error) {
            console.error('Error saving weight goal:', error);
            showStatus(weightGoalStatus, `Error saving goal: ${error.message}`, 'error');
        }
    }

    // --- NEW: Weight Chart Functions --- //

    // Loads actual weight data and goal line, then renders the chart
    async function loadAndRenderWeightChart() {
        // IMPORTANT: Make sure Chart.js library is included in food.html
        // <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        if (!weightGoalChartCanvas) return;

        weightChartMessage.textContent = 'Loading chart data...';
        weightChartMessage.style.display = 'block';
        weightGoalChartCanvas.style.display = 'none'; // Hide canvas while loading
        if (weightGoalChart) weightGoalChart.destroy(); // Clear previous chart immediately

        try {
            // Fetch both logs and goal data concurrently
            const [logsResponse, goalResponse] = await Promise.all([
                fetch(`/api/weight/logs?user_id=${currentUserId}`),
                fetch(`/api/weight/goal?user_id=${currentUserId}`)
            ]);

            if (!logsResponse.ok) {
                const errorData = await logsResponse.json();
                throw new Error(errorData.error || 'Failed to fetch weight logs');
            }
            if (!goalResponse.ok) {
                const errorData = await goalResponse.json();
                throw new Error(errorData.error || 'Failed to fetch weight goal');
            }

            const weightLogs = await logsResponse.json(); // Expecting [{ log_id, log_date (YYYY-MM-DD), weight }, ...]
            const goalData = await goalResponse.json(); // Expecting { target_weight, weekly_gain_goal }

            if (!Array.isArray(weightLogs)) {
                 throw new Error('Invalid format received for weight logs.');
            }

            if (weightLogs.length === 0) {
                weightChartMessage.textContent = 'Log your weight to see the chart.';
                weightChartMessage.style.display = 'block';
                weightGoalChartCanvas.style.display = 'none';
                // No need to destroy chart again, done above
                return;
            }

            // --- Prepare data for Chart.js ---
            // Ensure logs are sorted by date (API should do this, but double-check)
            weightLogs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

            // Get today's date for the current day indicator
            const today = new Date();
            const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Check if today's date is already in the logs
            const todayInLogs = weightLogs.some(log => log.log_date === todayFormatted);

            // If today's date is not in the logs, add it to the logs array
            if (!todayInLogs) {
                // Find where to insert today's date (in chronological order)
                let insertIndex = weightLogs.length; // Default to end of array
                for (let i = 0; i < weightLogs.length; i++) {
                    if (new Date(weightLogs[i].log_date) > today) {
                        insertIndex = i;
                        break;
                    }
                }

                // Insert today's date at the appropriate position
                weightLogs.splice(insertIndex, 0, {
                    log_id: null,
                    log_date: todayFormatted,
                    weight: null // No weight data for today yet
                });

                console.log(`Added today's date (${todayFormatted}) to the chart at position ${insertIndex}`);
            }

            const histLabels = weightLogs.map(log => new Date(log.log_date + 'T00:00:00Z').toLocaleDateString()); // Use UTC date for consistency
            const actualWeightData = weightLogs.map(log => log.weight);

            // --- Generate Future Dates and Labels ---
            const futureLabels = [];
            const WEEKS_TO_PROJECT = 6; // Project ~6 weeks into the future
            const lastLogDate = new Date(weightLogs[weightLogs.length - 1].log_date + 'T00:00:00Z');

            for (let i = 1; i <= WEEKS_TO_PROJECT; i++) {
                const futureDate = new Date(lastLogDate);
                futureDate.setDate(lastLogDate.getDate() + (i * 7)); // Add weeks
                futureLabels.push(futureDate.toLocaleDateString());
            }

            // --- Combine Labels and Pad Actual Data ---
            const labels = [...histLabels, ...futureLabels];
            // Pad actual weight data with nulls for the future dates
            const paddedActualWeightData = [...actualWeightData, ...Array(futureLabels.length).fill(null)];

            // --- Calculate Full Target Weight Line (Historical + Future) ---
            const targetWeightLine = [];
            const startDate = new Date(weightLogs[0].log_date + 'T00:00:00Z'); // Use first log date as start
            const startWeight = actualWeightData[0]; // Use first log weight as start
            const targetWeight = goalData.target_weight;
            const weeklyGain = goalData.weekly_gain_goal;

            // --- Add Logging ---
            console.log("Chart: Received goalData:", goalData);
            console.log("Chart: Values for target line calculation:",
                { targetWeight, weeklyGain, startDate, startWeight });
            // --- End Logging ---

            if (targetWeight !== null && weeklyGain !== null && weeklyGain !== 0 && !isNaN(targetWeight) && !isNaN(weeklyGain)) {
                console.log("Chart: Condition to draw target line met."); // Log condition met
                // Iterate through the COMBINED labels array to calculate target for each date point
                labels.forEach(labelStr => {
                    // Convert label string back to Date object for calculation
                    // This relies on toLocaleDateString and new Date() parsing it correctly - might need adjustment based on locale
                    // A more robust way might be to store Date objects initially, then format for labels later.
                    // Let's try parsing it directly for now.
                    const currentDate = new Date(labelStr); // Attempt to parse the label string
                    if (isNaN(currentDate.getTime())) {
                        console.warn(`Could not parse date label for target line calculation: ${labelStr}`);
                        // Decide how to handle unparseable date - push null or skip?
                        targetWeightLine.push(null); // Push null if date is invalid
                        return; // Skip to next iteration
                    }

                    // Ensure currentDate uses the same time basis as startDate (e.g., UTC midnight)
                    currentDate.setUTCHours(0, 0, 0, 0);

                    const weeksDiff = (currentDate - startDate) / (1000 * 60 * 60 * 24 * 7);
                    // Only calculate projection if weeksDiff is non-negative (i.e., date is after start)
                    if (weeksDiff >= 0) {
                        const projectedWeight = startWeight + (weeksDiff * weeklyGain);

                        // Handle weight gain vs weight loss differently
                        if (weeklyGain > 0) {
                            // For weight gain, cap at target weight (which is higher than start weight)
                            targetWeightLine.push(Math.min(projectedWeight, targetWeight));
                        } else {
                            // For weight loss, cap at target weight (which is lower than start weight)
                            targetWeightLine.push(Math.max(projectedWeight, targetWeight));
                        }
                    } else {
                        // If somehow a date before start date is processed, push null
                        targetWeightLine.push(null);
                    }
                });
            } else {
                console.log("Goal not set or invalid, not drawing target line.");
                // Ensure targetWeightLine has the same length as labels, filled with nulls
                for (let i = 0; i < labels.length; i++) { targetWeightLine.push(null); }
            }
            // --- End Target Line Calculation ---

            // Pass the target weight value to the renderWeightChart function
            renderWeightChart(labels, paddedActualWeightData, targetWeightLine, parseFloat(goalData.target_weight));
            weightChartMessage.style.display = 'none'; // Hide message
            weightGoalChartCanvas.style.display = 'block'; // Show canvas

        } catch (error) {
            console.error("Error loading data for weight chart:", error);
            weightChartMessage.textContent = `Error loading chart data: ${error.message}`;
            weightChartMessage.style.color = 'red';
            weightChartMessage.style.display = 'block';
            weightGoalChartCanvas.style.display = 'none';
            // No need to destroy chart again, done above
        }
    }

    function renderWeightChart(labels, actualData, targetData, targetWeight) {
        if (!weightGoalChartCanvas) return;
        const ctx = weightGoalChartCanvas.getContext('2d');

        if (weightGoalChart) {
            weightGoalChart.destroy(); // Destroy previous instance
        }

        const datasets = [
            {
                label: 'Actual Weight (lbs)',
                data: actualData,
                borderColor: '#3498db', // Blue
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#3498db',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }
        ];

        // Add target weight line dataset if data exists
        if (targetData && targetData.length > 0) {
             datasets.push({
                 label: 'Goal Weight Path (lbs)',
                 data: targetData,
                 borderColor: '#e74c3c', // Red
                 borderDash: [5, 5], // Dashed line
                 borderWidth: 2,
                 tension: 0.3,
                 fill: false,
                 pointRadius: 0, // Hide points on target line
                 pointHoverRadius: 0 // No hover effect on target line
             });
        }

        // Find today's date in the labels array
        const today = new Date();
        const todayFormatted = today.toLocaleDateString();

        console.log('Today formatted:', todayFormatted);
        console.log('Available labels:', labels);

        // Try different date formats to find today in the labels
        let todayIndex = -1;

        // Method 1: Direct match
        todayIndex = labels.findIndex(label => label === todayFormatted);

        // Method 2: Try MM/DD/YYYY format
        if (todayIndex === -1) {
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const year = today.getFullYear();
            const altFormat = `${month}/${day}/${year}`;
            todayIndex = labels.findIndex(label => label === altFormat);
            console.log('Trying alternate format:', altFormat);
        }

        // Method 3: If still not found, find the closest date
        if (todayIndex === -1) {
            const todayTime = today.getTime();
            let closestDiff = Infinity;

            labels.forEach((label, index) => {
                try {
                    // Try to parse the date
                    let labelDate;
                    if (label.includes('/')) {
                        const parts = label.split('/');
                        if (parts.length === 3) {
                            // MM/DD/YYYY format
                            labelDate = new Date(parts[2], parts[0] - 1, parts[1]);
                        }
                    } else {
                        labelDate = new Date(label);
                    }

                    if (!isNaN(labelDate.getTime())) {
                        const diff = Math.abs(labelDate.getTime() - todayTime);
                        if (diff < closestDiff) {
                            closestDiff = diff;
                            todayIndex = index;
                        }
                    }
                } catch (e) {
                    // Skip invalid dates
                }
            });

            console.log('Found closest date at index:', todayIndex);
        }

        // Create annotations for current day indicator and target weight
        const annotations = {};

        // 1. Today's date indicator
        if (todayIndex !== -1) {
            // Today's date is in our chart labels
            annotations.todayLine = {
                type: 'line',
                xMin: todayIndex,
                xMax: todayIndex,
                borderColor: '#2ecc71', // Green color for today's line
                borderWidth: 3,
                borderDash: [6, 6],
                label: {
                    display: true,
                    content: 'TODAY',
                    position: 'start',
                    backgroundColor: '#2ecc71',
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    padding: 6
                }
            };

            console.log(`Today indicator added at index ${todayIndex} (${labels[todayIndex]})`);
        } else {
            // If we still can't find today, add indicator at the last actual data point
            let lastDataIndex = -1;
            for (let i = actualData.length - 1; i >= 0; i--) {
                if (actualData[i] !== null) {
                    lastDataIndex = i;
                    break;
                }
            }

            if (lastDataIndex !== -1) {
                annotations.todayLine = {
                    type: 'line',
                    xMin: lastDataIndex,
                    xMax: lastDataIndex,
                    borderColor: '#2ecc71', // Green color for today's line
                    borderWidth: 3,
                    borderDash: [6, 6],
                    label: {
                        display: true,
                        content: 'TODAY (approx)',
                        position: 'start',
                        backgroundColor: '#2ecc71',
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        padding: 6
                    }
                };

                console.log(`Today indicator added at last data point: ${lastDataIndex}`);
            } else {
                console.log('Could not find a suitable position for today indicator');
            }
        }

        // 2. Target weight indicator - horizontal line across the chart
        if (targetData && targetData.length > 0 && targetWeight) {
            // Make sure targetWeight is a number
            let targetWeightValue = parseFloat(targetWeight);

            if (!isNaN(targetWeightValue)) {
                annotations.targetWeightLine = {
                    type: 'line',
                    yMin: targetWeightValue,
                    yMax: targetWeightValue,
                    borderColor: '#9b59b6', // Purple color for target weight
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        display: true,
                        content: `TARGET: ${targetWeightValue.toFixed(2)} lbs`,
                        position: 'end',
                        backgroundColor: '#9b59b6',
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        padding: 6
                    }
                };

                // 3. Add a box highlight around the target weight area
                const buffer = 3; // Buffer zone of 3 pounds around target
                annotations.targetZone = {
                    type: 'box',
                    yMin: targetWeightValue - buffer,
                    yMax: targetWeightValue + buffer,
                    backgroundColor: 'rgba(155, 89, 182, 0.1)', // Light purple background
                    borderColor: 'rgba(155, 89, 182, 0.3)',
                    borderWidth: 1,
                    drawTime: 'beforeDatasetsDraw' // Draw behind the data
                };

                console.log(`Target weight indicator added at ${targetWeightValue} lbs`);
            } else {
                console.log('Could not parse target weight value');
            }
        }

        weightGoalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: false, // Don't force y-axis to start at 0 for weight
                        title: {
                            display: true,
                            text: 'Weight (lbs)',
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                // Round to 2 decimal places for y-axis labels
                                return parseFloat(value).toFixed(2) + ' lbs';
                            }
                        },
                        // Apply the y-axis scale factor
                        min: function(context) {
                            // Get the auto-calculated min value
                            const original = context.chart.scales.y.min;
                            // Calculate a new min based on the scale factor
                            const buffer = (context.chart.scales.y.max - original) * (1 - yAxisScale) / 2;
                            return original - buffer;
                        },
                        max: function(context) {
                            // Get the auto-calculated max value
                            const original = context.chart.scales.y.max;
                            // Calculate a new max based on the scale factor
                            const buffer = (original - context.chart.scales.y.min) * (1 - yAxisScale) / 2;
                            return original + buffer;
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        },
                        // Apply the x-axis scale factor by controlling how many ticks/labels are shown
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            },
                            // Control the number of ticks based on the scale factor
                            // Lower xAxisScale = more ticks (compressed view showing more dates)
                            // Higher xAxisScale = fewer ticks (expanded view showing fewer dates)
                            autoSkip: true,
                            autoSkipPadding: 10,
                            maxTicksLimit: function() {
                                // Base number of ticks adjusted by the scale factor
                                // Inverse relationship: higher scale = fewer ticks
                                return Math.max(5, Math.round(20 / xAxisScale));
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 14
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 10,
                        callbacks: {
                            title: function(tooltipItems) {
                                // Format the date in the tooltip title
                                if (tooltipItems.length > 0) {
                                    const label = tooltipItems[0].label;
                                    try {
                                        // Try to parse and format the date
                                        const date = new Date(label);
                                        if (!isNaN(date.getTime())) {
                                            // Format as Month Day, Year (e.g., April 4, 2025)
                                            return date.toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            });
                                        }
                                    } catch (e) {
                                        // If parsing fails, return the original label
                                    }
                                    return label;
                                }
                                return '';
                            },
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // Round to 2 decimal places (nearest hundredth)
                                    const roundedValue = parseFloat(context.parsed.y).toFixed(2);
                                    label += roundedValue + ' lbs';
                                }
                                return label;
                            }
                        }
                    },
                    annotation: {
                        annotations: annotations
                    }
                }
            }
        });
    }

    // --- Recipe Loading and Display --- //

    async function loadRecipes() {
        showStatus(recipesDisplayStatus, 'Loading recipes...', 'info');
        try {
            // Add cache-busting query parameter
            const response = await fetch('/api/recipes?' + new Date().getTime());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const recipes = await response.json();
            renderRecipes(recipes);
            showStatus(recipesDisplayStatus, '', ''); // Clear status on success
        } catch (error) {
            console.error('Error loading recipes:', error);
            showStatus(recipesDisplayStatus, 'Failed to load recipes.', 'error');
            recipeListContainer.innerHTML = '<p style="text-align:center; color: red;">Could not load recipes.</p>';
        }
    }

    function renderRecipes(recipes) {
        recipeListContainer.innerHTML = ''; // Clear previous list

        if (recipes.length === 0) {
            recipeListContainer.innerHTML = '<p style="text-align:center;">No recipes found. Create one above!</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe-display-item'); // Use class from food.css
            recipeDiv.dataset.id = recipe.id;

            recipeDiv.innerHTML = `
                <h4>${escapeHtml(recipe.name)}</h4>
                <p>Total Calories: <span class="recipe-calories">${recipe.total_calories.toFixed(1)}</span></p>

                <!-- Calorie Adjustment Controls -->
                <div class="calorie-adjustment">
                    <label>Adjust Calories:</label>
                    <input type="number" class="target-calories-input" placeholder="New Cal Total" step="1">
                    <button type="button" class="adjust-calories-btn">Set</button>
                    <button type="button" class="adjust-calories-percent-btn" data-percent="0.75">-25%</button>
                    <button type="button" class="adjust-calories-percent-btn" data-percent="1.25">+25%</button>
                    <button type="button" class="adjust-calories-amount-btn" data-amount="-200">-200</button>
                    <button type="button" class="adjust-calories-amount-btn" data-amount="200">+200</button>
                </div>

                <div class="recipe-actions">
                    <button type="button" class="view-ingredients-btn">View Ingredients</button>
                    <button type="button" class="delete-recipe-btn">Delete Recipe</button>
                </div>
                <div class="ingredient-details" style="display: none; margin-top: 10px;">
                    <!-- Ingredient details will be loaded here -->
                </div>
                <div class="adjustment-status status"></div> <!-- Status for adjustments -->
            `;
            recipeListContainer.appendChild(recipeDiv);
        });
    }

    // --- Recipe Deletion --- //

    async function deleteRecipe(id) {
        if (!confirm('Are you sure you want to delete this recipe and all its ingredients?')) {
            return;
        }
        showStatus(recipesDisplayStatus, `Deleting recipe ${id}...`, 'info');
        try {
            const response = await fetch(`/api/recipes/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            showStatus(recipesDisplayStatus, result.message || 'Recipe deleted successfully', 'success');
            loadRecipes(); // Refresh the list
        } catch (error) {
            console.error('Error deleting recipe:', error);
            showStatus(recipesDisplayStatus, `Error deleting recipe: ${error.message}`, 'error');
        }
    }

    // --- Utility Functions --- //

    function showStatus(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `status ${type}`;
        if (type !== 'info') {
            setTimeout(() => {
                if (element.textContent === message) { // Clear only if message hasn't changed
                     element.textContent = '';
                     element.className = 'status';
                }
            }, 5000);
        }
    }

    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe; // Handle non-strings
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Calorie Adjustment Logic --- //
    async function adjustRecipeCalories(recipeId, targetCalories, recipeItemElement) {
        const statusElement = recipeItemElement.querySelector('.adjustment-status');
        showStatus(statusElement, 'Adjusting calories...', 'info');

        if (isNaN(targetCalories) || targetCalories <= 0) {
            showStatus(statusElement, 'Invalid target calorie value.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/recipes/${recipeId}`,
             {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetCalories: targetCalories })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const updatedRecipe = await response.json();

            // Update the displayed calories
            const caloriesSpan = recipeItemElement.querySelector('.recipe-calories');
            if (caloriesSpan) {
                caloriesSpan.textContent = updatedRecipe.total_calories.toFixed(1);
            }
            // Clear target input
            const targetInput = recipeItemElement.querySelector('.target-calories-input');
            if(targetInput) targetInput.value = '';

            // Update the ingredient details if they are currently displayed
            const detailsDiv = recipeItemElement.querySelector('.ingredient-details');
            if (detailsDiv.style.display !== 'none') {
                 renderIngredientDetails(updatedRecipe.ingredients, detailsDiv);
            }

            showStatus(statusElement, 'Calories adjusted successfully!', 'success');

        } catch (error) {
            console.error('Error adjusting calories:', error);
            showStatus(statusElement, `Error: ${error.message}`, 'error');
        }
    }

    // --- View Ingredients Logic --- //
    async function fetchAndDisplayIngredients(recipeId, detailsDiv, viewButton) {
        // Toggle visibility
        if (detailsDiv.style.display !== 'none') {
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = ''; // Clear content
            viewButton.textContent = 'View Ingredients';
            return;
        }

        detailsDiv.innerHTML = '<p>Loading ingredients...</p>';
        detailsDiv.style.display = 'block';
        viewButton.textContent = 'Hide Ingredients';

        try {
             // Add cache-busting query parameter
            const response = await fetch(`/api/recipes/${recipeId}?` + new Date().getTime());
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
             }
             const recipeData = await response.json();
             renderIngredientDetails(recipeData.ingredients, detailsDiv);
        } catch (error) {
             console.error('Error fetching ingredients:', error);
             detailsDiv.innerHTML = `<p style="color:red;">Error loading ingredients: ${error.message}</p>`;
        }
    }

    function renderIngredientDetails(ingredients, container) {
        if (!ingredients || ingredients.length === 0) {
            container.innerHTML = '<p>No ingredients found for this recipe.</p>';
            return;
        }

        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Calories</th>
                        <th>Amount (g)</th>
                        <th>Protein (g)</th>
                        <th>Fat (g)</th>
                        <th>Carbs (g)</th>
                        <th>Price</th>
                        <th>Cal/g</th>
                        <th>Prot/g</th>
                        <th>Fat/g</th>
                        <th>Carb/g</th>
                        <th>Price/g</th>
                    </tr>
                </thead>
                <tbody>
        `;

        ingredients.forEach(ing => {
            tableHtml += `
                <tr>
                    <td>${escapeHtml(ing.name)}</td>
                    <td>${ing.calories.toFixed(1)}</td>
                    <td>${ing.amount.toFixed(1)}</td>
                    <td>${ing.protein.toFixed(1)}</td>
                    <td>${ing.fats.toFixed(1)}</td>
                    <td>${ing.carbohydrates.toFixed(1)}</td>
                    <td>${ing.price.toFixed(2)}</td>
                    <td>${ing.calories_per_gram.toFixed(2)}</td>
                    <td>${ing.protein_per_gram.toFixed(2)}</td>
                    <td>${ing.fats_per_gram.toFixed(2)}</td>
                    <td>${ing.carbohydrates_per_gram.toFixed(2)}</td>
                    <td>${ing.price_per_gram.toFixed(3)}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }

    // Event delegation for recipe list actions (Delete, Adjust, View)
    recipeListContainer.addEventListener('click', async (event) => { // Make async for await
        const target = event.target;
        const recipeItem = target.closest('.recipe-display-item');
        if (!recipeItem) return; // Click wasn't inside a recipe item

        const recipeId = recipeItem.dataset.id;
        const currentCaloriesSpan = recipeItem.querySelector('.recipe-calories');
        const currentCalories = parseFloat(currentCaloriesSpan?.textContent || '0');

        if (target.classList.contains('delete-recipe-btn')) {
            deleteRecipe(recipeId);
        }
        // --- Calorie Adjustment Handlers ---
        else if (target.classList.contains('adjust-calories-btn')) {
            const targetInput = recipeItem.querySelector('.target-calories-input');
            const targetCalories = parseFloat(targetInput?.value);
            if (!isNaN(targetCalories) && targetCalories > 0) {
                await adjustRecipeCalories(recipeId, targetCalories, recipeItem);
            } else {
                 showStatus(recipeItem.querySelector('.adjustment-status'), 'Please enter a valid positive number for calories.', 'error');
            }
        }
        else if (target.classList.contains('adjust-calories-percent-btn')) {
            const percent = parseFloat(target.dataset.percent);
             if (!isNaN(percent) && currentCalories > 0) {
                 const targetCalories = currentCalories * percent;
                 await adjustRecipeCalories(recipeId, targetCalories, recipeItem);
             } else {
                 showStatus(recipeItem.querySelector('.adjustment-status'), 'Cannot adjust by percent if current calories are zero.', 'error');
             }
        }
        else if (target.classList.contains('adjust-calories-amount-btn')) {
            const amount = parseFloat(target.dataset.amount);
            if (!isNaN(amount)) {
                const targetCalories = Math.max(1, currentCalories + amount); // Ensure calories don't go below 1
                 await adjustRecipeCalories(recipeId, targetCalories, recipeItem);
            } else {
                 showStatus(recipeItem.querySelector('.adjustment-status'), 'Invalid adjustment amount.', 'error');
            }
        }
         // --- View Ingredients Handler ---
        else if (target.classList.contains('view-ingredients-btn')) {
            const detailsDiv = recipeItem.querySelector('.ingredient-details');
            await fetchAndDisplayIngredients(recipeId, detailsDiv, target); // Pass button to toggle text
        }
    });

    // --- Add Event Listener for Weight Goal Form --- //
    if (weightGoalForm) { // Ensure the form exists before adding listener
        weightGoalForm.addEventListener('submit', saveWeightGoal);
    } else {
        console.error("Could not find weight goal form element (#weight-goal-form) to attach listener.");
    }

    // --- Add Event Listener for User Selector --- //
    if (userSelector) {
        userSelector.addEventListener('change', function() {
            currentUserId = this.value; // Update the current user ID
            console.log(`Switched to user ID: ${currentUserId}`);

            // Save the user preference to localStorage
            localStorage.setItem('weightUserPreference', currentUserId);

            // Reload data for the selected user
            loadWeightGoal();
            loadAndRenderWeightChart();

            // Update the user selector label
            const userLabel = currentUserId == 1 ? 'My Data' : 'Mom\'s Data';
            showStatus(weightGoalStatus, `Switched to ${userLabel}`, 'info');
            setTimeout(() => showStatus(weightGoalStatus, '', ''), 2000); // Clear after 2 seconds
        });
    } else {
        console.error("Could not find user selector element (#user-selector) to attach listener.");
    }

    // --- Add Event Listeners for Axis Scale Controls --- //

    // X-Axis Scale Slider
    if (xAxisScaleSlider) {
        xAxisScaleSlider.addEventListener('input', function() {
            xAxisScale = parseFloat(this.value);
            xScaleValue.textContent = xAxisScale.toFixed(1) + 'x';
            if (weightGoalChart) {
                weightGoalChart.update();
            }
        });
    } else {
        console.error("Could not find x-axis scale slider element (#x-axis-scale) to attach listener.");
    }

    // Y-Axis Scale Slider
    if (yAxisScaleSlider) {
        yAxisScaleSlider.addEventListener('input', function() {
            yAxisScale = parseFloat(this.value);
            yScaleValue.textContent = yAxisScale.toFixed(1) + 'x';
            if (weightGoalChart) {
                weightGoalChart.update();
            }
        });
    } else {
        console.error("Could not find y-axis scale slider element (#y-axis-scale) to attach listener.");
    }

    // Reset Scale Button
    if (resetScaleButton) {
        resetScaleButton.addEventListener('click', function() {
            // Reset both sliders to default value (1)
            xAxisScaleSlider.value = 1;
            yAxisScaleSlider.value = 1;
            xAxisScale = 1;
            yAxisScale = 1;
            xScaleValue.textContent = '1.0x';
            yScaleValue.textContent = '1.0x';

            if (weightGoalChart) {
                weightGoalChart.update();
            }
        });
    } else {
        console.error("Could not find reset scale button element (#reset-scale-button) to attach listener.");
    }

    // --- Calorie Target Functions --- //

    // Save calorie target for the selected user
    async function saveCalorieTarget() {
        const userId = calorieUserSelector.value;
        const calorieTarget = parseInt(calorieTargetInput.value);

        if (isNaN(calorieTarget) || calorieTarget < 500 || calorieTarget > 10000) {
            showStatus(calorieTargetStatus, 'Please enter a valid calorie target between 500 and 10000.', 'error');
            return;
        }

        showStatus(calorieTargetStatus, 'Saving calorie target...', 'info');

        try {
            const response = await fetch('/api/calorie-targets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    daily_target: calorieTarget
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showStatus(calorieTargetStatus, 'Calorie target saved successfully!', 'success');

            // Update the displayed current target
            loadCalorieTarget(userId);

            // Clear the input
            calorieTargetInput.value = '';

        } catch (error) {
            console.error('Error saving calorie target:', error);
            showStatus(calorieTargetStatus, `Error saving calorie target: ${error.message}`, 'error');
        }
    }

    // Load calorie target for the specified user
    async function loadCalorieTarget(userId) {
        try {
            const response = await fetch(`/api/calorie-targets/${userId}`);

            if (response.status === 404) {
                // No target set for this user
                currentCalorieTarget.textContent = 'Not set';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            currentCalorieTarget.textContent = `${data.daily_target} calories`;

        } catch (error) {
            console.error('Error loading calorie target:', error);
            currentCalorieTarget.textContent = 'Error loading';
        }
    }

    // Event listener for the save calorie target button
    if (saveCalorieTargetBtn) {
        saveCalorieTargetBtn.addEventListener('click', saveCalorieTarget);
    }

    // Event listener for the calorie user selector
    if (calorieUserSelector) {
        calorieUserSelector.addEventListener('change', function() {
            const userId = this.value;
            loadCalorieTarget(userId);
        });
    }

    // Quick target buttons have been removed

    // --- Initial Load --- //
    loadWeightGoal(); // Load saved goal
    loadAndRenderWeightChart(); // Attempt to load chart data
    loadRecipes();
    loadCalorieTarget(calorieUserSelector.value); // Load calorie target for the default user
});