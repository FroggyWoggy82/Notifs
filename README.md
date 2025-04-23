# Notification Project

A personal productivity and fitness tracking application.

## Features

- Task management with recurring tasks
- Habit tracking
- Workout tracking with templates and exercise history
- Weight tracking with goal setting
- Food and nutrition tracking
- Journal with AI analysis
- Progress photo tracking

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the server: `node server.js`

## Railway Deployment

This project is configured for deployment on Railway. The `railway.toml` file specifies the build and deployment configuration.

### Running Migrations

If you need to create or update the database tables for exercise tracking, run:

```
node run-exercise-migration.js
```

This will create the following tables if they don't exist:
- `workout_logs` - Stores workout session data
- `exercise_logs` - Stores individual exercise performance data
- `exercise_preferences` - Stores user preferences for exercises (like weight units)

## Troubleshooting

### Missing Tables

If you encounter 404 errors when accessing workout-related endpoints, it might be because the required database tables don't exist. Run the migration script to create them:

```
node run-exercise-migration.js
```

### API Endpoints

The application provides various API endpoints for different features:

- `/api/tasks` - Task management
- `/api/habits` - Habit tracking
- `/api/workouts` - Workout tracking
- `/api/weight` - Weight tracking
- `/api/food` - Food tracking
- `/api/goals` - Goal management
- `/api/journal` - Journal entries

### Checking Database Tables

You can check if the required tables exist by accessing:

```
/api/exercise/check-tables
```

This will return information about whether the exercise-related tables exist in the database.

### API Endpoints for Exercise Data

The application provides the following API endpoints for exercise-related data:

- `/api/exercise/preferences/:exerciseId` - Get preferences for a specific exercise
- `/api/exercise/lastlog/:exerciseId` - Get the last log for a specific exercise
- `/api/exercise/check-tables` - Check if the required tables exist

For backward compatibility, the following original paths are also supported:

- `/api/exercise-preferences/:exerciseId` - Get preferences for a specific exercise
- `/api/workouts/exercises/:id/lastlog` - Get the last log for a specific exercise
