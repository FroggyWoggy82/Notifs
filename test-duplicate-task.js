/**
 * Test script for duplicate task prevention
 * 
 * This script simulates multiple rapid task creation requests to test
 * the duplicate task prevention mechanism.
 */

const fetch = require('node-fetch');

// Function to create a task
async function createTask(title, description, dueDate) {
    const requestId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
        const response = await fetch(`http://localhost:3000/api/tasks?_=${Date.now()}&requestId=${requestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': requestId
            },
            body: JSON.stringify({
                title,
                description,
                dueDate
            })
        });
        
        const data = await response.json();
        
        return {
            status: response.status,
            data,
            requestId
        };
    } catch (error) {
        console.error('Error creating task:', error);
        return {
            status: 500,
            error: error.message,
            requestId
        };
    }
}

// Function to run the test
async function runTest() {
    console.log('Starting duplicate task prevention test...');
    
    // Generate a unique task title for this test run
    const testId = Date.now();
    const taskTitle = `Test Task ${testId}`;
    const taskDescription = 'This is a test task for duplicate prevention';
    
    // Get tomorrow's date for the due date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    console.log(`Creating task with title: ${taskTitle}`);
    
    // Create the first task
    console.log('Sending first request...');
    const firstResult = await createTask(taskTitle, taskDescription, dueDate);
    console.log('First request result:', {
        status: firstResult.status,
        success: firstResult.status === 201,
        data: firstResult.data
    });
    
    // Immediately try to create the same task again
    console.log('Sending duplicate request immediately...');
    const duplicateResult = await createTask(taskTitle, taskDescription, dueDate);
    console.log('Duplicate request result:', {
        status: duplicateResult.status,
        success: duplicateResult.status === 201,
        data: duplicateResult.data
    });
    
    // Wait 1 second and try again
    console.log('Waiting 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Sending duplicate request after 1 second...');
    const delayedDuplicateResult = await createTask(taskTitle, taskDescription, dueDate);
    console.log('Delayed duplicate request result:', {
        status: delayedDuplicateResult.status,
        success: delayedDuplicateResult.status === 201,
        data: delayedDuplicateResult.data
    });
    
    // Wait 6 seconds (beyond our 5-second window) and try again
    console.log('Waiting 6 seconds...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    console.log('Sending duplicate request after 6 seconds (beyond prevention window)...');
    const beyondWindowResult = await createTask(taskTitle, taskDescription, dueDate);
    console.log('Beyond window request result:', {
        status: beyondWindowResult.status,
        success: beyondWindowResult.status === 201,
        data: beyondWindowResult.data
    });
    
    // Summary
    console.log('\n--- Test Summary ---');
    console.log('First request:', firstResult.status === 201 ? 'SUCCESS' : 'FAILED');
    console.log('Immediate duplicate:', duplicateResult.status === 409 ? 'CORRECTLY REJECTED' : 'INCORRECTLY ACCEPTED');
    console.log('1-second delayed duplicate:', delayedDuplicateResult.status === 409 ? 'CORRECTLY REJECTED' : 'INCORRECTLY ACCEPTED');
    console.log('6-second delayed duplicate:', beyondWindowResult.status === 201 ? 'ACCEPTED (as expected)' : 'INCORRECTLY REJECTED');
    
    // Overall test result
    const testPassed = 
        firstResult.status === 201 && 
        duplicateResult.status === 409 && 
        delayedDuplicateResult.status === 409 && 
        beyondWindowResult.status === 201;
    
    console.log('\nTest result:', testPassed ? 'PASSED' : 'FAILED');
    
    return testPassed;
}

// Run the test
runTest()
    .then(passed => {
        console.log(`\nTest completed ${passed ? 'successfully' : 'with failures'}.`);
        process.exit(passed ? 0 : 1);
    })
    .catch(error => {
        console.error('Test failed with error:', error);
        process.exit(1);
    });
