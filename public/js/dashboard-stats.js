/**
 * Dashboard Stats
 * Updates the dashboard statistics cards with real-time data
 */

document.addEventListener('DOMContentLoaded', function() {

    updateDashboardStats();

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

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    const activeTaskCount = tasks.filter(task => !task.completed).length;

    activeTaskCountElement.textContent = activeTaskCount;
}

/**
 * Updates the completed today count in the dashboard
 */
function updateCompletedTodayCount() {
    const completedTodayCountElement = document.getElementById('completedTodayCount');
    if (!completedTodayCountElement) return;

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedTodayCount = tasks.filter(task => {
        if (!task.completed) return false;
        
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        
        return completedDate.getTime() === today.getTime();
    }).length;

    completedTodayCountElement.textContent = completedTodayCount;
}

/**
 * Updates the habit streak count in the dashboard
 * Shows the longest current streak among all habits
 */
function updateHabitStreakCount() {
    const habitStreakCountElement = document.getElementById('habitStreakCount');
    if (!habitStreakCountElement) return;

    const habits = JSON.parse(localStorage.getItem('habits') || '[]');

    let longestStreak = 0;
    
    habits.forEach(habit => {
        const streak = habit.currentStreak || 0;
        if (streak > longestStreak) {
            longestStreak = streak;
        }
    });

    habitStreakCountElement.textContent = longestStreak;
}
