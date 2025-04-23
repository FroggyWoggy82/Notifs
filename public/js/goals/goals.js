document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');

    const mainGoalInput = document.getElementById('mainGoalInput');
    const setMainGoalBtn = document.getElementById('setMainGoalBtn');
    const goalTree = document.getElementById('goalTree');

    console.log('Elements found:', {
        mainGoalInput: !!mainGoalInput,
        setMainGoalBtn: !!setMainGoalBtn,
        goalTree: !!goalTree
    });

    if (!mainGoalInput || !setMainGoalBtn || !goalTree) {
        console.error('Required elements not found!');
        return;
    }

    // --- Function to create the DOM element for a goal ---
    function createGoalElement(goal) { // Receive the full goal object from backend
        const goalBox = document.createElement('div');
        goalBox.className = 'goal-box';
        goalBox.setAttribute('data-id', goal.id);

        // --- Text Display ---
        const goalTextSpan = document.createElement('span');
        goalTextSpan.className = 'goal-text';
        goalTextSpan.textContent = goal.text;
        goalBox.appendChild(goalTextSpan);

        // --- Edit Input (Initially Hidden) ---
        const goalEditInput = document.createElement('input');
        goalEditInput.type = 'text';
        goalEditInput.className = 'goal-edit-input';
        goalEditInput.style.display = 'none'; // Hide initially
        goalBox.appendChild(goalEditInput);

        // --- Action Buttons Container ---
        const goalActions = document.createElement('div');
        goalActions.className = 'goal-actions';

        // --- Edit Button ---
        const editButton = document.createElement('button');
        editButton.innerHTML = '&#9998;'; // Pencil icon
        editButton.className = 'edit-button action-button';
        editButton.title = "Edit this goal's text";
        editButton.style.display = 'none'; // Initially hidden
        editButton.addEventListener('click', handleEditGoal);
        goalActions.appendChild(editButton);

        // --- Insert Parent Button ---
        // Only add if it's NOT a root node (parent_id exists and is not null)
        if (goal.parent_id !== null) {
             const insertParentButton = document.createElement('button');
             insertParentButton.textContent = '↑+'; // Icon/Text for Insert Parent
             insertParentButton.className = 'insert-parent-button action-button';
             insertParentButton.title = "Insert parent above this goal";
             insertParentButton.style.display = 'none'; // Initially hidden
             insertParentButton.addEventListener('click', handleInsertParent); // Handler from previous step
             goalActions.appendChild(insertParentButton);
        }
        // --- ---

        // Plus button (Add Child)
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.className = 'plus-button action-button';
        plusButton.title = "Add sub-goal (child)";
        plusButton.style.display = 'none';
        plusButton.addEventListener('click', handleAddSubGoal);
        goalActions.appendChild(plusButton);

        // --- Delete & Promote Button ---
        // Add only if it's NOT a root node (promoting children of root is complex/maybe disallowed)
        if (goal.parent_id !== null) {
             const deletePromoteButton = document.createElement('button');
             deletePromoteButton.textContent = '✕↑'; // Example Icon
             deletePromoteButton.className = 'delete-promote-button action-button'; // Add specific class if styling
             deletePromoteButton.title = "Delete ONLY this goal (Promote children)";
             deletePromoteButton.style.display = 'none';
             deletePromoteButton.addEventListener('click', handleDeleteAndPromote); // NEW handler
             goalActions.appendChild(deletePromoteButton);
        }
        // --- ---

        // Delete button (Cascade - deletes children)
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✕'; // Original delete symbol
        deleteButton.className = 'delete-button action-button'; // Keep original class
        deleteButton.title = "Delete goal AND all sub-goals"; // Clarify title
        deleteButton.style.display = 'none';
        deleteButton.addEventListener('click', handleDeleteGoal); // Original cascade handler
        goalActions.appendChild(deleteButton);

        // --- Save Button (for editing) ---
        const saveButton = document.createElement('button');
        saveButton.innerHTML = '&#10004;'; // Checkmark icon
        saveButton.className = 'save-button action-button';
        saveButton.title = 'Save changes';
        saveButton.style.display = 'none'; // Hidden initially
        saveButton.addEventListener('click', handleSaveGoal);
        goalActions.appendChild(saveButton);

        // --- Cancel Button (for editing) ---
        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '&#10006;'; // Cross icon
        cancelButton.className = 'cancel-button action-button';
        cancelButton.title = 'Cancel edit';
        cancelButton.style.display = 'none'; // Hidden initially
        cancelButton.addEventListener('click', handleCancelEdit);
        goalActions.appendChild(cancelButton);

        goalBox.appendChild(goalActions);

        // Event listeners for showing/hiding buttons on hover (only when NOT editing)
        goalBox.addEventListener('mouseenter', () => {
            if (!goalBox.classList.contains('editing')) {
                 goalActions.querySelectorAll('.action-button:not(.save-button):not(.cancel-button)').forEach(btn => {
                      btn.style.display = 'inline-flex';
                 });
            }
        });
        goalBox.addEventListener('mouseleave', () => {
            if (!goalBox.classList.contains('editing')) {
                goalActions.querySelectorAll('.action-button').forEach(btn => {
                     btn.style.display = 'none';
                });
            }
        });

        // Wrap in goal-node
        const goalNode = document.createElement('div');
        goalNode.className = 'goal-node';
        goalNode.setAttribute('data-id', goal.id);
        goalNode.appendChild(goalBox);

        // Sub-goals container
        const subGoalsContainer = document.createElement('div');
        subGoalsContainer.className = 'sub-goals';
        goalNode.appendChild(subGoalsContainer); // Always add container

        return goalNode;
    }

    // --- Recursive function to render the tree ---
    function renderTree(nodes, parentElement) {
        console.log('renderTree called for parent:', parentElement.id || parentElement.tagName || 'root', 'with nodes:', nodes.length);
        parentElement.innerHTML = ''; // Clear existing children
        if (!Array.isArray(nodes)) {
            console.error('renderTree received non-array:', nodes);
            return;
        }
        nodes.forEach(nodeData => {
            if (!nodeData || typeof nodeData.id === 'undefined') {
                 console.error('renderTree encountered invalid nodeData:', nodeData);
                 return; // Skip this invalid node
            }
            console.log(`renderTree: Processing node ${nodeData.id} ('${nodeData.text}')`);
            const goalNodeElement = createGoalElement(nodeData); // Pass full nodeData
            parentElement.appendChild(goalNodeElement);
            // console.log(`renderTree: Checking children for node ${nodeData.id}. Children data:`, nodeData.children);
            if (nodeData.children && nodeData.children.length > 0) {
                // console.log(`renderTree: Node ${nodeData.id} HAS children. Finding .sub-goals container.`);
                const subGoalsContainer = goalNodeElement.querySelector('.sub-goals');
                if (subGoalsContainer) {
                    // console.log(`renderTree: Found container for node ${nodeData.id}. Recursively calling renderTree for children:`, nodeData.children);
                    renderTree(nodeData.children, subGoalsContainer); // Recursive call
                } else {
                    console.error(`renderTree: COULD NOT FIND .sub-goals container for node ${nodeData.id}`);
                }
            } else {
                // console.log(`renderTree: Node ${nodeData.id} has NO children.`);
            }
        });
        // console.log('renderTree finished for parent:', parentElement.id || parentElement.tagName || 'root');
    }


    // --- Fetch initial tree data ---
    async function fetchAndRenderGoals() {
        console.log('fetchAndRenderGoals CALLED.');
        try {
            console.log('fetchAndRenderGoals: Attempting GET /api/goal-tree...');
            const response = await fetch('/api/goal-tree');
            console.log('fetchAndRenderGoals: GET response received. Status:', response.status, 'ok:', response.ok);
            if (!response.ok) {
                console.error('fetchAndRenderGoals: Response not OK.');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('fetchAndRenderGoals: Attempting to parse JSON...');
            const goalData = await response.json();
            console.log('fetchAndRenderGoals: JSON parsed successfully.'); // Data log removed for brevity
            console.log('fetchAndRenderGoals: Calling renderTree...');
            renderTree(goalData, goalTree); // Render root nodes into the main goalTree container
            console.log('fetchAndRenderGoals: renderTree completed.');
        } catch (error) {
            console.error('>>> ERROR within fetchAndRenderGoals <<<:', error);
            goalTree.innerHTML = '<p style="color: red;">Error loading goals. Please try again.</p>';
        }
        console.log('fetchAndRenderGoals FINISHED.');
    }

    // --- Event Handlers ---

    // Handle setting the main (root) goal
    async function handleSetMainGoal() {
        const goalName = mainGoalInput.value.trim();
        if (goalName) {
            console.log('Attempting to POST main goal:', goalName);
            try {
                const response = await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: goalName, parentId: null })
                });
                console.log('POST main goal response received, status:', response.status, 'ok:', response.ok);
                if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
                mainGoalInput.value = '';
                console.log('POST main goal successful, calling fetchAndRenderGoals()...');
                await fetchAndRenderGoals();
                console.log('fetchAndRenderGoals() completed after main goal.');
            } catch (error) {
                console.error('Error setting main goal:', error);
                alert('Failed to set main goal. Please try again.');
            }
        } else {
             console.log('Goal name was empty, not POSTing main goal.');
        }
    }

    // Handle adding a sub-goal (child)
    async function handleAddSubGoal(event) {
        event.stopPropagation();
        const parentGoalNode = this.closest('.goal-node');
        const parentId = parentGoalNode.getAttribute('data-id');
        if (!parentId) { console.error('Could not find parent goal ID for adding child'); return; }
        const subGoalName = prompt("Enter sub-goal (child) name:");
        if (subGoalName && subGoalName.trim()) {
             console.log(`Attempting to add child to parent ${parentId} with text: ${subGoalName.trim()}`);
            try {
                const response = await fetch('/api/goals', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: subGoalName.trim(), parentId: parseInt(parentId) })
                });
                 console.log(`POST child response status: ${response.status}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
                }
                const newSubGoal = await response.json();
                 console.log('Child goal created:', newSubGoal);

                // Since structure changed, refetching is safest
                console.log('Child added, calling fetchAndRenderGoals()...');
                await fetchAndRenderGoals();
                console.log('fetchAndRenderGoals() completed after adding child.');

            } catch (error) {
                console.error('Error adding sub-goal:', error);
                alert(`Failed to add sub-goal: ${error.message}`);
            }
        }
    }

    // Handle inserting a parent goal
    async function handleInsertParent(event) {
        event.stopPropagation();
        const currentGoalNode = this.closest('.goal-node');
        const currentGoalId = currentGoalNode.getAttribute('data-id');
        if (!currentGoalId) { console.error('Could not find current goal ID for insertion'); return; }
        const newGoalText = prompt("Enter text for the NEW parent goal (to insert above current):");
        if (newGoalText && newGoalText.trim()) {
             console.log(`Attempting to insert parent above node ${currentGoalId} with text: ${newGoalText.trim()}`);
            try {
                const response = await fetch('/api/goals/insert-between', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newGoalText: newGoalText.trim(),
                        currentGoalId: parseInt(currentGoalId)
                    })
                });
                 console.log(`POST insert-between response status: ${response.status}`);
                if (!response.ok) {
                     const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                     if (response.status === 400 && errorData.error === "Cannot insert parent above a root goal") {
                         alert("Cannot insert a parent above a root goal.");
                     } else {
                         alert(`Failed to insert parent goal: ${errorData.error || `Server responded with status ${response.status}`}`);
                     }
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
                }
                console.log('Parent inserted successfully, calling fetchAndRenderGoals()...');
                await fetchAndRenderGoals();
                console.log('fetchAndRenderGoals() completed after inserting parent.');
            } catch (error) {
                console.error(`Error inserting parent goal above ID ${currentGoalId}:`, error);
                if (!error.message.startsWith('HTTP error!')) {
                     alert('An error occurred while inserting the parent goal.');
                } // Avoid double alert
            }
        }
    }

    // Handle deleting a goal AND its children (Cascade)
    async function handleDeleteGoal(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalId = goalNode.getAttribute('data-id');
        const goalBox = goalNode.querySelector('.goal-box');
        const goalName = goalBox ? goalBox.textContent.split('+')[0].trim() : 'this goal';

        if (!goalId) { console.error('Could not find goal ID to delete (cascade)'); return; }
        console.log(`Attempting to delete goal CASCADE with ID: ${goalId}`);

        const hasChildren = goalNode.querySelector('.sub-goals .goal-node'); // Simple check for UI children
        const confirmMessage = `Delete "${goalName}" AND ALL its sub-goals? This cannot be undone.`;

        if (confirm(confirmMessage)) {
            let shouldRemoveElement = false;
            try {
                // Use the original DELETE /api/goals/:id endpoint
                const response = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
                console.log(`DELETE cascade /api/goals/${goalId} response status: ${response.status}`);
                if (response.ok) {
                    console.log(`Goal ${goalId} deleted successfully (cascade) on server.`);
                    shouldRemoveElement = true;
                } else if (response.status === 404) {
                    console.warn(`Goal ${goalId} not found on server (already deleted?). Removing from UI.`);
                    shouldRemoveElement = true;
                } else {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    console.error(`Failed to delete goal ${goalId} (cascade) on server. Status: ${response.status}`);
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error(`>>> Error during handleDeleteGoal (cascade) for ID ${goalId} <<<:`, error);
                alert(`Failed to delete goal (cascade): ${error.message}`);
            }
            // Remove element from UI ONLY if successful or already gone
            if (shouldRemoveElement) {
                 console.log(`Removing goal node element for ID: ${goalId} from DOM (after cascade delete attempt).`);
                 goalNode.remove();
                 // Optional: Cleanup parent container if empty
                 // const parentSubGoals = goalNode.parentElement;
                 // if (parentSubGoals && parentSubGoals.classList.contains('sub-goals') && parentSubGoals.childElementCount === 0) { parentSubGoals.remove(); }
                 // if (goalTree.childElementCount === 0) { goalTree.innerHTML = '<p>No goals set yet.</p>'; }
            }
        } else {
            console.log(`Cascade deletion cancelled for goal ID: ${goalId}`);
        }
    }

     // --- NEW: Handle deleting a node and promoting its children ---
    async function handleDeleteAndPromote(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalId = goalNode.getAttribute('data-id');
        const goalBox = goalNode.querySelector('.goal-box');
        const goalName = goalBox ? goalBox.textContent.split('+')[0].trim() : 'this goal';

        if (!goalId) {
            console.error('Could not find goal ID to delete/promote');
            return;
        }

        // Ask for confirmation
        if (confirm(`Delete ONLY "${goalName}" and promote its children to the level above?`)) {
            console.log(`Attempting to delete/promote goal with ID: ${goalId}`);
            try {
                // Use the NEW DELETE /api/goals/promote/:id endpoint
                const response = await fetch(`/api/goals/promote/${goalId}`, {
                    method: 'DELETE'
                });

                console.log(`DELETE /api/goals/promote/${goalId} response status: ${response.status}`);

                if (response.ok) { // Status 200 OK expected
                    console.log(`Goal ${goalId} deleted and children promoted successfully.`);
                    // Successfully changed structure, refetch the whole tree
                    await fetchAndRenderGoals();
                } else {
                    // Handle specific errors if needed (like trying to delete root)
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    if (response.status === 400 && errorData.error === "Cannot promote children of a root goal") {
                        alert("Cannot delete only a root goal using this option.");
                    } else if (response.status === 404) {
                       alert("Goal not found. It might have already been deleted.");
                       // Optionally remove from UI if 404? Refreshing below handles it anyway if needed.
                       // goalNode.remove();
                       await fetchAndRenderGoals(); // Refresh even on 404 to ensure UI consistency
                    } else {
                       alert(`Failed to delete goal/promote children: ${errorData.error || `Server responded with status ${response.status}`}`);
                    }
                   throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
               }

            } catch (error) {
                console.error(`>>> Error during handleDeleteAndPromote for ID ${goalId} <<<:`, error);
                // Alert might have already happened for non-OK responses
                if (!error.message.startsWith('HTTP error!')) {
                     alert(`An error occurred: ${error.message}`);
                }
            }
        } else {
            console.log(`Delete/promote cancelled for goal ID: ${goalId}`);
        }
    }

    // --- NEW: Handle initiating the edit mode ---
    function handleEditGoal(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalBox = goalNode.querySelector('.goal-box');
        const goalTextSpan = goalNode.querySelector('.goal-text');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const goalActions = goalNode.querySelector('.goal-actions');

        // Store original text in case of cancel
        goalEditInput.setAttribute('data-original-text', goalTextSpan.textContent);
        goalEditInput.value = goalTextSpan.textContent;

        // Switch UI elements
        goalTextSpan.style.display = 'none';
        goalEditInput.style.display = 'inline-block'; // Or block
        goalEditInput.focus(); // Focus the input field
        goalEditInput.select(); // Select the text

        // Hide normal action buttons, show save/cancel
        goalActions.querySelectorAll('.action-button').forEach(btn => {
            if (btn.classList.contains('save-button') || btn.classList.contains('cancel-button')) {
                btn.style.display = 'inline-flex';
            } else {
                btn.style.display = 'none';
            }
        });

        // Add editing class for styling/state tracking
        goalBox.classList.add('editing');
    }

    // --- NEW: Handle saving the edited goal ---
    async function handleSaveGoal(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalBox = goalNode.querySelector('.goal-box');
        const goalId = goalNode.getAttribute('data-id');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const newText = goalEditInput.value.trim();

        if (!goalId) { console.error('Could not find goal ID to save'); return; }
        if (newText === '') { alert('Goal text cannot be empty.'); return; }

        console.log(`Attempting to save goal ${goalId} with new text: ${newText}`);
        try {
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText })
            });
            console.log(`PUT /api/goals/${goalId} response status: ${response.status}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown server error'}`);
            }
            const updatedGoal = await response.json(); // Get updated goal data from server
            console.log(`Goal ${goalId} updated successfully on server:`, updatedGoal);

            // Update UI text and switch back to view mode
            switchToViewMode(goalNode, updatedGoal.text);

        } catch (error) {
            console.error(`Error saving goal ${goalId}:`, error);
            alert(`Failed to save goal: ${error.message}`);
            // Optionally, could revert the input to original text on error
            // goalEditInput.value = goalEditInput.getAttribute('data-original-text');
            // Or just leave it in edit mode for user to retry/cancel
        }
    }

    // --- NEW: Handle canceling the edit ---
    function handleCancelEdit(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const originalText = goalEditInput.getAttribute('data-original-text'); // Get original text

        console.log(`Canceling edit for goal ${goalNode.getAttribute('data-id')}`);
        switchToViewMode(goalNode, originalText); // Revert to original text
    }

    // --- NEW: Helper function to switch back to view mode ---
    function switchToViewMode(goalNode, newText) {
        const goalBox = goalNode.querySelector('.goal-box');
        const goalTextSpan = goalNode.querySelector('.goal-text');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const goalActions = goalNode.querySelector('.goal-actions');

        // Update text display
        goalTextSpan.textContent = newText;

        // Switch UI elements
        goalEditInput.style.display = 'none';
        goalTextSpan.style.display = 'inline'; // Or block if needed

        // Hide save/cancel, show normal action buttons (but keep them hidden initially)
        goalActions.querySelectorAll('.action-button').forEach(btn => {
            if (btn.classList.contains('save-button') || btn.classList.contains('cancel-button')) {
                btn.style.display = 'none';
            } else {
                 // Don't immediately show them, let hover handle it
                 btn.style.display = 'none';
            }
        });

        // Remove editing class
        goalBox.classList.remove('editing');
        // Clean up attribute used for cancel
        goalEditInput.removeAttribute('data-original-text');
    }


    // --- Initial Setup ---
    setMainGoalBtn.addEventListener('click', handleSetMainGoal);
    console.log('Event listeners attached');

    // Initial load of goals
    console.log('Initiating initial load of goals');
    fetchAndRenderGoals();
});