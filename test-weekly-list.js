/**
 * Test script for the weekly complete list endpoint
 * This script tests the new /api/tasks/weekly-complete-list endpoint
 */

const fetch = require('node-fetch');

async function testWeeklyCompleteList() {
    try {
        console.log('Testing /api/tasks/weekly-complete-list endpoint...\n');

        // Test 1: Get current week's tasks
        console.log('Test 1: Getting current week\'s tasks...');
        const response1 = await fetch('http://localhost:3000/api/tasks/weekly-complete-list');
        
        if (!response1.ok) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }
        
        const data1 = await response1.json();
        console.log('✅ Current week test passed');
        console.log(`Week: ${data1.weekStart} to ${data1.weekEnd}`);
        console.log(`Summary: ${data1.summary.totalTasks} total tasks, ${data1.summary.completedTasks} completed, ${data1.summary.pendingTasks} pending`);
        console.log(`Completion rate: ${data1.summary.completionRate}%`);
        console.log(`Tasks with notifications: ${data1.summary.tasksWithNotifications}`);
        
        // Show daily breakdown summary
        console.log('\nDaily breakdown:');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(day => {
            const dayTasks = data1.dailyBreakdown[day];
            console.log(`  ${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayTasks.length} tasks`);
        });
        
        // Show notification breakdown summary
        console.log(`\nNotification breakdown: ${data1.notificationBreakdown.length} notification times`);
        data1.notificationBreakdown.forEach(notification => {
            console.log(`  ${notification.dateFormatted} at ${notification.time}: ${notification.tasks.length} tasks`);
        });

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Get specific week's tasks (next week)
        console.log('Test 2: Getting next week\'s tasks...');
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7 - nextWeek.getDay()); // Next Sunday
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        const response2 = await fetch(`http://localhost:3000/api/tasks/weekly-complete-list?startDate=${nextWeekStr}`);
        
        if (!response2.ok) {
            throw new Error(`HTTP error! status: ${response2.status}`);
        }
        
        const data2 = await response2.json();
        console.log('✅ Next week test passed');
        console.log(`Week: ${data2.weekStart} to ${data2.weekEnd}`);
        console.log(`Summary: ${data2.summary.totalTasks} total tasks, ${data2.summary.completedTasks} completed, ${data2.summary.pendingTasks} pending`);
        
        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Show detailed example of first few tasks
        console.log('Test 3: Detailed task examples...');
        let exampleCount = 0;
        for (const day of days) {
            const dayTasks = data1.dailyBreakdown[day];
            if (dayTasks.length > 0 && exampleCount < 3) {
                const task = dayTasks[0];
                console.log(`Example task from ${day}:`);
                console.log(`  ID: ${task.id}`);
                console.log(`  Title: ${task.title}`);
                console.log(`  Description: ${task.description || 'None'}`);
                console.log(`  Due Date: ${task.due_date || 'None'}`);
                console.log(`  Reminder: ${task.reminderFormatted || 'None'}`);
                console.log(`  Status: ${task.is_complete ? 'Completed' : 'Pending'}`);
                console.log(`  Type: ${task.task_type}`);
                console.log(`  Has Subtasks: ${task.hasSubtasks}`);
                console.log(`  Is Subtask: ${task.isSubtask}`);
                if (task.subtasks && task.subtasks.length > 0) {
                    console.log(`  Subtasks: ${task.subtasks.length}`);
                }
                console.log('');
                exampleCount++;
            }
        }

        console.log('✅ All tests passed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response text:', await error.response.text());
        }
    }
}

// Run the test
testWeeklyCompleteList();
