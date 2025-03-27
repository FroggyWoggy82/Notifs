document.addEventListener('DOMContentLoaded', function() {
    const mainGoalInput = document.getElementById('mainGoalInput');
    const setMainGoalBtn = document.getElementById('setMainGoalBtn');
    const mainGoalSection = document.getElementById('mainGoalSection');
    const goalTree = document.getElementById('goalTree');
    
    // Data structure to store the goal tree
    let goalData = {
        mainGoal: null,
        subGoals: {}
    };
    
    // Function to find parent of a goal
    function findParentGoal(goalId) {
        // Check if it's a direct child of main goal
        if (goalData.mainGoal && goalData.mainGoal.subGoals.includes(goalId)) {
            return 'main';
        }
        
        // Check each subgoal
        for (const [parentId, parentGoal] of Object.entries(goalData.subGoals)) {
            if (parentGoal.subGoals && parentGoal.subGoals.includes(goalId)) {
                return parentId;
            }
        }
        
        return null;
    }
    
    // Set the main goal
    setMainGoalBtn.addEventListener('click', function() {
        const goalName = mainGoalInput.value.trim();
        
        if (goalName === '') {
            return;
        }
        
        // Set or update the main goal
        if (goalData.mainGoal === null) {
            // Create a new main goal
            goalData.mainGoal = {
                id: 'main',
                name: goalName,
                subGoals: []
            };
        } else {
            // Update existing main goal
            goalData.mainGoal.name = goalName;
        }
        
        // Clear input and render the tree
        mainGoalInput.value = '';
        renderGoalTree();
    });
    
    // Render the entire goal tree
    function renderGoalTree() {
        goalTree.innerHTML = '';
        
        if (goalData.mainGoal === null) {
            return;
        }
        
        // Create the main goal node
        const mainGoalNode = createGoalNode(goalData.mainGoal, true);
        goalTree.appendChild(mainGoalNode);
        
        // Render sub-goals recursively
        if (goalData.mainGoal.subGoals && goalData.mainGoal.subGoals.length > 0) {
            const subGoalsContainer = document.createElement('div');
            subGoalsContainer.className = 'sub-goals-container';
            
            // Create wrapper for each subgoal to ensure proper vertical alignment
            goalData.mainGoal.subGoals.forEach(subGoalId => {
                const subGoal = goalData.subGoals[subGoalId];
                if (subGoal) {
                    const subGoalNode = renderSubGoalTree(subGoal);
                    
                    // Create a wrapper div to contain the subgoal and its children
                    const subGoalWrapper = document.createElement('div');
                    subGoalWrapper.className = 'sub-goal-wrapper';
                    subGoalWrapper.style.display = 'flex';
                    subGoalWrapper.style.flexDirection = 'column';
                    subGoalWrapper.style.alignItems = 'center';
                    
                    subGoalWrapper.appendChild(subGoalNode);
                    subGoalsContainer.appendChild(subGoalWrapper);
                }
            });
            
            mainGoalNode.appendChild(subGoalsContainer);
        }
    }
    
    // Render a sub-goal and its children
    function renderSubGoalTree(goal) {
        const goalNode = createGoalNode(goal, false);
        
        if (goal.subGoals && goal.subGoals.length > 0) {
            const subGoalsContainer = document.createElement('div');
            subGoalsContainer.className = 'sub-goals-container';
            
            goal.subGoals.forEach(subGoalId => {
                const subGoal = goalData.subGoals[subGoalId];
                if (subGoal) {
                    const subGoalNode = renderSubGoalTree(subGoal);
                    
                    // Create a wrapper div to contain the subgoal and its children
                    const subGoalWrapper = document.createElement('div');
                    subGoalWrapper.className = 'sub-goal-wrapper';
                    // Set explicit width to ensure proper spacing
                    subGoalWrapper.style.minWidth = '250px';
                    subGoalWrapper.style.display = 'flex';
                    subGoalWrapper.style.flexDirection = 'column';
                    subGoalWrapper.style.alignItems = 'center';
                    
                    // Add some padding around each sub-goal branch
                    subGoalWrapper.style.padding = '0 10px';
                    
                    subGoalWrapper.appendChild(subGoalNode);
                    subGoalsContainer.appendChild(subGoalWrapper);
                }
            });
            
            goalNode.appendChild(subGoalsContainer);
        }
        
        return goalNode;
    }
    
    // Create a single goal node element
    function createGoalNode(goal, isMainGoal) {
        const goalNode = document.createElement('div');
        goalNode.className = 'goal-node' + (isMainGoal ? ' main-goal-node' : ' sub-goal');
        goalNode.setAttribute('data-goal-id', goal.id);
        
        const goalBox = document.createElement('div');
        goalBox.className = 'goal-box' + (isMainGoal ? ' main-goal' : '');
        
        const goalName = document.createElement('div');
        goalName.className = 'goal-name';
        goalName.textContent = goal.name;
        
        const goalActions = document.createElement('div');
        goalActions.className = 'goal-actions';
        
        const addSubGoalBtn = document.createElement('button');
        addSubGoalBtn.className = 'add-sub-goal-btn';
        addSubGoalBtn.textContent = 'Add Step';
        addSubGoalBtn.addEventListener('click', function() {
            showAddSubGoalForm(goal.id, goalBox);
        });
        
        const addSiblingBtn = document.createElement('button');
        addSiblingBtn.className = 'add-sub-goal-btn';
        addSiblingBtn.textContent = 'Add Parallel Goal';
        addSiblingBtn.style.backgroundColor = '#6f42c1';
        addSiblingBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Find parent goal and show form
            if (isMainGoal) {
                // Can't add sibling to main goal
                return;
            } else {
                // Find the parent that contains this goal
                let parentGoalId = findParentGoal(goal.id);
                if (parentGoalId) {
                    // Find the parent element in the DOM
                    const parentElement = document.querySelector(`[data-goal-id="${parentGoalId}"]`);
                    if (parentElement) {
                        const parentGoalBox = parentElement.querySelector('.goal-box');
                        showAddSubGoalForm(parentGoalId, parentGoalBox);
                    }
                }
            }
        });
        
        goalActions.appendChild(addSubGoalBtn);
        if (!isMainGoal) {
            goalActions.appendChild(addSiblingBtn);
        }
        
        if (!isMainGoal) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', function() {
                deleteGoal(goal.id);
            });
            goalActions.appendChild(deleteBtn);
        }
        
        goalBox.appendChild(goalName);
        goalBox.appendChild(goalActions);
        goalNode.appendChild(goalBox);
        
        return goalNode;
    }
    
    // Show form to add a sub-goal
    function showAddSubGoalForm(parentId, parentElement) {
        // Check if form already exists
        if (parentElement.querySelector('.sub-goal-form')) {
            return;
        }
        
        const form = document.createElement('div');
        form.className = 'sub-goal-form';
        
        const input = document.createElement('input');
        input.className = 'sub-goal-input';
        input.type = 'text';
        input.placeholder = 'Enter step to achieve this goal...';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-sub-goal-btn';
        confirmBtn.textContent = 'Add';
        confirmBtn.addEventListener('click', function() {
            addSubGoal(parentId, input.value.trim());
            parentElement.removeChild(form);
        });
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-sub-goal-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function() {
            parentElement.removeChild(form);
        });
        
        form.appendChild(input);
        form.appendChild(confirmBtn);
        form.appendChild(cancelBtn);
        
        parentElement.appendChild(form);
        input.focus();
    }
    
    // Add a sub-goal to a parent goal
    function addSubGoal(parentId, goalName) {
        if (goalName === '') {
            return;
        }
        
        // Generate a unique ID for the new sub-goal
        const subGoalId = 'goal_' + Date.now();
        
        // Create the sub-goal object
        const subGoal = {
            id: subGoalId,
            name: goalName,
            subGoals: []
        };
        
        // Add to data structure
        goalData.subGoals[subGoalId] = subGoal;
        
        // Add to parent's sub-goals list
        if (parentId === 'main') {
            goalData.mainGoal.subGoals.push(subGoalId);
        } else if (goalData.subGoals[parentId]) {
            if (!goalData.subGoals[parentId].subGoals) {
                goalData.subGoals[parentId].subGoals = [];
            }
            goalData.subGoals[parentId].subGoals.push(subGoalId);
        }
        
        // Re-render the tree
        renderGoalTree();
    }
    
    // Delete a goal and all its sub-goals
    function deleteGoal(goalId) {
        if (!goalData.subGoals[goalId]) {
            return;
        }
        
        // Recursively delete all sub-goals
        function deleteSubGoalsRecursive(goal) {
            if (goal.subGoals && goal.subGoals.length > 0) {
                [...goal.subGoals].forEach(subGoalId => {
                    if (goalData.subGoals[subGoalId]) {
                        deleteSubGoalsRecursive(goalData.subGoals[subGoalId]);
                        delete goalData.subGoals[subGoalId];
                    }
                });
            }
        }
        
        deleteSubGoalsRecursive(goalData.subGoals[goalId]);
        
        // Remove from parent's sub-goals list
        if (goalData.mainGoal && goalData.mainGoal.subGoals) {
            goalData.mainGoal.subGoals = goalData.mainGoal.subGoals.filter(id => id !== goalId);
        }
        
        // Check other goals to remove from their subGoals lists
        Object.values(goalData.subGoals).forEach(goal => {
            if (goal.subGoals) {
                goal.subGoals = goal.subGoals.filter(id => id !== goalId);
            }
        });
        
        // Remove the goal itself
        delete goalData.subGoals[goalId];
        
        // Re-render the tree
        renderGoalTree();
    }
});