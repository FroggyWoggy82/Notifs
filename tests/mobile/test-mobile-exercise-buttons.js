/**
 * Test script for mobile exercise buttons visibility
 * Run this in the browser console on mobile or with mobile viewport
 */

// Test 1: Check if buttons exist in the DOM
function testButtonsExist() {
    console.log('=== Testing Button Existence ===');
    
    const exerciseMenus = document.querySelectorAll('.exercise-options-menu');
    console.log(`Found ${exerciseMenus.length} exercise menus`);
    
    let totalButtons = 0;
    let visibleButtons = 0;
    
    exerciseMenus.forEach((menu, index) => {
        console.log(`\nMenu ${index}:`);
        
        const buttons = {
            edit: menu.querySelector('.btn-edit-exercise-name'),
            replace: menu.querySelector('.btn-replace-exercise'),
            replaceGlobal: menu.querySelector('.btn-replace-exercise-global'),
            delete: menu.querySelector('.btn-delete-exercise')
        };
        
        Object.keys(buttons).forEach(type => {
            const button = buttons[type];
            totalButtons++;
            
            if (button) {
                const isVisible = button.offsetParent !== null;
                const computedStyle = getComputedStyle(button);
                
                console.log(`  ${type}: ${button ? 'EXISTS' : 'MISSING'} | Visible: ${isVisible} | Display: ${computedStyle.display} | Opacity: ${computedStyle.opacity}`);
                
                if (isVisible) visibleButtons++;
            } else {
                console.log(`  ${type}: MISSING`);
            }
        });
    });
    
    console.log(`\nSummary: ${visibleButtons}/${totalButtons} buttons visible`);
    return { totalButtons, visibleButtons, success: visibleButtons === totalButtons };
}

// Test 2: Check mobile viewport and CSS application
function testMobileStyles() {
    console.log('=== Testing Mobile Styles ===');
    
    const isMobileViewport = window.innerWidth <= 768;
    console.log(`Mobile viewport (≤768px): ${isMobileViewport} (current: ${window.innerWidth}px)`);
    
    if (!isMobileViewport) {
        console.warn('⚠️ Not in mobile viewport - some styles may not apply');
    }
    
    // Check if mobile CSS is loaded
    const mobileCSS = Array.from(document.styleSheets).find(sheet => {
        try {
            return sheet.href && sheet.href.includes('mobile-exercise-options-buttons-fix.css');
        } catch (e) {
            return false;
        }
    });
    
    console.log(`Mobile CSS loaded: ${!!mobileCSS}`);
    
    // Test button styling
    const testButton = document.querySelector('.btn-replace-exercise');
    if (testButton) {
        const style = getComputedStyle(testButton);
        console.log('Sample button styles:', {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            minWidth: style.minWidth,
            minHeight: style.minHeight,
            backgroundColor: style.backgroundColor
        });
    }
    
    return { isMobileViewport, mobileCSS: !!mobileCSS };
}

// Test 3: Test button functionality
function testButtonFunctionality() {
    console.log('=== Testing Button Functionality ===');
    
    const testButton = document.querySelector('.btn-replace-exercise');
    if (!testButton) {
        console.error('❌ No replace exercise button found for testing');
        return false;
    }
    
    // Test click event
    let clickDetected = false;
    const originalHandler = testButton.onclick;
    
    testButton.addEventListener('click', function testHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        clickDetected = true;
        console.log('✅ Button click detected');
        testButton.removeEventListener('click', testHandler);
    });
    
    // Simulate click
    testButton.click();
    
    // Restore original handler
    testButton.onclick = originalHandler;
    
    return clickDetected;
}

// Test 4: Test menu opening and button visibility
function testMenuOpeningAndVisibility() {
    console.log('=== Testing Menu Opening and Button Visibility ===');
    
    const ellipsisButton = document.querySelector('.btn-exercise-options');
    if (!ellipsisButton) {
        console.error('❌ No ellipsis button found');
        return false;
    }
    
    console.log('Found ellipsis button, testing menu opening...');
    
    // Click ellipsis to open menu
    ellipsisButton.click();
    
    // Wait for menu to open and check visibility
    return new Promise((resolve) => {
        setTimeout(() => {
            const openMenu = document.querySelector('.exercise-options-menu.show');
            if (!openMenu) {
                console.error('❌ Menu did not open');
                resolve(false);
                return;
            }
            
            console.log('✅ Menu opened successfully');
            
            // Check if buttons are visible in the opened menu
            const buttons = openMenu.querySelectorAll('.btn-edit-exercise-name, .btn-replace-exercise, .btn-replace-exercise-global, .btn-delete-exercise');
            const visibleButtons = Array.from(buttons).filter(btn => btn.offsetParent !== null);
            
            console.log(`Buttons in opened menu: ${buttons.length} total, ${visibleButtons.length} visible`);
            
            // Close menu
            document.body.click();
            
            resolve(visibleButtons.length === buttons.length);
        }, 200);
    });
}

// Test 5: Force visibility fix
function testForceVisibilityFix() {
    console.log('=== Testing Force Visibility Fix ===');
    
    if (window.MobileExerciseButtonsFix) {
        console.log('✅ MobileExerciseButtonsFix available');
        
        // Run the force visibility function
        window.MobileExerciseButtonsFix.forceButtonVisibility();
        console.log('✅ Force visibility executed');
        
        // Check results
        const result = testButtonsExist();
        return result.success;
    } else {
        console.error('❌ MobileExerciseButtonsFix not available');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Starting Mobile Exercise Buttons Tests...\n');
    
    const results = {
        existence: testButtonsExist(),
        mobileStyles: testMobileStyles(),
        functionality: testButtonFunctionality(),
        menuOpening: await testMenuOpeningAndVisibility(),
        forceVisibility: testForceVisibilityFix()
    };
    
    console.log('\n📊 Test Results:');
    console.log('Button existence:', results.existence.success ? '✅ PASS' : '❌ FAIL');
    console.log('Mobile styles:', results.mobileStyles.isMobileViewport && results.mobileStyles.mobileCSS ? '✅ PASS' : '⚠️ PARTIAL');
    console.log('Button functionality:', results.functionality ? '✅ PASS' : '❌ FAIL');
    console.log('Menu opening & visibility:', results.menuOpening ? '✅ PASS' : '❌ FAIL');
    console.log('Force visibility fix:', results.forceVisibility ? '✅ PASS' : '❌ FAIL');
    
    const passCount = Object.values(results).filter(result => 
        typeof result === 'boolean' ? result : result.success
    ).length;
    
    console.log(`\n🎯 Overall: ${passCount}/5 tests passed`);
    
    if (passCount >= 4) {
        console.log('🎉 Mobile exercise buttons are working correctly!');
    } else {
        console.log('⚠️ Some issues detected. Check the implementation.');
    }
    
    return results;
}

// Manual test functions
function showAllButtons() {
    console.log('🔧 Manually showing all exercise buttons...');
    
    const buttons = document.querySelectorAll('.btn-edit-exercise-name, .btn-replace-exercise, .btn-replace-exercise-global, .btn-delete-exercise');
    
    buttons.forEach(button => {
        button.style.display = 'inline-flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.style.position = 'static';
        button.style.zIndex = '20';
        
        if (window.innerWidth <= 768) {
            button.style.minWidth = '36px';
            button.style.minHeight = '36px';
            button.style.backgroundColor = '#ffffff';
            button.style.color = '#121212';
            button.style.border = '1px solid #ddd';
            button.style.borderRadius = '6px';
            button.style.padding = '6px 8px';
            button.style.margin = '2px';
        }
    });
    
    console.log(`✅ Applied visibility styles to ${buttons.length} buttons`);
}

// Export for manual testing
window.testMobileExerciseButtons = {
    runAllTests,
    testButtonsExist,
    testMobileStyles,
    testButtonFunctionality,
    testMenuOpeningAndVisibility,
    testForceVisibilityFix,
    showAllButtons
};

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
    setTimeout(runAllTests, 2000);
}
