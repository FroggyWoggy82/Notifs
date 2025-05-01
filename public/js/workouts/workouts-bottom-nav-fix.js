/**
 * Workouts Bottom Navigation Fix
 * Special fix for the workouts page bottom navigation
 */

// Function to fix the bottom navigation on the workouts page
function fixWorkoutsBottomNav() {
    console.log('Fixing workouts bottom navigation...');

    // First, remove any existing bottom navigation
    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }

    // Create a completely new bottom navigation with the exact same HTML structure as the other pages
    const bottomNavHTML = `
    <div class="bottom-nav">
        <a href="/index.html" class="nav-item" data-page="home-page">
            <div class="nav-icon"><i class="fas fa-check"></i></div>
            <span>Tasks</span>
        </a>
        <a href="/pages/goals.html" class="nav-item" data-page="goal-page">
            <div class="nav-icon"><i class="fas fa-star"></i></div>
            <span>Goals</span>
        </a>
        <a href="/pages/workouts.html" class="nav-item active" data-page="workout-page">
            <div class="nav-icon"><i class="fas fa-dumbbell"></i></div>
            <span>Workouts</span>
        </a>
        <a href="/pages/calendar.html" class="nav-item" data-page="calendar-page">
            <div class="nav-icon"><i class="fas fa-calendar-alt"></i></div>
            <span>Calendar</span>
        </a>
        <a href="/pages/food.html" class="nav-item" data-page="food-page">
            <div class="nav-icon"><i class="fas fa-utensils"></i></div>
            <span>Food</span>
        </a>
    </div>
    `;

    // Insert the new bottom navigation at the end of the body
    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
}

// Run immediately
fixWorkoutsBottomNav();

// Also run after a short delay
setTimeout(fixWorkoutsBottomNav, 100);

// Run again when the window is fully loaded
window.addEventListener('load', function() {
    fixWorkoutsBottomNav();

    // And again after a short delay
    setTimeout(fixWorkoutsBottomNav, 500);

    // And one more time after a longer delay
    setTimeout(fixWorkoutsBottomNav, 1000);
});
