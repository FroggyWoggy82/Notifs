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

// Function to create workout_templates table if it doesn't exist
async function createWorkoutTemplatesTable() {
    try {
        const exists = await tableExists('workout_templates');
        if (!exists) {
            console.log('Creating workout_templates table...');
            await db.query(`
                CREATE TABLE workout_templates (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    exercises JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('workout_templates table created successfully');
            
            // Add sample data
            await db.query(`
                INSERT INTO workout_templates (name, description, exercises)
                VALUES 
                ('Push Day', 'Chest, shoulders, and triceps workout', '[
                    {"name": "Bench Press", "sets": 4, "reps": "8-10"},
                    {"name": "Overhead Press", "sets": 3, "reps": "8-12"},
                    {"name": "Tricep Pushdowns", "sets": 3, "reps": "10-15"}
                ]'::jsonb),
                ('Pull Day', 'Back and biceps workout', '[
                    {"name": "Pull-ups", "sets": 4, "reps": "6-10"},
                    {"name": "Barbell Rows", "sets": 3, "reps": "8-12"},
                    {"name": "Bicep Curls", "sets": 3, "reps": "10-15"}
                ]'::jsonb),
                ('Leg Day', 'Lower body workout', '[
                    {"name": "Squats", "sets": 4, "reps": "8-10"},
                    {"name": "Romanian Deadlifts", "sets": 3, "reps": "8-12"},
                    {"name": "Leg Extensions", "sets": 3, "reps": "10-15"}
                ]'::jsonb)
            `);
            console.log('Sample workout templates added');
        } else {
            console.log('workout_templates table already exists');
        }
    } catch (error) {
        console.error('Error creating workout_templates table:', error);
    }
}

// Function to create progress_photos table if it doesn't exist
async function createProgressPhotosTable() {
    try {
        const exists = await tableExists('progress_photos');
        if (!exists) {
            console.log('Creating progress_photos table...');
            await db.query(`
                CREATE TABLE progress_photos (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    filepath VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('progress_photos table created successfully');
            
            // We can't add actual photos, but we can add placeholder records
            await db.query(`
                INSERT INTO progress_photos (filename, filepath, description)
                VALUES 
                ('sample1.jpg', '/uploads/progress_photos/sample1.jpg', 'Front progress photo'),
                ('sample2.jpg', '/uploads/progress_photos/sample2.jpg', 'Side progress photo'),
                ('sample3.jpg', '/uploads/progress_photos/sample3.jpg', 'Back progress photo')
            `);
            console.log('Sample progress photo records added');
        } else {
            console.log('progress_photos table already exists');
        }
    } catch (error) {
        console.error('Error creating progress_photos table:', error);
    }
}

// Function to create exercises table if it doesn't exist
async function createExercisesTable() {
    try {
        const exists = await tableExists('exercises');
        if (!exists) {
            console.log('Creating exercises table...');
            await db.query(`
                CREATE TABLE exercises (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    muscle_group VARCHAR(255),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('exercises table created successfully');
            
            // Add sample exercises
            await db.query(`
                INSERT INTO exercises (name, muscle_group, description)
                VALUES 
                ('Bench Press', 'Chest', 'Compound chest exercise'),
                ('Squat', 'Legs', 'Compound leg exercise'),
                ('Deadlift', 'Back', 'Compound back exercise'),
                ('Overhead Press', 'Shoulders', 'Compound shoulder exercise'),
                ('Pull-up', 'Back', 'Compound back exercise'),
                ('Barbell Row', 'Back', 'Compound back exercise'),
                ('Leg Press', 'Legs', 'Machine leg exercise'),
                ('Bicep Curl', 'Arms', 'Isolation arm exercise'),
                ('Tricep Extension', 'Arms', 'Isolation arm exercise'),
                ('Lateral Raise', 'Shoulders', 'Isolation shoulder exercise')
            `);
            console.log('Sample exercises added');
        } else {
            console.log('exercises table already exists');
        }
    } catch (error) {
        console.error('Error creating exercises table:', error);
    }
}

// Function to create food_entries table if it doesn't exist
async function createFoodEntriesTable() {
    try {
        const exists = await tableExists('food_entries');
        if (!exists) {
            console.log('Creating food_entries table...');
            await db.query(`
                CREATE TABLE food_entries (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    calories INTEGER,
                    protein FLOAT,
                    carbs FLOAT,
                    fat FLOAT,
                    date DATE DEFAULT CURRENT_DATE,
                    meal_type VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('food_entries table created successfully');
            
            // Add sample food entries
            await db.query(`
                INSERT INTO food_entries (name, calories, protein, carbs, fat, meal_type)
                VALUES 
                ('Chicken Breast', 165, 31, 0, 3.6, 'Lunch'),
                ('Brown Rice', 216, 5, 45, 1.8, 'Lunch'),
                ('Broccoli', 55, 3.7, 11.2, 0.6, 'Dinner'),
                ('Salmon', 206, 22, 0, 13, 'Dinner'),
                ('Oatmeal', 150, 5, 27, 2.5, 'Breakfast'),
                ('Banana', 105, 1.3, 27, 0.4, 'Snack')
            `);
            console.log('Sample food entries added');
        } else {
            console.log('food_entries table already exists');
        }
    } catch (error) {
        console.error('Error creating food_entries table:', error);
    }
}

// Main initialization function
async function initializeDatabase() {
    console.log('Starting database initialization...');
    
    try {
        await createWorkoutTemplatesTable();
        await createProgressPhotosTable();
        await createExercisesTable();
        await createFoodEntriesTable();
        
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error during database initialization:', error);
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
