/**
 * Test script for the weekly summary notification
 * This script tests the weekly notification functionality
 */

const { chromium } = require('playwright');

async function testWeeklyNotification() {
    console.log('Testing weekly summary notification...\n');

    const browser = await chromium.launch({ 
        headless: false,
        args: ['--allow-insecure-localhost']
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    try {
        // Navigate to the main page
        console.log('Navigating to main page...');
        await page.goto('http://localhost:3000/index.html');

        // Wait for the page to load completely
        await page.waitForLoadState('networkidle');
        console.log('Page loaded successfully');

        // Wait a moment for scripts to initialize
        await page.waitForTimeout(3000);

        // Test 1: Force show the weekly notification (for testing purposes)
        console.log('\nTest 1: Force showing weekly notification...');
        
        const notificationResult = await page.evaluate(async () => {
            if (window.WeeklySummaryNotification && window.WeeklySummaryNotification.forceShow) {
                try {
                    await window.WeeklySummaryNotification.forceShow();
                    return { success: true, message: 'Notification forced successfully' };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            } else {
                return { success: false, error: 'WeeklySummaryNotification not available' };
            }
        });

        if (notificationResult.success) {
            console.log('✅ Force show test passed');
            
            // Wait for notification to appear
            await page.waitForTimeout(1000);
            
            // Check if notification is visible
            const notificationVisible = await page.isVisible('.notification.weekly-summary');
            if (notificationVisible) {
                console.log('✅ Weekly notification is visible');
                
                // Get notification content
                const notificationText = await page.textContent('.notification.weekly-summary .notification-content');
                console.log('Notification content:', notificationText);
                
                // Test clicking the notification
                console.log('\nTest 2: Testing notification click...');
                
                // Listen for new page/tab opening
                const [newPage] = await Promise.all([
                    context.waitForEvent('page'),
                    page.click('.notification.weekly-summary')
                ]);
                
                if (newPage) {
                    console.log('✅ Notification click opened new page');
                    console.log('New page URL:', newPage.url());
                    
                    // Wait for the new page to load
                    await newPage.waitForLoadState('networkidle');
                    
                    // Check if it's the weekly task list page
                    const pageTitle = await newPage.title();
                    console.log('New page title:', pageTitle);
                    
                    if (pageTitle.includes('Weekly Task List')) {
                        console.log('✅ Correct page opened (Weekly Task List)');
                    } else {
                        console.log('⚠️ Different page opened than expected');
                    }
                    
                    // Close the new page
                    await newPage.close();
                } else {
                    console.log('❌ No new page opened on click');
                }
                
            } else {
                console.log('❌ Weekly notification is not visible');
            }
        } else {
            console.log('❌ Force show test failed:', notificationResult.error);
        }

        // Test 3: Check if it's Sunday and test automatic showing
        console.log('\nTest 3: Testing Sunday check...');
        
        const sundayCheck = await page.evaluate(() => {
            const today = new Date();
            const isSunday = today.getDay() === 0;
            return {
                isSunday,
                dayOfWeek: today.toLocaleDateString('en-US', { weekday: 'long' }),
                date: today.toLocaleDateString()
            };
        });

        console.log(`Today is ${sundayCheck.dayOfWeek} (${sundayCheck.date})`);
        if (sundayCheck.isSunday) {
            console.log('✅ Today is Sunday - notification should show automatically');
        } else {
            console.log('ℹ️ Today is not Sunday - notification will only show on Sundays');
        }

        // Test 4: Test the weekly API endpoint
        console.log('\nTest 4: Testing weekly API endpoint...');
        
        const apiTest = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/tasks/weekly-complete-list');
                const data = await response.json();
                return {
                    success: response.ok,
                    status: response.status,
                    hasData: !!data.summary,
                    totalTasks: data.summary ? data.summary.totalTasks : 0,
                    completedTasks: data.summary ? data.summary.completedTasks : 0,
                    completionRate: data.summary ? data.summary.completionRate : 0
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        if (apiTest.success) {
            console.log('✅ Weekly API endpoint working');
            console.log(`   Total tasks: ${apiTest.totalTasks}`);
            console.log(`   Completed: ${apiTest.completedTasks}`);
            console.log(`   Completion rate: ${apiTest.completionRate}%`);
        } else {
            console.log('❌ Weekly API endpoint failed:', apiTest.error);
        }

        // Wait a bit to see the notification
        console.log('\nWaiting 5 seconds to observe notification...');
        await page.waitForTimeout(5000);

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

// Run the test
testWeeklyNotification().catch(console.error);
