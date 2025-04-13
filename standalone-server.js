// A standalone server for testing habit creation
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

// Create a new Express app
const app = express();
const PORT = 3002; // Use a different port to avoid conflicts

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the same database module as the main server
const db = require('./db');

// Use the query function from the db module
const query = db.query;

// Define routes
app.get('/', (req, res) => {
    res.send('Standalone server for testing habit creation');
});

// CREATE a new habit - Extremely simplified version
app.post('/api/habits', (req, res) => {
    console.log("Received POST /api/habits request", req.body);

    // Validate the request body
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!req.body.title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    // Create a simple object with just the required fields
    const title = req.body.title.trim();
    const frequency = req.body.frequency || 'daily';
    const completions_per_day = parseInt(req.body.completions_per_day || 1, 10);

    console.log("Using simplified habitData:", { title, frequency, completions_per_day });

    // Insert the habit directly using simple query
    query(
        'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
        [title, frequency, completions_per_day]
    )
    .then(result => {
        const newHabit = { ...result.rows[0], completions_today: 0 };
        console.log("Habit created successfully:", newHabit);
        res.status(201).json(newHabit);
    })
    .catch(err => {
        console.error('Error creating habit:', err);
        res.status(500).json({ error: 'Failed to create habit', message: err.message });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Standalone server running on port ${PORT}`);
    console.log(`Try creating a habit with: curl -X POST -H "Content-Type: application/json" -d '{"title":"Test Habit","frequency":"daily","completions_per_day":1}' http://localhost:${PORT}/api/habits`);
});
