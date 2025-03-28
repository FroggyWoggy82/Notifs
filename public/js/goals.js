document.addEventListener('DOMContentLoaded', function() {
    const mainGoalInput = document.getElementById('mainGoalInput');
    const setMainGoalBtn = document.getElementById('setMainGoalBtn');
    const goalTree = document.getElementById('goalTree');

    // --- Function to create the DOM element for a goal ---
    // Takes the goal object from the DB (or API response)
    function createGoalElement(goal) {
        const goalBox = document.createElement('div');
        goalBox.className = 'goal-box';
        goalBox.textContent = goal.text;
        goalBox.setAttribute('data-id', goal.id); // Store DB ID on the element

        // Actions container
        const goalActions = document.createElement('div');
        goalActions.className = 'goal-actions';

        // Plus button
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.className = 'plus-button action-button';
        plusButton.title = "Add sub-goal";
        plusButton.style.display = 'none';
        plusButton.addEventListener('click', handleAddSubGoal); // Use named handler
        goalActions.appendChild(plusButton);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✕';
        deleteButton.className = 'delete-button action-button';
        deleteButton.title = "Delete goal";
        deleteButton.style.display = 'none';
        deleteButton.addEventListener('click', handleDeleteGoal); // Use named handler
        goalActions.appendChild(deleteButton);

        goalBox.appendChild(goalActions);

        // Event listeners for showing/hiding buttons
        goalBox.addEventListener('mouseenter', () => {
            plusButton.style.display = 'inline-flex';
            deleteButton.style.display = 'inline-flex';
        });
        goalBox.addEventListener('mouseleave', () => {
            plusButton.style.display = 'none';
            deleteButton.style.display = 'none';
        });

        // Wrap in goal-node
        const goalNode = document.createElement('div');
        goalNode.className = 'goal-node';
        goalNode.setAttribute('data-id', goal.id); // Also store ID on node for easier selection
        goalNode.appendChild(goalBox);

        // Container for sub-goals (will be populated later if needed)
        const subGoalsContainer = document.createElement('div');
        subGoalsContainer.className = 'sub-goals';
        // Check if goal HAS children, if so, append container immediately
        // (Alternatively, always append and let CSS hide empty ones if preferred)
        goalNode.appendChild(subGoalsContainer);


        return goalNode; // Return the whole node wrapper
    }

    // --- Recursive function to render the tree from API data ---
    function renderTree(nodes, parentElement) {
         // Clear existing children before rendering (important for updates)
         parentElement.innerHTML = '';

        nodes.forEach(nodeData => {
            const goalNodeElement = createGoalElement(nodeData);
            parentElement.appendChild(goalNodeElement);

            // If the node has children, recursively render them
            if (nodeData.children && nodeData.children.length > 0) {
                const subGoalsContainer = goalNodeElement.querySelector('.sub-goals');
                // Only render children if subGoalsContainer exists
                 if (subGoalsContainer) {
                     renderTree(nodeData.children, subGoalsContainer);
                 } else {
                     console.warn("Sub-goals container not found for node:", nodeData.id);
                 }
            }
             // If subGoalsContainer exists but nodeData.children is empty,
             // CSS should handle the appearance of the empty container/lines.
             // Or remove the empty container here if preferred:
            // else {
            //     const subGoalsContainer = goalNodeElement.querySelector('.sub-goals');
            //     if (subGoalsContainer) subGoalsContainer.remove();
            // }
        });
    }


    // --- Fetch initial tree data ---
    async function fetchAndRenderGoals() {
        // Log when the function starts
        console.log('fetchAndRenderGoals CALLED.');
        try {
            // Log before the fetch call
            console.log('fetchAndRenderGoals: Attempting GET /api/goals...');
            const response = await fetch('/api/goals'); // Your backend endpoint

            // Log after the fetch call, showing status
            console.log('fetchAndRenderGoals: GET response received. Status:', response.status, 'ok:', response.ok);

            if (!response.ok) {
                 // Log if the response status is not OK
                console.error('fetchAndRenderGoals: Response not OK.');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Log before parsing JSON
            console.log('fetchAndRenderGoals: Attempting to parse JSON...');
            const goalData = await response.json();

            // Log the data received
            console.log('fetchAndRenderGoals: JSON parsed successfully. Data:', goalData);

            // Log before calling renderTree
            console.log('fetchAndRenderGoals: Calling renderTree...');
            renderTree(goalData, goalTree); // Render root nodes into goalTree container

             // Log after renderTree finishes (if it doesn't throw an error)
            console.log('fetchAndRenderGoals: renderTree completed.');

        } catch (error) {
             // Log ANY error caught within this function
            console.error('>>> ERROR within fetchAndRenderGoals <<<:', error);
            goalTree.innerHTML = '<p style="color: red;">Error loading goals. Please try again.</p>';
        }
        // Log when the function finishes
         console.log('fetchAndRenderGoals FINISHED.');
    }

    // --- Event Handlers ---

    // Handle setting the main (root) goal
    async function handleSetMainGoal() {
        const goalName = mainGoalInput.value.trim();
        if (goalName) {
            try {
                const response = await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: goalName, parentId: null }) // null parentId for root
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // Don't need the response data necessarily, just refetch the whole tree
                // const newGoal = await response.json();
                mainGoalInput.value = '';
                await fetchAndRenderGoals(); // Re-fetch and render the updated tree
            } catch (error) {
                console.error('Error setting main goal:', error);
                alert('Failed to set main goal. Please try again.');
            }
        }
    }

    // Handle adding a sub-goal
    async function handleAddSubGoal(event) {
        event.stopPropagation();
        const parentGoalBox = this.closest('.goal-box');
        const parentGoalNode = this.closest('.goal-node'); // Or goal-box
        const parentId = parentGoalNode.getAttribute('data-id');

        if (!parentId) {
            console.error('Could not find parent goal ID');
            return;
        }

        const subGoalName = prompt("Enter sub-goal:");
        if (subGoalName && subGoalName.trim()) {
            try {
                const response = await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: subGoalName.trim(), parentId: parseInt(parentId) })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
                }

                const newSubGoal = await response.json(); // Get the new goal with its ID

                // --- Append the new element directly to the DOM ---
                // Find the correct sub-goals container for this parent
                 const subGoalsContainer = parentGoalNode.querySelector('.sub-goals');
                 if (!subGoalsContainer) {
                     console.error("Sub-goals container missing for parent:", parentId);
                     // Optionally refetch tree if DOM structure is uncertain
                     // await fetchAndRenderGoals();
                     return;
                 }

                 const newGoalElement = createGoalElement(newSubGoal);
                 subGoalsContainer.appendChild(newGoalElement);

                // --- OR ---
                // Re-fetch the whole tree for simplicity (less efficient but robust)
                // await fetchAndRenderGoals();

            } catch (error) {
                console.error('Error adding sub-goal:', error);
                alert(`Failed to add sub-goal: ${error.message}`);
            }
        }
    }

    // Handle deleting a goal
    async function handleDeleteGoal(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalId = goalNode.getAttribute('data-id');
        const goalBox = goalNode.querySelector('.goal-box');
        const goalName = goalBox ? goalBox.textContent.split('+')[0].trim() : 'this goal';

        if (!goalId) {
            console.error('Could not find goal ID to delete');
            return;
        }

        // Add logging to see which ID is being targeted
        console.log(`Attempting to delete goal with ID: ${goalId}`);

        const hasChildren = goalNode.querySelector('.sub-goals .goal-node');
        const confirmMessage = hasChildren
             ? `Delete "${goalName}" and ALL its sub-goals? This cannot be undone.`
             : `Delete "${goalName}"?`;

        if (confirm(confirmMessage)) {
            let shouldRemoveElement = false; // Flag to control DOM removal

            try {
                const response = await fetch(`/api/goals/${goalId}`, {
                    method: 'DELETE'
                });

                console.log(`DELETE /api/goals/${goalId} response status: ${response.status}`); // Log status

                if (response.ok) { // Status 200-299 (e.g., 200 OK, 204 No Content)
                    console.log(`Goal ${goalId} deleted successfully on server.`);
                    shouldRemoveElement = true; // Mark for removal on success
                } else if (response.status === 404) {
                    // --- NEW: Handle 404 ---
                    console.warn(`Goal ${goalId} not found on server (already deleted?). Removing from UI.`);
                    shouldRemoveElement = true; // Mark for removal as it's already gone server-side
                    // Don't throw an error here, just log a warning
                } else {
                    // Handle other errors (like 500)
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    console.error(`Failed to delete goal ${goalId} on server. Status: ${response.status}`);
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
                }

            } catch (error) {
                // Catch errors from fetch itself or thrown above (like 500)
                console.error(`>>> Error during handleDeleteGoal for ID ${goalId} <<<:`, error);
                alert(`Failed to delete goal: ${error.message}`);
                // Do NOT set shouldRemoveElement = true here, as deletion failed
            }

            // --- Remove Element Outside Try/Catch ---
            // Only remove if deletion was successful OR if it was already gone (404)
            if (shouldRemoveElement) {
                 console.log(`Removing goal node element for ID: ${goalId} from DOM.`);
                 goalNode.remove();

                 // Optional cleanup for empty containers (same as before)
                 const parentSubGoals = goalNode.parentElement;
                 if (parentSubGoals && parentSubGoals.classList.contains('sub-goals') && parentSubGoals.childElementCount === 0) {
                     // Consider if removing the container breaks CSS lines
                     // parentSubGoals.remove();
                 }
                 if (goalTree.childElementCount === 0) {
                     // goalTree.innerHTML = '<p>No goals set yet.</p>';
                 }
            }
        } else {
            console.log(`Deletion cancelled for goal ID: ${goalId}`);
        }
    }

    // --- Initial Setup ---
    setMainGoalBtn.addEventListener('click', handleSetMainGoal);
    fetchAndRenderGoals(); // Load goals when the page loads

});