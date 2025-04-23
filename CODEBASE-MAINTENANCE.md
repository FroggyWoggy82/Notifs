# Codebase Maintenance Guide

This document provides guidelines for maintaining and extending the Notification Project codebase.

## Project Structure

```
notification_project/
├── controllers/        # Request handlers
├── models/             # Data logic
├── routes/             # API route definitions
├── docs/               # API documentation
├── public/             # Static files (Views)
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── pages/          # HTML pages
│   └── ...
├── migrations/         # Database migrations
├── db.js               # Database connection
├── server.js           # Main application file
└── package.json        # Dependencies and scripts
```

## Adding New Features

When adding a new feature, follow these steps to maintain the MVC architecture:

1. **Create a Model** in `models/` directory:
   - Handle all data-related logic
   - Interact with the database
   - Implement business logic

2. **Create a Controller** in `controllers/` directory:
   - Handle HTTP requests and responses
   - Use models to get/manipulate data
   - Don't include business logic

3. **Create Routes** in `routes/` directory:
   - Define API endpoints
   - Connect endpoints to controller methods
   - Include API documentation using JSDoc comments

4. **Update server.js** to use the new routes:
   - Import the route file
   - Mount the routes with `app.use()`

## Coding Standards

- Use consistent naming conventions:
  - Files: camelCase (e.g., `userModel.js`)
  - Classes: PascalCase (e.g., `UserController`)
  - Functions/methods: camelCase (e.g., `getUserById`)
  - Variables: camelCase (e.g., `userData`)

- Follow the Single Responsibility Principle:
  - Each file should have a single responsibility
  - Each class/module should do one thing well

- Error Handling:
  - Use try/catch blocks for async operations
  - Return appropriate HTTP status codes
  - Provide meaningful error messages

## API Documentation

The project uses Swagger/OpenAPI for API documentation:

- Access the documentation at `/api-docs` when the server is running
- Document API endpoints using JSDoc comments in route files
- Follow the Swagger format for parameters, responses, etc.

Example:
```javascript
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', TaskController.getAllTasks);
```

## Database Migrations

- Create new migrations in the `migrations/` directory
- Run migrations using `npm run migrate`
- Follow the naming convention: `NNN_description.sql` (e.g., `005_add_user_preferences.sql`)

## Testing

- Write tests for new features
- Run tests before committing changes
- Ensure all tests pass before deploying

## Deployment

- The application is deployed on Railway
- Commits to the main branch trigger automatic deployments
- Monitor the application after deployment to ensure it's working correctly
