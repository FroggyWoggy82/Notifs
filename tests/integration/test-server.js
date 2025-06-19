const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/pages', express.static('public/pages'));

// Mock API endpoint for testing
app.post('/api/recipes', (req, res) => {
    console.log('Received recipe data:', req.body);
    
    // Simulate successful response
    res.json({
        id: Date.now(),
        name: req.body.name,
        ingredients: req.body.ingredients,
        message: 'Recipe saved successfully!'
    });
});

// Serve the food.html page
app.get('/pages/food.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'food.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log(`Food page: http://localhost:${PORT}/pages/food.html`);
});
