/**
 * Workouts Bottom Navigation Fix
 * Special fix for the workouts page bottom navigation
 */

function fixWorkoutsBottomNav() {
    console.log('Fixing workouts bottom navigation...');

    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }

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

    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
}

fixWorkoutsBottomNav();

setTimeout(fixWorkoutsBottomNav, 100);

window.addEventListener('load', function() {
    fixWorkoutsBottomNav();

    setTimeout(fixWorkoutsBottomNav, 500);

    setTimeout(fixWorkoutsBottomNav, 1000);
});
