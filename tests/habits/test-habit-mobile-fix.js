/**
 * Test script to verify the habit mobile touch fix
 * This script simulates mobile touch events to test the fix
 */

// Function to simulate a touch event
function simulateTouch(element, x, y) {
    const touch = new Touch({
        identifier: 1,
        target: element,
        clientX: x,
        clientY: y,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 10,
        force: 0.5,
    });

    const touchEvent = new TouchEvent('touchstart', {
        cancelable: true,
        bubbles: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
    });

    element.dispatchEvent(touchEvent);
}

// Function to test habit touch behavior
function testHabitTouch() {
    console.log('Testing habit mobile touch fix...');
    
    // Wait for habits to load
    setTimeout(() => {
        const habitItems = document.querySelectorAll('.habit-item');
        
        if (habitItems.length === 0) {
            console.log('No habit items found. Make sure habits are loaded.');
            return;
        }
        
        const firstHabit = habitItems[0];
        const rect = firstHabit.getBoundingClientRect();
        
        console.log(`Testing habit: ${firstHabit.querySelector('.habit-title')?.textContent || 'Unknown'}`);
        console.log(`Habit dimensions: ${rect.width}x${rect.height}`);
        
        // Test 1: Touch in the middle (should NOT show edit buttons)
        console.log('Test 1: Touching middle of habit item...');
        const middleX = rect.left + (rect.width * 0.5);
        const middleY = rect.top + (rect.height * 0.5);
        simulateTouch(firstHabit, middleX, middleY);
        
        setTimeout(() => {
            const hasShowActions = firstHabit.classList.contains('show-actions');
            console.log(`Middle touch result: show-actions class = ${hasShowActions} (should be false)`);
            
            // Test 2: Touch on the far right edge (should show edit buttons on mobile)
            console.log('Test 2: Touching far right edge of habit item...');
            const rightEdgeX = rect.right - (rect.width * 0.1); // 90% from left
            simulateTouch(firstHabit, rightEdgeX, middleY);
            
            setTimeout(() => {
                const hasShowActionsAfterRightTouch = firstHabit.classList.contains('show-actions');
                console.log(`Right edge touch result: show-actions class = ${hasShowActionsAfterRightTouch} (should be true on mobile)`);
                
                // Test 3: Touch on interactive elements (should NOT show edit buttons)
                console.log('Test 3: Touching interactive elements...');
                const checkbox = firstHabit.querySelector('.habit-checkbox');
                const incrementBtn = firstHabit.querySelector('.habit-increment-btn');
                const levelBtn = firstHabit.querySelector('.habit-level');
                
                if (checkbox) {
                    console.log('Testing checkbox touch...');
                    simulateTouch(checkbox, rect.left + 20, middleY);
                }
                
                if (incrementBtn) {
                    console.log('Testing increment button touch...');
                    const btnRect = incrementBtn.getBoundingClientRect();
                    simulateTouch(incrementBtn, btnRect.left + 10, btnRect.top + 10);
                }
                
                if (levelBtn) {
                    console.log('Testing level button touch...');
                    const levelRect = levelBtn.getBoundingClientRect();
                    simulateTouch(levelBtn, levelRect.left + 10, levelRect.top + 10);
                }
                
                setTimeout(() => {
                    const finalShowActions = firstHabit.classList.contains('show-actions');
                    console.log(`Interactive elements touch result: show-actions class = ${finalShowActions} (should remain unchanged)`);
                    console.log('Test completed!');
                }, 100);
            }, 100);
        }, 100);
    }, 2000); // Wait 2 seconds for habits to load
}

// Run the test when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testHabitTouch);
} else {
    testHabitTouch();
}

console.log('Habit mobile touch test script loaded. Test will run automatically.');
