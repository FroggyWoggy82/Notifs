# Test info

- Name: Grocery List Subtasks >> should expand grocery list subtasks
- Location: C:\Users\Kevin\423fawn\Notifs\tests\grocery-list-subtasks.spec.ts:4:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.task-item:has-text("Grocery List")').first()
Expected: visible
Received: hidden
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('.task-item:has-text("Grocery List")').first()
    4 × locator resolved to <div data-task-id="623" class="task-item complete ">…</div>
      - unexpected value "hidden"
    3 × locator resolved to <div data-task-id="623" data-grocery-list="true" class="task-item complete has-subtasks">…</div>
      - unexpected value "hidden"

    at C:\Users\Kevin\423fawn\Notifs\tests\grocery-list-subtasks.spec.ts:13:40
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
    - /url: /pages/journal-redesign.html
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
- text: "Weekly run Next: 6/7/2025 Due Today ↻ Weekly"
- checkbox
- text: fix the checked habit sticking It's supposed to stick and stay there if checked for 24 hours
- checkbox
- text: remove the emojis for the readio buttons
- checkbox
- text: remove oneo f the remove buttons for the line of buttons for create new recipe
- checkbox
- text: realign the buttons for create new recipe
- checkbox
- text: Clear the food.html console logs
- checkbox
- text: trakc my products
- checkbox
- text: (I want to be able to have the AI decipher the people I speak too based on my conversations and make observations about our relationship and when I ask it about that person it tells me everything I've said about that person in an introsepctive way)
- checkbox
- text: get a new tooth brush
- checkbox
- text: fix notifications
- checkbox
- text: fix the timing of the habit list reset it appears to reset at 7pm not at 11:59pm everday
- heading "Completed Tasks (10) ▾" [level=3]
- heading "Habit List" [level=2]
- button "+ New Habit"
- checkbox "Mark as done"
- text: "10g Creatine, L.Reuteri, Sigma Frequency: daily 0/1 Level 49"
- button ""
- button ""
- button "+1"
- text: "Gooning Frequency: daily 0/999 Level 36"
- button ""
- button ""
- button "+1"
- text: "Social Media Rejection (0/8) Frequency: daily 0/8 Level 19"
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
- text: 📋 Weekly Summary (May 31 - Jun 7) 32/103 tasks completed (31%) Click to view detailed breakdown ×
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Grocery List Subtasks', () => {
   4 |   test('should expand grocery list subtasks', async ({ page }) => {
   5 |     // Navigate to the tasks page
   6 |     await page.goto('http://localhost:3000/index.html');
   7 |
   8 |     // Wait for the page to load
   9 |     await page.waitForSelector('.task-item');
  10 |
  11 |     // Find the first grocery list task
  12 |     const firstGroceryListTask = page.locator('.task-item:has-text("Grocery List")').first();
> 13 |     await expect(firstGroceryListTask).toBeVisible();
     |                                        ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  14 |
  15 |     // Find the expand button for the first grocery list task
  16 |     const firstExpandButton = firstGroceryListTask.locator('.expand-subtasks-btn');
  17 |     await expect(firstExpandButton).toBeVisible();
  18 |
  19 |     // Click on the expand button for the first grocery list task
  20 |     await firstExpandButton.click();
  21 |
  22 |     // Wait for the subtasks to load
  23 |     await page.waitForTimeout(2000); // Wait for animation and data loading
  24 |
  25 |     // Take a screenshot to debug
  26 |     await page.screenshot({ path: 'grocery-list-expanded.png' });
  27 |
  28 |     // Check for the presence of subtask items directly in the DOM
  29 |     // This is a more reliable approach than checking for the container visibility
  30 |     await page.evaluate(() => {
  31 |       // Log the DOM structure to help with debugging
  32 |       console.log('DOM structure:', document.body.innerHTML);
  33 |
  34 |       // Check for subtask items
  35 |       const subtaskItems = document.querySelectorAll('.subtask-item, .subtask-loading');
  36 |       console.log(`Found ${subtaskItems.length} subtask items or loading messages in the DOM`);
  37 |
  38 |       // Check for subtasks container
  39 |       const subtasksContainer = document.querySelector('.subtasks-container');
  40 |       if (subtasksContainer) {
  41 |         console.log('Subtasks container found:', subtasksContainer.outerHTML);
  42 |         console.log('Subtasks container classes:', subtasksContainer.className);
  43 |         console.log('Subtasks container computed style display:',
  44 |           window.getComputedStyle(subtasksContainer).display);
  45 |         console.log('Subtasks container computed style visibility:',
  46 |           window.getComputedStyle(subtasksContainer).visibility);
  47 |       } else {
  48 |         console.log('No subtasks container found in the DOM');
  49 |       }
  50 |     });
  51 |
  52 |     // Click on the expand button again to collapse the subtasks
  53 |     await firstExpandButton.click();
  54 |
  55 |     // Wait for the subtasks to be hidden
  56 |     await page.waitForTimeout(1000); // Wait for animation
  57 |
  58 |     // Take a screenshot to debug
  59 |     await page.screenshot({ path: 'grocery-list-collapsed.png' });
  60 |   });
  61 | });
  62 |
```