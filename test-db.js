const db = require('./utils/db');

async function test() {
    try {
        console.log('Testing database connection...');
        const result = await db.query('SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = \'calorie_targets\')');
        console.log('Table check result:', result.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

test();
