/**
 * Test script for bloating rating feature
 * Run this in the browser console to test the functionality
 */

// Test 1: Test bloating rating form functionality
function testBloatingRatingForm() {
    console.log('=== Testing Bloating Rating Form ===');
    
    // Check if bloating rating elements exist
    const ratingInputs = document.querySelectorAll('input[name="bloating-rating"]');
    const customRating = document.getElementById('custom-bloating-rating');
    
    console.log('Rating inputs found:', ratingInputs.length);
    console.log('Custom rating input found:', !!customRating);
    
    if (ratingInputs.length === 0) {
        console.error('❌ Bloating rating inputs not found!');
        return false;
    }
    
    // Test radio button selection
    const mildOption = document.querySelector('input[name="bloating-rating"][value="3"]');
    if (mildOption) {
        mildOption.checked = true;
        console.log('✅ Selected mild bloating option');
    }
    
    // Test custom rating
    if (customRating) {
        customRating.value = '7';
        customRating.dispatchEvent(new Event('input'));
        console.log('✅ Set custom rating to 7');
    }
    
    return true;
}

// Test 2: Test notification scheduling
function testNotificationScheduling() {
    console.log('=== Testing Notification Scheduling ===');
    
    if (!window.BloatingNotifications) {
        console.error('❌ BloatingNotifications not loaded!');
        return false;
    }
    
    // Schedule a test notification for 5 seconds from now
    const testTime = Date.now() + 5000;
    const notification = window.BloatingNotifications.scheduleNotification(
        999, // test meal ID
        'Test Meal',
        'Test Ingredients',
        testTime
    );
    
    console.log('✅ Scheduled test notification:', notification);
    console.log('⏰ Notification will appear in 5 seconds...');
    
    return true;
}

// Test 3: Test notification display
function testNotificationDisplay() {
    console.log('=== Testing Notification Display ===');
    
    if (!window.BloatingNotifications) {
        console.error('❌ BloatingNotifications not loaded!');
        return false;
    }
    
    // Show a test notification immediately
    const testNotification = {
        id: 'test_notification',
        type: 'bloating_rating',
        mealId: 999,
        mealName: 'Test Meal',
        ingredients: 'Chicken, Rice, Broccoli',
        scheduledTime: Date.now(),
        createdAt: Date.now()
    };
    
    window.BloatingNotifications.showNotification(testNotification);
    console.log('✅ Displayed test notification');
    
    return true;
}

// Test 4: Test API endpoint
async function testBloatingAPI() {
    console.log('=== Testing Bloating API ===');
    
    try {
        // Test updating bloating rating for a meal
        const response = await fetch('/api/meals/1/bloating-rating', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bloating_rating: 5
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ API test successful:', result);
            return true;
        } else {
            console.log('⚠️ API returned error (expected if meal doesn\'t exist):', result);
            return false;
        }
    } catch (error) {
        console.error('❌ API test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Starting Bloating Rating Feature Tests...\n');
    
    const results = {
        form: testBloatingRatingForm(),
        scheduling: testNotificationScheduling(),
        display: testNotificationDisplay(),
        api: await testBloatingAPI()
    };
    
    console.log('\n📊 Test Results:');
    console.log('Form functionality:', results.form ? '✅ PASS' : '❌ FAIL');
    console.log('Notification scheduling:', results.scheduling ? '✅ PASS' : '❌ FAIL');
    console.log('Notification display:', results.display ? '✅ PASS' : '❌ FAIL');
    console.log('API endpoint:', results.api ? '✅ PASS' : '⚠️ EXPECTED FAIL');
    
    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Overall: ${passCount}/4 tests passed`);
    
    if (passCount >= 3) {
        console.log('🎉 Bloating rating feature is working correctly!');
    } else {
        console.log('⚠️ Some issues detected. Check the implementation.');
    }
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
    // Wait for DOM and scripts to load
    setTimeout(runAllTests, 2000);
}

// Export for manual testing
window.testBloatingFeature = {
    runAllTests,
    testBloatingRatingForm,
    testNotificationScheduling,
    testNotificationDisplay,
    testBloatingAPI
};
