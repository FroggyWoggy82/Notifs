/**
 * Test file for notification grouping functionality
 * 
 * This file tests the task reminder service's ability to group notifications
 * that occur within a short time window.
 */

const TaskReminderService = require('../models/taskReminderService');

// Mock tasks with similar reminder times
const mockTasks = [
    {
        id: 1,
        title: 'Task 1',
        due_date: '2023-12-01T10:00:00Z',
        reminder_time: '2023-12-01T09:00:00Z',
        is_complete: false
    },
    {
        id: 2,
        title: 'Task 2',
        due_date: '2023-12-01T14:00:00Z',
        reminder_time: '2023-12-01T09:02:00Z', // 2 minutes after Task 1
        is_complete: false
    },
    {
        id: 3,
        title: 'Task 3',
        due_date: '2023-12-02T10:00:00Z',
        reminder_time: '2023-12-01T09:04:00Z', // 4 minutes after Task 1
        is_complete: false
    },
    {
        id: 4,
        title: 'Task 4',
        due_date: '2023-12-03T10:00:00Z',
        reminder_time: '2023-12-01T09:30:00Z', // 30 minutes after Task 1 (should not be grouped)
        is_complete: false
    }
];

// Test the groupTasksByReminderTime function
function testGroupTasksByReminderTime() {
    console.log('Testing groupTasksByReminderTime function...');
    
    const groups = TaskReminderService.groupTasksByReminderTime(mockTasks);
    console.log('Task groups:', JSON.stringify(groups, null, 2));
    
    // Count the number of groups and tasks in each group
    const groupCount = Object.keys(groups).length;
    console.log(`Number of groups: ${groupCount}`);
    
    for (const reminderTime in groups) {
        console.log(`Group at ${reminderTime}: ${groups[reminderTime].length} tasks`);
    }
    
    // Verify that tasks 1, 2, and 3 are grouped together
    // and task 4 is in a separate group
    const firstGroupKey = Object.keys(groups)[0];
    const firstGroup = groups[firstGroupKey];
    
    if (firstGroup.length === 3) {
        console.log('✅ First group contains 3 tasks as expected');
        
        // Verify the task IDs in the first group
        const taskIds = firstGroup.map(task => task.id).sort();
        if (JSON.stringify(taskIds) === JSON.stringify([1, 2, 3])) {
            console.log('✅ First group contains tasks 1, 2, and 3 as expected');
        } else {
            console.log('❌ First group does not contain the expected tasks');
            console.log('Expected: [1, 2, 3], Got:', taskIds);
        }
    } else {
        console.log('❌ First group does not contain 3 tasks as expected');
        console.log(`Expected: 3, Got: ${firstGroup.length}`);
    }
    
    // Verify that task 4 is in a separate group
    const secondGroupKey = Object.keys(groups)[1];
    if (secondGroupKey) {
        const secondGroup = groups[secondGroupKey];
        if (secondGroup.length === 1 && secondGroup[0].id === 4) {
            console.log('✅ Second group contains only task 4 as expected');
        } else {
            console.log('❌ Second group does not contain the expected task');
            console.log('Expected: [4], Got:', secondGroup.map(task => task.id));
        }
    } else {
        console.log('❌ Second group not found');
    }
}

// Test the formatDueText function
function testFormatDueText() {
    console.log('\nTesting formatDueText function...');
    
    // Create test dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const inTwoDays = new Date(today);
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Test formatting
    console.log(`Today: ${TaskReminderService.formatDueText(today)}`);
    console.log(`Tomorrow: ${TaskReminderService.formatDueText(tomorrow)}`);
    console.log(`In 2 days: ${TaskReminderService.formatDueText(inTwoDays)}`);
    console.log(`Yesterday: ${TaskReminderService.formatDueText(yesterday)}`);
    
    // Verify results
    if (TaskReminderService.formatDueText(today) === 'today') {
        console.log('✅ Today formatted correctly');
    } else {
        console.log('❌ Today not formatted correctly');
    }
    
    if (TaskReminderService.formatDueText(tomorrow) === 'tomorrow') {
        console.log('✅ Tomorrow formatted correctly');
    } else {
        console.log('❌ Tomorrow not formatted correctly');
    }
    
    if (TaskReminderService.formatDueText(inTwoDays) === 'in 2 days') {
        console.log('✅ In 2 days formatted correctly');
    } else {
        console.log('❌ In 2 days not formatted correctly');
    }
    
    if (TaskReminderService.formatDueText(yesterday) === '1 days ago') {
        console.log('✅ Yesterday formatted correctly');
    } else {
        console.log('❌ Yesterday not formatted correctly');
    }
}

// Run the tests
console.log('=== Notification Grouping Tests ===');
testGroupTasksByReminderTime();
testFormatDueText();
console.log('\nTests completed.');
