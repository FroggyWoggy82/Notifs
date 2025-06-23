/**
 * Test script to verify the weekly recap functionality is working correctly
 * This script tests that the weekly summary shows only completed tasks from the previous week
 */

const fetch = require('node-fetch');

async function testWeeklyRecapFix() {
    console.log('🧪 Testing Weekly Recap Fix...\n');

    try {
        // Test 1: Test the API endpoint with recap mode
        console.log('📡 Test 1: Testing API endpoint with recap mode...');
        const response = await fetch('http://localhost:3000/api/tasks/weekly-complete-list?mode=recap');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('✅ API Response received successfully');
        console.log(`📊 Summary:`, {
            success: data.success,
            weekStart: data.weekStart,
            weekEnd: data.weekEnd,
            totalTasks: data.summary.totalTasks,
            completedTasks: data.summary.completedTasks,
            pendingTasks: data.summary.pendingTasks,
            completionRate: data.summary.completionRate
        });

        // Test 2: Verify that we're getting the previous week's date range
        console.log('\n📅 Test 2: Verifying date range is previous week...');
        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay()); // Current Sunday
        
        const expectedWeekStart = new Date(currentWeekStart);
        expectedWeekStart.setDate(currentWeekStart.getDate() - 7); // Previous Sunday
        expectedWeekStart.setHours(0, 0, 0, 0);
        
        const expectedWeekEnd = new Date(expectedWeekStart);
        expectedWeekEnd.setDate(expectedWeekStart.getDate() + 6); // Previous Saturday
        expectedWeekEnd.setHours(23, 59, 59, 999);

        const actualWeekStart = new Date(data.weekStart);
        const actualWeekEnd = new Date(data.weekEnd);

        console.log(`Expected week: ${expectedWeekStart.toISOString().split('T')[0]} to ${expectedWeekEnd.toISOString().split('T')[0]}`);
        console.log(`Actual week: ${data.weekStart} to ${data.weekEnd}`);

        const dateRangeCorrect = 
            actualWeekStart.toISOString().split('T')[0] === expectedWeekStart.toISOString().split('T')[0] &&
            actualWeekEnd.toISOString().split('T')[0] === expectedWeekEnd.toISOString().split('T')[0];

        if (dateRangeCorrect) {
            console.log('✅ Date range is correct (previous week)');
        } else {
            console.log('❌ Date range is incorrect');
        }

        // Test 3: Verify that all returned tasks are completed
        console.log('\n✔️ Test 3: Verifying all tasks are completed...');
        let allTasksCompleted = true;
        let taskCount = 0;

        // Check daily breakdown
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        for (const day of days) {
            const dayTasks = data.dailyBreakdown[day] || [];
            taskCount += dayTasks.length;
            
            for (const task of dayTasks) {
                if (!task.is_complete) {
                    allTasksCompleted = false;
                    console.log(`❌ Found incomplete task: ${task.title} (ID: ${task.id})`);
                }
            }
        }

        if (allTasksCompleted) {
            console.log(`✅ All ${taskCount} tasks in daily breakdown are completed`);
        } else {
            console.log('❌ Some tasks in daily breakdown are not completed');
        }

        // Test 4: Verify summary statistics make sense for recap mode
        console.log('\n📈 Test 4: Verifying summary statistics...');
        
        // In recap mode, totalTasks should equal completedTasks (since we only show completed tasks)
        // and pendingTasks should be 0
        const statsCorrect = 
            data.summary.totalTasks === data.summary.completedTasks &&
            data.summary.pendingTasks === 0 &&
            (data.summary.totalTasks === 0 ? data.summary.completionRate === 0 : data.summary.completionRate === 100);

        if (statsCorrect) {
            console.log('✅ Summary statistics are correct for recap mode');
            console.log(`   - Total tasks: ${data.summary.totalTasks}`);
            console.log(`   - Completed tasks: ${data.summary.completedTasks}`);
            console.log(`   - Pending tasks: ${data.summary.pendingTasks}`);
            console.log(`   - Completion rate: ${data.summary.completionRate}%`);
        } else {
            console.log('❌ Summary statistics are incorrect for recap mode');
            console.log(`   - Total tasks: ${data.summary.totalTasks} (should equal completed)`);
            console.log(`   - Completed tasks: ${data.summary.completedTasks}`);
            console.log(`   - Pending tasks: ${data.summary.pendingTasks} (should be 0)`);
            console.log(`   - Completion rate: ${data.summary.completionRate}% (should be 100% or 0%)`);
        }

        // Test 5: Compare with regular mode to ensure they're different
        console.log('\n🔄 Test 5: Comparing with regular mode...');
        const regularResponse = await fetch('http://localhost:3000/api/tasks/weekly-complete-list');
        const regularData = await regularResponse.json();

        console.log('Regular mode summary:', {
            totalTasks: regularData.summary.totalTasks,
            completedTasks: regularData.summary.completedTasks,
            pendingTasks: regularData.summary.pendingTasks
        });

        console.log('Recap mode summary:', {
            totalTasks: data.summary.totalTasks,
            completedTasks: data.summary.completedTasks,
            pendingTasks: data.summary.pendingTasks
        });

        // Final assessment
        console.log('\n🎯 Final Assessment:');
        const allTestsPassed = dateRangeCorrect && allTasksCompleted && statsCorrect;
        
        if (allTestsPassed) {
            console.log('🎉 ALL TESTS PASSED! Weekly recap fix is working correctly.');
            console.log('✅ The weekly summary now shows only completed tasks from the previous week.');
        } else {
            console.log('❌ Some tests failed. Please review the issues above.');
        }

        return allTestsPassed;

    } catch (error) {
        console.error('❌ Error testing weekly recap:', error);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testWeeklyRecapFix().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testWeeklyRecapFix;
