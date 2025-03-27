document.addEventListener('DOMContentLoaded', function() {
    const mainGoalInput = document.getElementById('mainGoalInput');
    const setMainGoalBtn = document.getElementById('setMainGoalBtn');
    const goalTree = document.getElementById('goalTree');

    // --- Reusable function to create a goal box ---
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
        plusButton.style.display = 'none';
        goalActions.appendChild(plusButton);

        // Create the DELETE button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✕';
        deleteButton.className = 'delete-button action-button';
        deleteButton.title = "Delete goal";
        deleteButton.style.display = 'none';
        goalActions.appendChild(deleteButton);

        goalBox.appendChild(goalActions);

        // Add arrow only to sub-goals (CORRECTED PLACEMENT)
        if (isSubGoal) {
            const arrowContainer = document.createElement('div');
            arrowContainer.className = 'goal-arrow';
            goalBox.prepend(arrowContainer);
        }

        // Event listeners
        goalBox.addEventListener('mouseover', function() {
            plusButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
        });

        goalBox.addEventListener('mouseout', function() {
            plusButton.style.display = 'none';
            deleteButton.style.display = 'none';
        });

        plusButton.addEventListener('click', function(event) {
            event.stopPropagation();
            const subGoalName = prompt("Enter sub-goal:");
            
            if (subGoalName) {
                const parentGoalBox = this.closest('.goal-box');
                const subGoalElement = createGoalBox(subGoalName.trim(), true);
                
                let subGoalsContainer = parentGoalBox.querySelector('.sub-goals');
                if (!subGoalsContainer) {
                    subGoalsContainer = document.createElement('div');
                    subGoalsContainer.className = 'sub-goals';
                    
                    const subNode = document.createElement('div');
                    subNode.className = 'goal-node';
                    subNode.appendChild(subGoalsContainer);
                    parentGoalBox.after(subNode);
                }
                
                const subNode = document.createElement('div');
                subNode.className = 'goal-node';
                subNode.appendChild(subGoalElement);
                subGoalsContainer.appendChild(subNode);
            }
        });

        deleteButton.addEventListener('click', function(event) {
            event.stopPropagation();
            if (confirm(`Delete "${goalName}"?`)) {
                event.target.closest('.goal-node, .goal-box').remove();
            }
        });

        // Main goal container (REMOVED ARROW FROM HERE)
        if (!isSubGoal) {
            const goalNode = document.createElement('div');
            goalNode.className = 'goal-node';
            goalNode.appendChild(goalBox);
            return goalNode;
        }
        return goalBox;
    }

    setMainGoalBtn.addEventListener('click', function() {
        const goalName = mainGoalInput.value.trim();
        if (goalName) {
            goalTree.innerHTML = '';
            goalTree.appendChild(createGoalBox(goalName));
            mainGoalInput.value = '';
        }
    });
});