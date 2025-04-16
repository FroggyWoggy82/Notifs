const { CalorieTarget } = require('./models/weightModel');

async function testCalorieTarget() {
    try {
        console.log('Testing CalorieTarget model...');
        
        // Test saving a calorie target
        console.log('Saving calorie target for user 1...');
        const savedTarget = await CalorieTarget.saveTarget(1, 2000);
        console.log('Saved target:', savedTarget);
        
        // Test getting a calorie target
        console.log('Getting calorie target for user 1...');
        const target = await CalorieTarget.getTarget(1);
        console.log('Retrieved target:', target);
        
        console.log('Tests completed successfully!');
    } catch (err) {
        console.error('Error testing calorie target:', err);
    } finally {
        process.exit();
    }
}

testCalorieTarget();
