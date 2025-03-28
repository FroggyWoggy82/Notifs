document.addEventListener('DOMContentLoaded', function() {
    const mainGoalInput = document.getElementById('mainGoalInput');
    const setMainGoalBtn = document.getElementById('setMainGoalBtn');
    const goalTree = document.getElementById('goalTree');

    function createGoalBox(goalName, isSubGoal = false) {
        const goalBox = document.createElement('div');
        goalBox.className = 'goal-box';
        goalBox.textContent = goalName;

        // Create the goal-actions container
        const goalActions = document.createElement('div');
        goalActions.className = 'goal-actions';

        // Create the plus button
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.className = 'plus-button action-button';
        plusButton.title = "Add sub-goal";
        plusButton.style.display = 'none'; // Initially hidden
        goalActions.appendChild(plusButton);

        // Create the DELETE button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✕'; // Using a cross symbol
        deleteButton.className = 'delete-button action-button';
        deleteButton.title = "Delete goal";
        deleteButton.style.display = 'none'; // Initially hidden
        goalActions.appendChild(deleteButton);

        goalBox.appendChild(goalActions);

        // REMOVED: No need to manually add goal-arrow div
        // if (isSubGoal) {
        //     const goalArrow = document.createElement('div');
        //     goalArrow.className = 'goal-arrow';
        //     goalBox.prepend(goalArrow); // Prepend puts it before text
        // }

        // Event listeners
        goalBox.addEventListener('mouseenter', function() { // Use mouseenter/mouseleave for better handling
            plusButton.style.display = 'inline-flex'; // Use flex for consistency
            deleteButton.style.display = 'inline-flex';
        });

        goalBox.addEventListener('mouseleave', function() {
            plusButton.style.display = 'none';
            deleteButton.style.display = 'none';
        });

        plusButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent triggering parent listeners
            const subGoalName = prompt("Enter sub-goal:");

            if (subGoalName && subGoalName.trim()) { // Ensure input is not empty
                // Find the goal-node containing the clicked button's goal-box
                const parentGoalNode = this.closest('.goal-node');
                if (!parentGoalNode) return; // Safety check

                // Create the sub-goal *box* (isSubGoal is true implicitly)
                const subGoalBoxElement = createGoalBox(subGoalName.trim(), true); // Pass true

                // Find or create the sub-goals container within the parent node
                let subGoalsContainer = parentGoalNode.querySelector('.sub-goals');
                if (!subGoalsContainer) {
                    subGoalsContainer = document.createElement('div');
                    subGoalsContainer.className = 'sub-goals';
                    // Insert sub-goals container *after* the parent goal-box
                    parentGoalNode.appendChild(subGoalsContainer);
                }

                // Create the new goal-node wrapper for the sub-goal
                const subGoalNode = document.createElement('div');
                subGoalNode.className = 'goal-node';
                subGoalNode.appendChild(subGoalBoxElement); // Add the box to the node

                // Add the new goal-node to the container
                subGoalsContainer.appendChild(subGoalNode);
            }
        });


        deleteButton.addEventListener('click', function(event) {
            event.stopPropagation();
            // Find the closest goal-node to remove the entire branch/node
            const goalNodeToRemove = event.target.closest('.goal-node');
            if (goalNodeToRemove) {
                // Get goal name for confirmation (optional)
                const goalBox = goalNodeToRemove.querySelector('.goal-box');
                const goalNameConfirm = goalBox ? goalBox.textContent.split('+')[0].trim() : 'this goal'; // Basic name extraction

                if (confirm(`Delete "${goalNameConfirm}" and all its sub-goals?`)) {
                   // Check if this node is inside a sub-goals container and if it's the last one
                   const parentSubGoals = goalNodeToRemove.parentElement;
                   if (parentSubGoals && parentSubGoals.classList.contains('sub-goals')) {
                       goalNodeToRemove.remove();
                       // If the container is now empty, remove it
                       if (parentSubGoals.childElementCount === 0) {
                           parentSubGoals.remove();
                       }
                   } else {
                       // If it's the main goal or structure is different
                       goalNodeToRemove.remove();
                       // If removing the main goal, clear the tree?
                       if (!document.querySelector('#goalTree .goal-node')) {
                           goalTree.innerHTML = ''; // Clear tree if main goal removed
                       }
                   }
                }
            } else {
                // Fallback for potential structure issues (e.g., deleting main box directly? Should be in node)
                 const goalBoxToRemove = event.target.closest('.goal-box');
                 if (goalBoxToRemove && confirm(`Delete "${goalName}"?`)) {
                      goalBoxToRemove.remove();
                 }
            }
        });

        // Wrap ONLY the main goal in a goal-node initially
        // Sub-goals get wrapped when added in the plusButton listener
        if (!isSubGoal) {
            const goalNode = document.createElement('div');
            goalNode.className = 'goal-node';
            goalNode.appendChild(goalBox);
            return goalNode; // Return the node wrapper
        }
        
        return goalBox; // Return just the box for sub-goals (will be wrapped later)
    }

    setMainGoalBtn.addEventListener('click', function() {
        const goalName = mainGoalInput.value.trim();
        if (goalName) {
            goalTree.innerHTML = ''; // Clear previous tree
            const mainGoalNode = createGoalBox(goalName, false); // isSubGoal = false
            goalTree.appendChild(mainGoalNode);
            mainGoalInput.value = '';
        }
    });
});