# Test info

- Name: Task creation should not create duplicates
- Location: C:\Users\Kevin\423fawn\Notifs\tests\duplicate-task-fix.test.js:3:1

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#addTaskBtn')
    - locator resolved to <button type="submit" id="addTaskBtn">Add Task</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - locator resolved to <button type="submit" id="addTaskBtn">Add Task</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

    at C:\Users\Kevin\423fawn\Notifs\tests\duplicate-task-fix.test.js:31:14
```

# Page snapshot

```yaml
- button ""
- heading "Dashboard" [level=2]
- navigation:
  - link " Tasks":
    - /url: /index.html
  - link " Goals":
    - /url: /pages/goals.html
  - link " Calendar":
    - /url: /pages/calendar.html
  - link " Days Since":
    - /url: /pages/days-since.html
  - link " Food":
    - /url: /pages/food.html
  - link " Journal":
    - /url: /pages/journal.html
  - link " Product Tracking":
    - /url: /pages/product-tracking.html
  - link " Settings":
    - /url: /pages/settings.html
- heading "My Tasks" [level=1]
- text:  Enable notifications for task reminders
- button "Enable"
- heading "Task List" [level=2]
- combobox:
  - option "Unassigned, Today & Overdue" [selected]
  - option "Today"
  - option "This Week"
  - option "This Month"
  - option "All Tasks"
- checkbox
- text: test
- checkbox
- text: test
- checkbox
- text: improve calendar.html view for mobile like how ticktick takes the whole page
- checkbox
- text: improve calendar.html view for mobile like how ticktick takes the whole page
- checkbox
- text: scheudle badminton and other doctor appointments
- checkbox
- text: fix flashing check box
- checkbox
- text: bring flower for ryan
- checkbox
- text: add vidual confirm when adding a task
- checkbox
- text: Make uh the permement replacemment for exercuses in templates
- checkbox
- text: Replace ur ai journal with a free chatgpt
- checkbox
- text: fix the timing of the habit list reset it appears to reset at 7pm not at 11:59pm everday
- button ""
- checkbox
- text: "Grocery List (775 cal, 31.0% of target) Grocery list for selected recipes. Total calories: 774.5 (31.0% of daily target). Total protein: 29.0g (24.2% of daily target)."
- checkbox
- text: Generate a weekly complete list of all tasks everybsubday and by notification
- checkbox
- text: make the add task smaller and more condense on mobile
- heading "Completed Tasks (3) ▴" [level=3]
- checkbox [checked]
- text: "Clean Airpods ×2 Next: 6/15/2025 Overdue: Next: 6/17/2025 ↻ Every 2 months"
- checkbox [checked]
- text: "Yuvi's Bday Next: 5/15/2026 Overdue: 5/15/2025 ↻ Yearly 5/14/2025, 9:00:00 AM"
- checkbox [checked]
- text: fix the color of the edit button on adding a tak
- heading "Habit List" [level=2]
- button "+ New Habit"
- checkbox "Mark as done"
- text: "10g Creatine, L.Reuteri, Sigma Frequency: daily 0/1 Level 35"
- button ""
- button ""
- button "+1"
- text: "Gooning Frequency: daily 0/999 Level 28"
- button ""
- button ""
- button "+1"
- text: "Social Media Rejection (0/8) Frequency: daily 0/8 Level 11"
- button ""
- button ""
- button "+"
- link " Tasks":
  - /url: /index.html
- link " Goals":
  - /url: /pages/goals.html
- link " Workouts":
  - /url: /pages/workouts.html
- link " Calendar":
  - /url: /pages/calendar.html
- link " Food":
  - /url: /pages/food.html
```

# Test source

```ts
   1 | const { test, expect } = require('@playwright/test');
   2 |
   3 | test('Task creation should not create duplicates', async ({ page }) => {
   4 |   // Navigate to the application
   5 |   await page.goto('http://localhost:3000/');
   6 |   
   7 |   // Wait for the page to load
   8 |   await page.waitForSelector('#taskList');
   9 |   
  10 |   // Count the initial number of tasks
  11 |   const initialTaskCount = await page.locator('.task-item').count();
  12 |   console.log(`Initial task count: ${initialTaskCount}`);
  13 |   
  14 |   // Click the add task button
  15 |   await page.click('#addTaskFab');
  16 |   
  17 |   // Wait for the modal to appear
  18 |   await page.waitForSelector('#addTaskModal', { state: 'visible' });
  19 |   
  20 |   // Fill in the task details
  21 |   await page.fill('#taskTitle', 'Test Task - Duplicate Prevention');
  22 |   await page.fill('#taskDescription', 'This is a test task to verify duplicate prevention');
  23 |   
  24 |   // Set a due date (tomorrow)
  25 |   const tomorrow = new Date();
  26 |   tomorrow.setDate(tomorrow.getDate() + 1);
  27 |   const formattedDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  28 |   await page.fill('#taskDueDate', formattedDate);
  29 |   
  30 |   // Submit the form
> 31 |   await page.click('#addTaskBtn');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  32 |   
  33 |   // Wait for the task to be added and the modal to close
  34 |   await page.waitForSelector('#addTaskModal', { state: 'hidden' });
  35 |   
  36 |   // Wait for the task list to update
  37 |   await page.waitForTimeout(1000);
  38 |   
  39 |   // Count the number of tasks after adding
  40 |   const newTaskCount = await page.locator('.task-item').count();
  41 |   console.log(`New task count: ${newTaskCount}`);
  42 |   
  43 |   // Verify that only one task was added
  44 |   expect(newTaskCount).toBe(initialTaskCount + 1);
  45 |   
  46 |   // Verify the task was added with the correct title
  47 |   const taskTitles = await page.locator('.task-item .task-title').allTextContents();
  48 |   const newTaskExists = taskTitles.some(title => title.includes('Test Task - Duplicate Prevention'));
  49 |   expect(newTaskExists).toBeTruthy();
  50 |   
  51 |   // Check for duplicates
  52 |   const duplicateCount = taskTitles.filter(title => title.includes('Test Task - Duplicate Prevention')).length;
  53 |   expect(duplicateCount).toBe(1);
  54 |   
  55 |   console.log('Test completed successfully');
  56 | });
  57 |
```