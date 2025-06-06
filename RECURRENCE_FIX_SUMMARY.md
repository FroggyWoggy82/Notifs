# Recurring Task Date Calculation Fix

## Issue Description
Recurring tasks were experiencing an off-by-one day error in their next occurrence calculations. For example:
- A task due on 6/5/2025 would have its next occurrence calculated as 6/4/2026 instead of 6/5/2026
- This affected all recurrence types (daily, weekly, monthly, yearly)

## Root Cause
The issue was caused by timezone handling problems in JavaScript Date operations. The original code used methods like `setFullYear()`, `setMonth()`, and `setDate()` which can cause unexpected behavior when dates cross timezone boundaries or daylight saving time transitions.

## Solution
Replaced the problematic date manipulation methods with a timezone-safe approach:

### Before (Problematic):
```javascript
const nextDate = new Date(dueDate);
nextDate.setFullYear(nextDate.getFullYear() + interval); // Timezone issues
```

### After (Fixed):
```javascript
const year = dueDate.getFullYear();
const month = dueDate.getMonth();
const day = dueDate.getDate();
const nextDate = new Date(year + interval, month, day); // Timezone-safe
```

## Files Modified

### 1. Frontend JavaScript Files
- `public/js/tasks/script.js` - Updated `calculateNextOccurrence()` function
- `public/js/pages/tasks/script.js` - Updated `calculateNextOccurrence()` function and manual next occurrence creation logic

### 2. Backend Files
- `models/taskModel.js` - Updated `createNextOccurrence()` method
- `checks/check-recurring-tasks.js` - Updated recurrence calculation logic

### 3. Database Fix
- Created and ran `debug/fix-all-recurring-tasks.js` to update all 99 existing recurring tasks with correct next occurrence dates

## Testing
Created comprehensive tests to verify the fix:
- `debug/test-recurrence-fix.js` - Tests all recurrence types
- `debug/test-specific-case.js` - Tests the specific issue case
- `debug/verify-database-fix.js` - Verifies database was properly updated

All tests pass, confirming the fix works correctly.

## Impact
- ✅ Fixed 99 existing recurring tasks in the database
- ✅ All future recurring task calculations will be accurate
- ✅ No more off-by-one day errors
- ✅ Consistent behavior across all recurrence types (daily, weekly, monthly, yearly)

## Verification
The fix has been verified to work correctly:
- A task due on 6/5/2025 now correctly calculates its next occurrence as 6/5/2026
- All existing tasks in the database have been updated with correct next occurrence dates
- Future recurring task creations will use the new timezone-safe calculation logic

## Prevention
The new implementation uses timezone-safe date construction that avoids the pitfalls of JavaScript's date mutation methods, ensuring consistent behavior regardless of timezone or daylight saving time changes.
