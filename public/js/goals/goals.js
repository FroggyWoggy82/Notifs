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

    function createGoalElement(goal) { // Receive the full goal object from backend
        const goalBox = document.createElement('div');
        goalBox.className = 'goal-box';
        goalBox.setAttribute('data-id', goal.id);

        const goalTextSpan = document.createElement('span');
        goalTextSpan.className = 'goal-text';
        goalTextSpan.textContent = goal.text;
        goalBox.appendChild(goalTextSpan);

        const goalEditInput = document.createElement('input');
        goalEditInput.type = 'text';
        goalEditInput.className = 'goal-edit-input';
        goalEditInput.style.display = 'none'; // Hide initially
        goalBox.appendChild(goalEditInput);

        const goalActions = document.createElement('div');
        goalActions.className = 'goal-actions';

        const editButton = document.createElement('button');
        editButton.innerHTML = '&#9998;'; // Pencil icon
        editButton.className = 'edit-button action-button';
        editButton.title = "Edit this goal's text";
        editButton.style.display = 'none'; // Initially hidden
        editButton.addEventListener('click', handleEditGoal);
        goalActions.appendChild(editButton);


        if (goal.parent_id !== null) {
             const insertParentButton = document.createElement('button');
             insertParentButton.textContent = '↑+'; // Icon/Text for Insert Parent
             insertParentButton.className = 'insert-parent-button action-button';
             insertParentButton.title = "Insert parent above this goal";
             insertParentButton.style.display = 'none'; // Initially hidden
             insertParentButton.addEventListener('click', handleInsertParent); // Handler from previous step
             goalActions.appendChild(insertParentButton);
        }


        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.className = 'plus-button action-button';
        plusButton.title = "Add sub-goal (child)";
        plusButton.style.display = 'none';
        plusButton.addEventListener('click', handleAddSubGoal);
        goalActions.appendChild(plusButton);


        if (goal.parent_id !== null) {
             const deletePromoteButton = document.createElement('button');
             deletePromoteButton.textContent = '✕↑'; // Example Icon
             deletePromoteButton.className = 'delete-promote-button action-button'; // Add specific class if styling
             deletePromoteButton.title = "Delete ONLY this goal (Promote children)";
             deletePromoteButton.style.display = 'none';
             deletePromoteButton.addEventListener('click', handleDeleteAndPromote); // NEW handler
             goalActions.appendChild(deletePromoteButton);
        }


        // Complete button
        const completeButton = document.createElement('button');
        completeButton.textContent = '✓'; // Checkmark
        completeButton.className = 'complete-button action-button';
        completeButton.title = "Complete this goal (Promote children)";
        completeButton.style.display = 'none';
        completeButton.addEventListener('click', handleCompleteGoal);
        goalActions.appendChild(completeButton);

        // Complete Chain button
        const completeChainButton = document.createElement('button');
        completeChainButton.textContent = '✓✓'; // Double checkmark
        completeChainButton.className = 'complete-chain-button action-button';
        completeChainButton.title = "Complete this goal AND all sub-goals";
        completeChainButton.style.display = 'none';
        completeChainButton.addEventListener('click', handleCompleteChainGoal);
        goalActions.appendChild(completeChainButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✕'; // Original delete symbol
        deleteButton.className = 'delete-button action-button'; // Keep original class
        deleteButton.title = "Delete goal AND all sub-goals"; // Clarify title
        deleteButton.style.display = 'none';
        deleteButton.addEventListener('click', handleDeleteGoal); // Original cascade handler
        goalActions.appendChild(deleteButton);

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '&#10004;'; // Checkmark icon
        saveButton.className = 'save-button action-button';
        saveButton.title = 'Save changes';
        saveButton.style.display = 'none'; // Hidden initially
        saveButton.addEventListener('click', handleSaveGoal);
        goalActions.appendChild(saveButton);

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '&#10006;'; // Cross icon
        cancelButton.className = 'cancel-button action-button';
        cancelButton.title = 'Cancel edit';
        cancelButton.style.display = 'none'; // Hidden initially
        cancelButton.addEventListener('click', handleCancelEdit);
        goalActions.appendChild(cancelButton);

        goalBox.appendChild(goalActions);

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

        const goalNode = document.createElement('div');
        goalNode.className = 'goal-node';
        goalNode.setAttribute('data-id', goal.id);
        goalNode.appendChild(goalBox);

        const subGoalsContainer = document.createElement('div');
        subGoalsContainer.className = 'sub-goals';
        goalNode.appendChild(subGoalsContainer); // Always add container

        return goalNode;
    }

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

            if (nodeData.children && nodeData.children.length > 0) {

                const subGoalsContainer = goalNodeElement.querySelector('.sub-goals');
                if (subGoalsContainer) {

                    renderTree(nodeData.children, subGoalsContainer); // Recursive call
                } else {
                    console.error(`renderTree: COULD NOT FIND .sub-goals container for node ${nodeData.id}`);
                }
            } else {

            }
        });

    }

    async function fetchAndRenderGoals() {
        console.log('fetchAndRenderGoals CALLED.');
        try {
            console.log('fetchAndRenderGoals: Attempting GET /api/goals...');
            const response = await fetch('/api/goals');
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

                console.log('Child added, calling fetchAndRenderGoals()...');
                await fetchAndRenderGoals();
                console.log('fetchAndRenderGoals() completed after adding child.');

            } catch (error) {
                console.error('Error adding sub-goal:', error);
                alert(`Failed to add sub-goal: ${error.message}`);
            }
        }
    }

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

            if (shouldRemoveElement) {
                 console.log(`Removing goal node element for ID: ${goalId} from DOM (after cascade delete attempt).`);
                 goalNode.remove();




            }
        } else {
            console.log(`Cascade deletion cancelled for goal ID: ${goalId}`);
        }
    }

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

        if (confirm(`Delete ONLY "${goalName}" and promote its children to the level above?`)) {
            console.log(`Attempting to delete/promote goal with ID: ${goalId}`);
            try {

                const response = await fetch(`/api/goals/promote/${goalId}`, {
                    method: 'DELETE'
                });

                console.log(`DELETE /api/goals/promote/${goalId} response status: ${response.status}`);

                if (response.ok) { // Status 200 OK expected
                    console.log(`Goal ${goalId} deleted and children promoted successfully.`);

                    await fetchAndRenderGoals();
                } else {

                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    if (response.status === 400 && errorData.error === "Cannot promote children of a root goal") {
                        alert("Cannot delete only a root goal using this option.");
                    } else if (response.status === 404) {
                       alert("Goal not found. It might have already been deleted.");


                       await fetchAndRenderGoals(); // Refresh even on 404 to ensure UI consistency
                    } else {
                       alert(`Failed to delete goal/promote children: ${errorData.error || `Server responded with status ${response.status}`}`);
                    }
                   throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
               }

            } catch (error) {
                console.error(`>>> Error during handleDeleteAndPromote for ID ${goalId} <<<:`, error);

                if (!error.message.startsWith('HTTP error!')) {
                     alert(`An error occurred: ${error.message}`);
                }
            }
        } else {
            console.log(`Delete/promote cancelled for goal ID: ${goalId}`);
        }
    }

    function handleEditGoal(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalBox = goalNode.querySelector('.goal-box');
        const goalTextSpan = goalNode.querySelector('.goal-text');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const goalActions = goalNode.querySelector('.goal-actions');

        goalEditInput.setAttribute('data-original-text', goalTextSpan.textContent);
        goalEditInput.value = goalTextSpan.textContent;

        goalTextSpan.style.display = 'none';
        goalEditInput.style.display = 'inline-block'; // Or block
        goalEditInput.focus(); // Focus the input field
        goalEditInput.select(); // Select the text

        goalActions.querySelectorAll('.action-button').forEach(btn => {
            if (btn.classList.contains('save-button') || btn.classList.contains('cancel-button')) {
                btn.style.display = 'inline-flex';
            } else {
                btn.style.display = 'none';
            }
        });

        goalBox.classList.add('editing');
    }

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

            switchToViewMode(goalNode, updatedGoal.text);

        } catch (error) {
            console.error(`Error saving goal ${goalId}:`, error);
            alert(`Failed to save goal: ${error.message}`);



        }
    }

    function handleCancelEdit(event) {
        event.stopPropagation();
        const goalNode = this.closest('.goal-node');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const originalText = goalEditInput.getAttribute('data-original-text'); // Get original text

        console.log(`Canceling edit for goal ${goalNode.getAttribute('data-id')}`);
        switchToViewMode(goalNode, originalText); // Revert to original text
    }

    function switchToViewMode(goalNode, newText) {
        const goalBox = goalNode.querySelector('.goal-box');
        const goalTextSpan = goalNode.querySelector('.goal-text');
        const goalEditInput = goalNode.querySelector('.goal-edit-input');
        const goalActions = goalNode.querySelector('.goal-actions');

        goalTextSpan.textContent = newText;

        goalEditInput.style.display = 'none';
        goalTextSpan.style.display = 'inline'; // Or block if needed

        goalActions.querySelectorAll('.action-button').forEach(btn => {
            if (btn.classList.contains('save-button') || btn.classList.contains('cancel-button')) {
                btn.style.display = 'none';
            } else {

                 btn.style.display = 'none';
            }
        });

        goalBox.classList.remove('editing');

        goalEditInput.removeAttribute('data-original-text');
    }

    // Handler for completing a goal (promote children)
    function handleCompleteGoal(event) {
        event.stopPropagation();
        const goalBox = event.target.closest('.goal-box');
        const goalId = goalBox.getAttribute('data-id');

        if (confirm('Complete this goal and promote its children? This action cannot be undone.')) {
            fetch(`/api/goals/complete/${goalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to complete goal');
                }
                return response.json();
            })
            .then(data => {
                console.log('Goal completed successfully:', data);
                showNotification('Goal completed successfully!', 'success');
                fetchAndRenderGoals(); // Reload the goals to reflect changes
                loadCompletedGoals(); // Load the completed goals feed
            })
            .catch(error => {
                console.error('Error completing goal:', error);
                showNotification('Error completing goal: ' + error.message, 'error');
            });
        }
    }

    // Handler for completing a goal chain (complete goal and all descendants)
    function handleCompleteChainGoal(event) {
        event.stopPropagation();
        const goalBox = event.target.closest('.goal-box');
        const goalId = goalBox.getAttribute('data-id');

        if (confirm('Complete this goal AND ALL its sub-goals? This action cannot be undone.')) {
            fetch(`/api/goals/complete-chain/${goalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to complete goal chain');
                }
                return response.json();
            })
            .then(data => {
                console.log('Goal chain completed successfully:', data);
                showNotification(`Goal and ${data.goal.completedCount - 1} sub-goals completed successfully!`, 'success');
                fetchAndRenderGoals(); // Reload the goals to reflect changes
                loadCompletedGoals(); // Load the completed goals feed
            })
            .catch(error => {
                console.error('Error completing goal chain:', error);
                showNotification('Error completing goal chain: ' + error.message, 'error');
            });
        }
    }

    // Function to load completed goals
    function loadCompletedGoals() {
        fetch('/api/goals/completed')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch completed goals');
                }
                return response.json();
            })
            .then(completedGoals => {
                renderCompletedGoalsFeed(completedGoals);
            })
            .catch(error => {
                console.error('Error loading completed goals:', error);
                showNotification('Error loading completed goals: ' + error.message, 'error');
            });
    }

    // Function to render the completed goals feed
    function renderCompletedGoalsFeed(completedGoals) {
        const completedGoalsFeed = document.getElementById('completedGoalsFeed');

        if (!completedGoalsFeed) {
            console.error('Completed goals feed element not found');
            return;
        }

        completedGoalsFeed.innerHTML = '';

        if (completedGoals.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-feed-message';
            emptyMessage.textContent = 'No completed goals yet.';
            completedGoalsFeed.appendChild(emptyMessage);
            return;
        }

        // Group completed goals by date
        const groupedByDate = {};
        completedGoals.forEach(goal => {
            const date = new Date(goal.completed_at).toLocaleDateString();
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(goal);
        });

        // Create elements for each date group
        Object.keys(groupedByDate).sort((a, b) => {
            return new Date(b) - new Date(a); // Sort dates in descending order
        }).forEach(date => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'completed-date-group';

            const dateHeader = document.createElement('h3');
            dateHeader.className = 'completed-date-header';
            dateHeader.textContent = date;
            dateGroup.appendChild(dateHeader);

            const goalsList = document.createElement('ul');
            goalsList.className = 'completed-goals-list';

            groupedByDate[date].forEach(goal => {
                const goalItem = document.createElement('li');
                goalItem.className = 'completed-goal-item';

                const goalText = document.createElement('span');
                goalText.className = 'completed-goal-text';
                goalText.textContent = goal.goal_text;

                const completionTime = document.createElement('span');
                completionTime.className = 'completed-goal-time';
                completionTime.textContent = new Date(goal.completed_at).toLocaleTimeString();

                const completionType = document.createElement('span');
                completionType.className = `completed-goal-type ${goal.completion_type}`;
                completionType.textContent = goal.completion_type === 'single' ? 'Completed' : 'Chain Completed';

                goalItem.appendChild(goalText);
                goalItem.appendChild(completionType);
                goalItem.appendChild(completionTime);

                goalsList.appendChild(goalItem);
            });

            dateGroup.appendChild(goalsList);
            completedGoalsFeed.appendChild(dateGroup);
        });
    }

    // Helper function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    setMainGoalBtn.addEventListener('click', handleSetMainGoal);
    console.log('Event listeners attached');

    console.log('Initiating initial load of goals');
    fetchAndRenderGoals();
    loadCompletedGoals(); // Load completed goals on page load
});