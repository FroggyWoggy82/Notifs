# MVC Architecture for Notification Project

This README explains the new MVC (Model-View-Controller) architecture implemented for the Notification Project.

## Directory Structure

```
notification_project/
├── controllers/        # Request handlers
├── models/             # Data logic
├── routes/             # API route definitions
├── docs/               # API documentation
├── public/             # Static files (Views)
├── db.js               # Database connection
├── server.js           # Main application file
└── server.new.js       # New modular server file
```

## Components

### Models

Models handle all data-related logic. They interact with the database and implement business logic.

Example:
```javascript
// models/weightModel.js
class WeightGoal {
    static async getGoal(userId) {
        // Database interaction
    }
}
```

### Controllers

Controllers handle the request/response cycle for the API. They use models to get data and send responses.

Example:
```javascript
// controllers/weightController.js
class WeightController {
    static async getGoal(req, res) {
        // Process request and use model
        const goal = await WeightGoal.getGoal(userId);
        res.json(goal);
    }
}
```

### Routes

Routes define the API endpoints and connect them to controller methods.

Example:
```javascript
// routes/weightRoutes.js
router.get('/goal', WeightController.getGoal);
```

## API Documentation

API documentation is generated using Swagger/OpenAPI. Access the documentation at `/api-docs` when the server is running.

## How to Migrate

1. Install the required dependencies:
   ```
   node update-dependencies.js
   npm install
   ```

2. Replace the current server.js with the new modular version:
   ```
   mv server.js server.old.js
   mv server.new.js server.js
   ```

3. Start the server:
   ```
   npm start
   ```

4. Access the API documentation at http://localhost:3000/api-docs

## Adding New Features

To add a new feature:

1. Create a model in the `models/` directory
2. Create a controller in the `controllers/` directory
3. Create routes in the `routes/` directory
4. Import and use the routes in `server.js`

## Benefits of MVC Architecture

- **Separation of Concerns**: Each component has a specific responsibility
- **Maintainability**: Easier to understand and modify code
- **Testability**: Components can be tested in isolation
- **Scalability**: Easier to add new features
- **Reusability**: Components can be reused across the application
