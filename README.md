# Notification Project

## Running the Server

### Normal Mode

To start the server with database connection:

```bash
node server.js
```

The server will run on port 3000 by default.

### Offline Mode

If you're having issues with the database connection or internet connectivity, you can run the server in offline mode:

```bash
node start-offline.js
```

Or on Windows, you can use the batch file:

```bash
start-offline.bat
```

In offline mode, the server will skip the database connection test and start without database features. This is useful for working on the frontend when you don't need database access.

## Troubleshooting

### Timeout Overflow Warnings

If you see warnings like this:

```
(node:1234) TimeoutOverflowWarning: 4115308103 does not fit into a 32-bit signed integer.
Timeout duration was set to 1.
```

These are harmless warnings related to how JavaScript handles large timeout values. The server has been updated to handle these warnings by using smaller timeout values. You can safely ignore these warnings.

### "Need an internet connection" Error

If you see an error message saying you need an internet connection even though you're connected to the internet, it's likely due to a database connection issue. Try running the server in offline mode as described above.

### Duplicate Subtasks in Edit Modal

If you notice duplicate subtasks appearing in the edit task modal, this is a known issue that has been fixed in version 4 of the subtasks fix script. The fix uses a MutationObserver to detect when subtasks are added to the DOM and removes any duplicates based on their titles. If you still encounter this issue, please make sure you're using the latest version of the application.

## Handling Port Conflicts

If you see an error like this:

```
Error: listen EADDRINUSE: address already in use :::3000
```

It means port 3000 is already in use by another process. You have a few options:

### Option 1: Kill the process using port 3000

Run the provided script to kill the process using port 3000:

```bash
node kill-server.js
```

Then try starting the server again.

### Option 2: Change the port

You can change the port by setting the PORT environment variable:

```bash
# On Windows
set PORT=3001
node server.js

# On Unix/Mac
PORT=3001 node server.js
```

### Option 3: Manually find and kill the process

#### On Windows:
1. Find the process using port 3000:
   ```
   netstat -ano | findstr :3000
   ```
2. Note the PID (Process ID) in the last column
3. Kill the process:
   ```
   taskkill /F /PID <PID>
   ```

#### On Unix/Mac:
1. Find the process using port 3000:
   ```
   lsof -i :3000
   ```
2. Note the PID (Process ID) in the second column
3. Kill the process:
   ```
   kill -9 <PID>
   ```

## Chart Controls

The weight chart has the following controls:

- **X-Axis Scale**: Adjusts the date range shown on the chart
- **Y-Axis Scale**: Adjusts the weight range shown on the chart
- **Reset Scale**: Resets both scales to show all data points

## API Endpoints

### Weight Goals
- GET `/api/weight/goal` - Get weight goal for a user
- POST `/api/weight/goal` - Save weight goal for a user
- GET `/api/weight/logs` - Get weight logs for a user
- POST `/api/weight/log` - Add a new weight log

### Calorie Targets
- GET `/api/calorie-targets/:userId` - Get calorie target for a user
- POST `/api/calorie-targets` - Save calorie target for a user

### Recipes
- GET `/api/recipes` - Get all recipes
- POST `/api/recipes` - Create a new recipe
- GET `/api/recipes/:id` - Get a specific recipe
- PUT `/api/recipes/:id` - Update a recipe
- DELETE `/api/recipes/:id` - Delete a recipe
