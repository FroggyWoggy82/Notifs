// Database initialization script
const db = require('./db');

// Function to check if a table exists
async function tableExists(tableName) {
    try {
        const result = await db.query(`SELECT to_regclass('public.${tableName}') as exists`);
        return !!result.rows[0].exists;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
    }
}

// Function to check if a table has data
async function tableHasData(tableName) {
    try {
        const exists = await tableExists(tableName);
        if (!exists) return false;

        const result = await db.query(`SELECT COUNT(*) FROM ${tableName}`);
        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error(`Error checking if table ${tableName} has data:`, error);
        return false;
    }
}

// Function to check workout_templates table
async function checkWorkoutTemplatesTable() {
    try {
        const exists = await tableExists('workout_templates');
        if (exists) {
            console.log('workout_templates table exists');
            const hasData = await tableHasData('workout_templates');
            console.log(`workout_templates table ${hasData ? 'has' : 'does not have'} data`);
        } else {
            console.log('workout_templates table does not exist');
        }
    } catch (error) {
        console.error('Error checking workout_templates table:', error);
    }
}

// Function to check progress_photos table
async function checkProgressPhotosTable() {
    try {
        const exists = await tableExists('progress_photos');
        if (exists) {
            console.log('progress_photos table exists');
            const hasData = await tableHasData('progress_photos');
            console.log(`progress_photos table ${hasData ? 'has' : 'does not have'} data`);
        } else {
            console.log('progress_photos table does not exist');
        }
    } catch (error) {
        console.error('Error checking progress_photos table:', error);
    }
}

// Function to check exercises table
async function checkExercisesTable() {
    try {
        const exists = await tableExists('exercises');
        if (exists) {
            console.log('exercises table exists');
            const hasData = await tableHasData('exercises');
            console.log(`exercises table ${hasData ? 'has' : 'does not have'} data`);
        } else {
            console.log('exercises table does not exist');
        }
    } catch (error) {
        console.error('Error checking exercises table:', error);
    }
}

// Function to check food_entries table
async function checkFoodEntriesTable() {
    try {
        const exists = await tableExists('food_entries');
        if (exists) {
            console.log('food_entries table exists');
            const hasData = await tableHasData('food_entries');
            console.log(`food_entries table ${hasData ? 'has' : 'does not have'} data`);
        } else {
            console.log('food_entries table does not exist');
        }
    } catch (error) {
        console.error('Error checking food_entries table:', error);
    }
}

// Main initialization function
async function initializeDatabase() {
    console.log('Starting database check...');

    try {
        await checkWorkoutTemplatesTable();
        await checkProgressPhotosTable();
        await checkExercisesTable();
        await checkFoodEntriesTable();

        // Check other important tables
        const tables = [
            'weight_goals', 'weight_logs', 'workout_logs', 'workout_exercises',
            'workouts', 'recipes', 'ingredients', 'tasks', 'habits', 'habit_completions',
            'goals', 'journal_entries', 'calorie_targets'
        ];

        for (const table of tables) {
            const exists = await tableExists(table);
            if (exists) {
                console.log(`${table} table exists`);
                const hasData = await tableHasData(table);
                console.log(`${table} table ${hasData ? 'has' : 'does not have'} data`);
            } else {
                console.log(`${table} table does not exist`);
            }
        }

        console.log('Database check completed successfully');
    } catch (error) {
        console.error('Error during database check:', error);
    }
}

// Export the initialization function
module.exports = {
    initializeDatabase
};

// If this script is run directly, initialize the database
if (require.main === module) {
    initializeDatabase().then(() => {
        console.log('Database initialization script completed');
        process.exit(0);
    }).catch(error => {
        console.error('Database initialization script failed:', error);
        process.exit(1);
    });
}
