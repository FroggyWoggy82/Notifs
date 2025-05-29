# Weekly Task List Feature

This document describes the new Weekly Task List feature that provides a comprehensive overview of all tasks organized by day and notification.

## Overview

The Weekly Task List feature generates a complete weekly breakdown of all tasks, including:
- **Daily breakdown** - Tasks organized by each day of the week (Sunday through Saturday)
- **Notification breakdown** - Tasks organized by their notification/reminder times
- **Summary statistics** - Total tasks, completion rates, and notification counts
- **Subtask support** - Parent tasks with their associated subtasks
- **Recurring task handling** - Automatic inclusion of recurring tasks that fall within the week

## API Endpoint

### GET `/api/tasks/weekly-complete-list`

Returns a comprehensive weekly list of all tasks organized by day and notification.

#### Parameters

- `startDate` (optional): Start date of the week in YYYY-MM-DD format. Defaults to current week's Sunday.

#### Response Format

```json
{
  "success": true,
  "weekStart": "2024-01-07",
  "weekEnd": "2024-01-13",
  "dailyBreakdown": {
    "sunday": [...],
    "monday": [...],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...],
    "saturday": [...]
  },
  "notificationBreakdown": [
    {
      "date": "2024-01-08",
      "time": "9:00 AM",
      "dateFormatted": "Monday, January 8",
      "tasks": [...]
    }
  ],
  "summary": {
    "totalTasks": 25,
    "completedTasks": 12,
    "pendingTasks": 13,
    "tasksWithNotifications": 8,
    "completionRate": 48
  }
}
```

#### Task Object Structure

Each task in the response includes enhanced fields:

```json
{
  "id": 123,
  "title": "Task Title",
  "description": "Task description",
  "assigned_date": "2024-01-08",
  "due_date": "2024-01-08",
  "reminder_time": "2024-01-08T09:00:00.000Z",
  "reminder_type": "same-day",
  "is_complete": false,
  "recurrence_type": "weekly",
  "recurrence_interval": 1,
  "parent_task_id": null,
  "is_subtask": false,
  "has_subtasks": true,
  "grocery_data": null,
  "task_type": "parent",
  "dateFormatted": "2024-01-08",
  "dayOfWeek": "monday",
  "hasSubtasks": true,
  "isSubtask": false,
  "reminderFormatted": "Mon, Jan 8, 9:00 AM",
  "subtasks": [...]
}
```

## Web Interface

### URL: `/weekly-task-list`

A responsive web interface that displays the weekly task list with:

#### Features

1. **Week Selector**
   - Date picker to select any week
   - "Current Week" button for quick access
   - Automatic Sunday-to-Saturday week calculation

2. **Summary Dashboard**
   - Total tasks count
   - Completed vs pending tasks
   - Completion percentage
   - Tasks with notifications count

3. **Tabbed Views**
   - **Daily View**: Tasks organized by day of the week
   - **Notifications View**: Tasks organized by notification time

4. **Task Display**
   - Visual completion status (checkboxes)
   - Task metadata (description, reminders, type)
   - Subtask indicators
   - Completed tasks styling

## Implementation Details

### Files Modified/Created

1. **`routes/taskRoutes.js`**
   - Added new route: `GET /weekly-complete-list`
   - Comprehensive Swagger documentation

2. **`controllers/taskController.js`**
   - Added `getWeeklyCompleteList` method
   - Week calculation logic
   - Error handling

3. **`models/taskModel.js`**
   - Added `getWeeklyCompleteList` method
   - Complex SQL query for task retrieval
   - Task enhancement and organization logic
   - Subtask loading

4. **`public/pages/weekly-task-list.html`**
   - Complete web interface
   - Responsive design
   - Interactive features

5. **`server.js`**
   - Added route for serving the HTML page

### Database Query Logic

The feature uses a comprehensive SQL query that includes:

```sql
SELECT 
    t.*,
    CASE 
        WHEN t.parent_task_id IS NOT NULL THEN 'subtask'
        WHEN t.has_subtasks = true THEN 'parent'
        ELSE 'standalone'
    END as task_type
FROM tasks t
WHERE 
    -- Tasks with assigned dates in the week
    (t.assigned_date >= $1::date AND t.assigned_date <= $2::date)
    OR
    -- Tasks with due dates in the week
    (t.due_date >= $1::date AND t.due_date <= $2::date)
    OR
    -- Tasks with reminder times in the week
    (t.reminder_time >= $1::timestamp AND t.reminder_time <= $2::timestamp)
    OR
    -- Recurring tasks that might have occurrences in the week
    (t.recurrence_type IS NOT NULL AND t.recurrence_type != 'none' AND t.due_date IS NOT NULL)
ORDER BY 
    COALESCE(t.assigned_date, t.due_date, t.created_at::date) ASC,
    t.reminder_time ASC NULLS LAST,
    t.is_complete ASC,
    t.created_at DESC
```

### Task Organization Logic

1. **Daily Breakdown**: Tasks are assigned to days based on `assigned_date` or `due_date`
2. **Notification Breakdown**: Tasks with `reminder_time` are grouped by date and time
3. **Subtask Loading**: Parent tasks automatically load their subtasks
4. **Task Enhancement**: Additional computed fields for display purposes

## Usage Examples

### API Usage

```javascript
// Get current week
const response = await fetch('/api/tasks/weekly-complete-list');
const data = await response.json();

// Get specific week
const response = await fetch('/api/tasks/weekly-complete-list?startDate=2024-01-07');
const data = await response.json();

// Access daily tasks
const mondayTasks = data.dailyBreakdown.monday;

// Access notifications
const notifications = data.notificationBreakdown;

// Access summary
const summary = data.summary;
console.log(`Completion rate: ${summary.completionRate}%`);
```

### Testing

Use the provided test script:

```bash
node test-weekly-list.js
```

This will test both current week and next week endpoints and display detailed results.

## Benefits

1. **Comprehensive Overview**: See all tasks for the entire week at once
2. **Multiple Perspectives**: View by day or by notification time
3. **Progress Tracking**: Clear completion statistics and rates
4. **Notification Management**: Easy overview of all scheduled reminders
5. **Subtask Support**: Full hierarchy display with parent-child relationships
6. **Recurring Task Handling**: Automatic inclusion of recurring tasks
7. **Responsive Design**: Works on desktop and mobile devices
8. **API Integration**: Can be integrated into other applications or dashboards

## Future Enhancements

Potential improvements could include:
- Export functionality (PDF, CSV)
- Task filtering and search
- Drag-and-drop task rescheduling
- Calendar integration
- Team/shared task support
- Custom week start days (Monday vs Sunday)
- Time zone support
- Print-friendly layouts
