const { test, expect } = require('@playwright/test');

test('Task creation should not create duplicates', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3000/');
  
  // Wait for the page to load
  await page.waitForSelector('#taskList');
  
  // Count the initial number of tasks
  const initialTaskCount = await page.locator('.task-item').count();
  console.log(`Initial task count: ${initialTaskCount}`);
  
  // Click the add task button
  await page.click('#addTaskFab');
  
  // Wait for the modal to appear
  await page.waitForSelector('#addTaskModal', { state: 'visible' });
  
  // Fill in the task details
  await page.fill('#taskTitle', 'Test Task - Duplicate Prevention');
  await page.fill('#taskDescription', 'This is a test task to verify duplicate prevention');
  
  // Set a due date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  await page.fill('#taskDueDate', formattedDate);
  
  // Submit the form
  await page.click('#addTaskBtn');
  
  // Wait for the task to be added and the modal to close
  await page.waitForSelector('#addTaskModal', { state: 'hidden' });
  
  // Wait for the task list to update
  await page.waitForTimeout(1000);
  
  // Count the number of tasks after adding
  const newTaskCount = await page.locator('.task-item').count();
  console.log(`New task count: ${newTaskCount}`);
  
  // Verify that only one task was added
  expect(newTaskCount).toBe(initialTaskCount + 1);
  
  // Verify the task was added with the correct title
  const taskTitles = await page.locator('.task-item .task-title').allTextContents();
  const newTaskExists = taskTitles.some(title => title.includes('Test Task - Duplicate Prevention'));
  expect(newTaskExists).toBeTruthy();
  
  // Check for duplicates
  const duplicateCount = taskTitles.filter(title => title.includes('Test Task - Duplicate Prevention')).length;
  expect(duplicateCount).toBe(1);
  
  console.log('Test completed successfully');
});
