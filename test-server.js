// A simple Express server for testing habit creation
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001; // Use a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route to test habit creation
app.post('/api/habits', async (req, res) => {
    console.log("Received POST /api/habits request", req.body);
    
    // Validate the request body
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    
    if (!req.body.title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        console.log("Creating new habit with:", JSON.stringify(req.body));
        
        // Create a simple object with just the required fields
        const habitData = {
            title: req.body.title.trim(),
            frequency: req.body.frequency || 'daily',
            completions_per_day: parseInt(req.body.completions_per_day || 1, 10)
        };
        
        console.log("Using simplified habitData:", JSON.stringify(habitData));
        
        // Check if the habits table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'habits'
            )
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('Habits table exists:', tableExists);
        
        if (!tableExists) {
            console.log('Creating habits table...');
            await db.query(`
                CREATE TABLE habits (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
                    completions_per_day INTEGER NOT NULL DEFAULT 1,
                    total_completions INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
            `);
            console.log('Habits table created successfully');
        }
        
        // Insert the habit directly
        console.log('Inserting habit with parameters:', [habitData.title, habitData.frequency, habitData.completions_per_day]);
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [habitData.title, habitData.frequency, habitData.completions_per_day]
        );
        
        const newHabit = { ...result.rows[0], completions_today: 0 };
        console.log("Habit created successfully:", newHabit);
        res.status(201).json(newHabit);
    } catch (err) {
        console.error('Error creating habit:', err);
        console.error('Error stack:', err.stack);

        // Return a more detailed error message
        res.status(500).json({ 
            error: 'Failed to create habit', 
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Try creating a habit with: curl -X POST -H "Content-Type: application/json" -d '{"title":"Test Habit","frequency":"daily","completions_per_day":1}' http://localhost:${PORT}/api/habits`);
});
