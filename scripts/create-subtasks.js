/**
 * Script to create subtasks for testing
 */

const db = require('../utils/db');

async function createSubtasks() {
    try {
        console.log('Creating subtasks for testing...');

        // Create subtasks for task ID 393 (Parent Task with Subtasks)
        const subtasks1 = [
            {
                title: 'Subtask 1 for Parent Task',
                description: 'This is the first subtask',
                parent_task_id: 393,
                is_subtask: true
            },
            {
                title: 'Subtask 2 for Parent Task',
                description: 'This is the second subtask',
                parent_task_id: 393,
                is_subtask: true
            },
            {
                title: 'Subtask 3 for Parent Task',
                description: 'This is the third subtask',
                parent_task_id: 393,
                is_subtask: true
            }
        ];

        // Create subtasks for task ID 388 (Test Task with Subtasks)
        const subtasks2 = [
            {
                title: 'Subtask 1 for Test Task',
                description: 'This is the first test subtask',
                parent_task_id: 388,
                is_subtask: true
            },
            {
                title: 'Subtask 2 for Test Task',
                description: 'This is the second test subtask',
                parent_task_id: 388,
                is_subtask: true
            }
        ];

        // Create subtasks for task ID 391 (Test Parent Task 2)
        const subtasks3 = [
            {
                title: 'Subtask 1 for Test Parent Task 2',
                description: 'This is the first subtask for test parent task 2',
                parent_task_id: 391,
                is_subtask: true
            },
            {
                title: 'Subtask 2 for Test Parent Task 2',
                description: 'This is the second subtask for test parent task 2',
                parent_task_id: 391,
                is_subtask: true
            }
        ];

        // Insert all subtasks
        const allSubtasks = [...subtasks1, ...subtasks2, ...subtasks3];
        
        for (const subtask of allSubtasks) {
            const result = await db.query(
                `INSERT INTO tasks (title, description, parent_task_id, is_subtask)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [subtask.title, subtask.description, subtask.parent_task_id, subtask.is_subtask]
            );
            
            console.log(`Created subtask with ID ${result.rows[0].id}: ${subtask.title}`);
        }

        console.log('All subtasks created successfully!');
    } catch (error) {
        console.error('Error creating subtasks:', error);
    } finally {
        // Close the database connection
        process.exit(0);
    }
}

// Run the function
createSubtasks();
