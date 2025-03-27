document.addEventListener('DOMContentLoaded', function() {
    const mainGoalInput = document.getElementById('mainGoalInput');
    const setMainGoalBtn = document.getElementById('setMainGoalBtn');
    const goalTree = document.getElementById('goalTree');

    setMainGoalBtn.addEventListener('click', function() {
        const goalName = mainGoalInput.value.trim();

        if (goalName !== ''){
            const goalBox = document.createElement('div');
            goalBox.className = 'goal-box';
            goalBox.textContent = goalName;

            // Clear the existing content and add the new goal
            goalTree.innerHTML = '';
            goalTree.appendChild(goalBox);
            
            // Clear the input field
            mainGoalInput.value = '';
            
        }
    });



});