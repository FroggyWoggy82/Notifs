// Helper function to update level class
function updateLevelClass(element, level) {
    if (!element) return;
    
    element.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
    let newLevelClass = 'level-1';
    if (level >= 10) {
        newLevelClass = 'level-10';
    } else if (level >= 5) {
        newLevelClass = 'level-5';
    } else if (level >= 3) {
        newLevelClass = 'level-3';
    }
    element.classList.add(newLevelClass);
    return newLevelClass;
}
