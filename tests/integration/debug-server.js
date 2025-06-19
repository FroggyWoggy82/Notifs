try {
    console.log('Starting server...');
    require('./server.js');
} catch (error) {
    console.error('Server startup error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
