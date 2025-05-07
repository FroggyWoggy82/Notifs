/**
 * Dashboard Stats
 * Updates the dashboard statistics cards with real-time data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard stats
    updateDashboardStats();
    
    // Update stats when tasks or habits change
    document.addEventListener('tasksLoaded', updateDashboardStats);
    document.addEventListener('habitsLoaded', updateDashboardStats);
    document.addEventListener('taskCompleted', updateDashboardStats);
    document.addEventListener('habitCompleted', updateDashboardStats);
});

/**
 * Updates all dashboard statistics
 */
function updateDashboardStats() {
    updateActiveTaskCount();
    updateCompletedTodayCount();
    updateHabitStreakCount();
}

/**
 * Updates the active task count in the dashboard
 */
function updateActiveTaskCount() {
    const activeTaskCountElement = document.getElementById('activeTaskCount');
    if (!activeTaskCountElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Count active (non-completed) tasks
    const activeTaskCount = tasks.filter(task => !task.completed).length;
    
    // Update the dashboard
    activeTaskCountElement.textContent = activeTaskCount;
}

/**
 * Updates the completed today count in the dashboard
 */
function updateCompletedTodayCount() {
    const completedTodayCountElement = document.getElementById('completedTodayCount');
    if (!completedTodayCountElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count tasks completed today
    const completedTodayCount = tasks.filter(task => {
        if (!task.completed) return false;
        
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        
        return completedDate.getTime() === today.getTime();
    }).length;
    
    // Update the dashboard
    completedTodayCountElement.textContent = completedTodayCount;
}

/**
 * Updates the habit streak count in the dashboard
 * Shows the longest current streak among all habits
 */
function updateHabitStreakCount() {
    const habitStreakCountElement = document.getElementById('habitStreakCount');
    if (!habitStreakCountElement) return;
    
    // Get habits from localStorage
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    
    // Find the longest current streak
    let longestStreak = 0;
    
    habits.forEach(habit => {
        const streak = habit.currentStreak || 0;
        if (streak > longestStreak) {
            longestStreak = streak;
        }
    });
    
    // Update the dashboard
    habitStreakCountElement.textContent = longestStreak;
}
