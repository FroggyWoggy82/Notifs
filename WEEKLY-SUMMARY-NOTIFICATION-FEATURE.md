# Weekly Summary Notification Feature

This document describes the new Weekly Summary Notification feature that automatically shows a clickable notification popup on Sundays with weekly task completion statistics.

## Overview

The Weekly Summary Notification feature provides:
- **Automatic Sunday notifications** - Shows a popup notification every Sunday with weekly task completion summary
- **Clickable notification** - Click to open the detailed weekly task list view
- **Smart display logic** - Only shows once per day and only on Sundays
- **Visual completion indicators** - Different icons and colors based on completion rate
- **Seamless integration** - Uses the existing notification system on index.html

## How It Works

### Automatic Display
- **Trigger**: Automatically checks when the main page (index.html) loads
- **Day Check**: Only displays on Sundays (day 0 of the week)
- **Frequency**: Shows once per day maximum (tracked in localStorage)
- **Timing**: Appears 2 seconds after page load to avoid interfering with other notifications

### Notification Content
The notification displays:
- **Week range** (e.g., "Jan 7 - Jan 13")
- **Completion statistics** (e.g., "12/25 tasks completed (48%)")
- **Visual indicator** based on completion rate:
  - 🏆 Green border (80%+ completion)
  - ⭐ Orange border (60-79% completion)
  - 📊 Blue border (40-59% completion)
  - 📋 Gray border (<40% completion)

### Click Behavior
When clicked, the notification:
- Opens the detailed weekly task list in a new tab
- Shows the full weekly breakdown with daily and notification views
- Preserves the current page state

## Implementation Details

### Files Created/Modified

1. **`public/js/weekly-summary-notification.js`**
   - Main notification logic
   - Sunday detection
   - API integration
   - Click handling

2. **`public/index.html`**
   - Added script import for the notification system

3. **`server.js`**
   - Added route for test page

4. **`public/pages/test-weekly-notification.html`**
   - Test interface for manual testing

5. **`test-weekly-notification.js`**
   - Automated test script using Playwright

### Key Functions

#### `isSunday()`
```javascript
function isSunday() {
    const today = new Date();
    return today.getDay() === 0; // 0 = Sunday
}
```

#### `hasShownNotificationToday()`
```javascript
function hasShownNotificationToday() {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('weeklyNotificationLastShown');
    return lastShown === today;
}
```

#### `createWeeklySummaryNotification(summaryData)`
Creates and displays the notification with:
- Dynamic styling based on completion rate
- Click handler for opening weekly task list
- Auto-close after 10 seconds
- Close button functionality

### API Integration

The notification fetches data from the existing weekly API endpoint:
```javascript
GET /api/tasks/weekly-complete-list
```

Returns summary data including:
- Total tasks for the week
- Completed vs pending tasks
- Completion percentage
- Tasks with notifications

### Styling

The notification uses:
- **Dark theme** consistent with the app design
- **Gradient background** for visual appeal
- **Hover effects** to indicate clickability
- **Responsive design** that works on mobile and desktop
- **Color-coded borders** based on completion rate

## Usage Examples

### Automatic Usage
The notification appears automatically on Sundays when users visit the main page. No user action required.

### Manual Testing
For testing purposes, you can:

1. **Visit test page**: `http://localhost:3000/test-weekly-notification`
2. **Force show notification**: Use the "Force Show Notification" button
3. **Test API**: Use the "Test Weekly API" button
4. **Clear history**: Use "Clear Notification History" to reset daily limit

### Programmatic Usage
```javascript
// Force show notification (for testing)
window.WeeklySummaryNotification.forceShow();

// Check and show if conditions are met
window.WeeklySummaryNotification.checkAndShow();
```

## Configuration

### Timing Settings
- **Display delay**: 2 seconds after page load
- **Auto-close**: 10 seconds (longer than normal notifications)
- **Check interval**: Every 30 minutes while page is open

### Storage
- **localStorage key**: `weeklyNotificationLastShown`
- **Value**: Date string (e.g., "Sun Jan 07 2024")
- **Purpose**: Prevent showing multiple times per day

### Completion Rate Thresholds
- **Excellent** (🏆): 80%+ completion - Green border
- **Good** (⭐): 60-79% completion - Orange border  
- **Moderate** (📊): 40-59% completion - Blue border
- **Low** (📋): <40% completion - Gray border

## Testing

### Manual Testing
1. Visit: `http://localhost:3000/test-weekly-notification`
2. Use the test controls to verify functionality
3. Check notification appearance and click behavior

### Automated Testing
```bash
node test-weekly-notification.js
```

This will:
- Open the main page in a browser
- Force show the notification
- Test click functionality
- Verify API endpoint
- Check Sunday detection logic

### Browser Console Testing
```javascript
// Force show notification
await WeeklySummaryNotification.forceShow();

// Check if today is Sunday
new Date().getDay() === 0

// Clear notification history
localStorage.removeItem('weeklyNotificationLastShown');
```

## Integration with Existing Systems

### Notification System
- Uses the existing `NotificationSystem` infrastructure
- Follows the same styling patterns and animations
- Integrates with the notification container system

### Weekly Task List
- Leverages the existing `/api/tasks/weekly-complete-list` endpoint
- Opens the existing `/weekly-task-list` page when clicked
- No additional backend changes required

### Local Storage
- Uses browser localStorage for tracking display history
- Respects user privacy (data stays local)
- Automatically cleans up old entries

## Benefits

1. **Proactive Engagement**: Users get weekly progress updates without having to navigate to a separate page
2. **Contextual Timing**: Shows on Sundays when users are likely planning their upcoming week
3. **Non-Intrusive**: Only shows once per day and auto-closes
4. **Actionable**: Click to get detailed breakdown and plan improvements
5. **Visual Feedback**: Immediate understanding of performance through color coding
6. **Seamless Integration**: Works with existing notification system and UI patterns

## Future Enhancements

Potential improvements could include:
- **Customizable day**: Allow users to choose which day to show the summary
- **Completion goals**: Set weekly completion targets and show progress
- **Trend analysis**: Show improvement/decline compared to previous weeks
- **Motivational messages**: Different messages based on performance
- **Snooze functionality**: Allow users to snooze and see the notification later
- **Email/push integration**: Send summary via other notification channels
- **Team sharing**: Share weekly summaries with team members or accountability partners
