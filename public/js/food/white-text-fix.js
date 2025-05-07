
document.addEventListener('DOMContentLoaded', function() {

    function setCalorieTextWhite() {
        const calorieTarget = document.getElementById('current-calorie-target');
        if (calorieTarget) {
            calorieTarget.style.color = '#ffffff';

            const children = calorieTarget.querySelectorAll('*');
            children.forEach(child => {
                child.style.color = '#ffffff';
            });

            if (calorieTarget.innerHTML.indexOf('<span style="color: #ffffff') === -1) {
                const text = calorieTarget.textContent;
                calorieTarget.innerHTML = `<span style="color: #ffffff !important;">${text}</span>`;
            }
        }
    }

    setCalorieTextWhite();

    setTimeout(setCalorieTextWhite, 100);
    setTimeout(setCalorieTextWhite, 500);
    setTimeout(setCalorieTextWhite, 1000);
});
