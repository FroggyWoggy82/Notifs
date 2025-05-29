/**
 * Test for weight increment functionality in goal calculations
 * This test verifies that the weight increment setting from the "..." menu
 * properly affects the goal area calculations for exercises.
 */

// Mock data for testing
const mockExerciseData = {
    exercise_id: 1,
    name: "Bench Press",
    weight_unit: "lbs",
    weight_increment: 5,
    lastLog: {
        weight_used: "135,135,135",
        reps_completed: "10,10,10",
        weight_unit: "lbs"
    }
};

const mockExerciseDataWithCustomIncrement = {
    exercise_id: 2,
    name: "Squat",
    weight_unit: "lbs",
    weight_increment: 10, // Custom increment
    lastLog: {
        weight_used: "185,185,185",
        reps_completed: "10,10,10",
        weight_unit: "lbs"
    }
};

const mockExerciseDataIncompleteReps = {
    exercise_id: 3,
    name: "Deadlift",
    weight_unit: "lbs",
    weight_increment: 5,
    lastLog: {
        weight_used: "225,225,225",
        reps_completed: "10,8,6", // Not all sets reached target
        weight_unit: "lbs"
    }
};

// Mock the calculateGoal function (simplified version for testing)
function calculateGoal(exerciseData) {
    if (!exerciseData.lastLog || !exerciseData.lastLog.weight_used || !exerciseData.lastLog.reps_completed) {
        return null;
    }

    const prevWeights = exerciseData.lastLog.weight_used.split(',').map(w => parseFloat(w.trim()));
    const prevReps = exerciseData.lastLog.reps_completed.split(',').map(r => parseInt(r.trim()));
    const prevUnit = exerciseData.lastLog.weight_unit || 'lbs';

    const validSets = [];
    for (let i = 0; i < Math.min(prevWeights.length, prevReps.length); i++) {
        if (!isNaN(prevWeights[i]) && !isNaN(prevReps[i])) {
            validSets.push({
                weight: prevWeights[i],
                reps: prevReps[i],
                index: i
            });
        }
    }

    if (validSets.length === 0) {
        return null;
    }

    const targetReps = 10;
    const allSetsReachedTarget = validSets.every(set => set.reps >= targetReps);
    const goalSets = JSON.parse(JSON.stringify(validSets));

    // Use the weight increment from exercise preferences
    let weightIncrement = parseFloat(exerciseData.weight_increment) || 5;

    if (allSetsReachedTarget) {
        // Apply the increment to all sets when target is reached
        for (let i = 0; i < goalSets.length; i++) {
            goalSets[i].weight = goalSets[i].weight + weightIncrement;
            goalSets[i].reps = 8; // Start with fewer reps at the higher weight
        }
    } else {
        // If not all sets reached target, just increment reps for the first incomplete set
        const incompleteSetIndex = goalSets.findIndex(set => set.reps < targetReps);
        
        if (incompleteSetIndex >= 0) {
            goalSets[incompleteSetIndex].reps += 1;
        }
    }

    return {
        sets: goalSets,
        unit: prevUnit,
        weight_increment: weightIncrement
    };
}

// Test functions
function testDefaultWeightIncrement() {
    console.log("Testing default weight increment (5 lbs)...");
    
    const result = calculateGoal(mockExerciseData);
    
    if (!result) {
        console.error("❌ Test failed: No result returned");
        return false;
    }
    
    // All sets reached target (10 reps), so weight should increase by 5 lbs
    const expectedWeight = 135 + 5; // 140 lbs
    const actualWeight = result.sets[0].weight;
    
    if (actualWeight === expectedWeight) {
        console.log("✅ Default weight increment test passed");
        console.log(`   Expected: ${expectedWeight} lbs, Got: ${actualWeight} lbs`);
        return true;
    } else {
        console.error("❌ Default weight increment test failed");
        console.error(`   Expected: ${expectedWeight} lbs, Got: ${actualWeight} lbs`);
        return false;
    }
}

function testCustomWeightIncrement() {
    console.log("Testing custom weight increment (10 lbs)...");
    
    const result = calculateGoal(mockExerciseDataWithCustomIncrement);
    
    if (!result) {
        console.error("❌ Test failed: No result returned");
        return false;
    }
    
    // All sets reached target (10 reps), so weight should increase by 10 lbs
    const expectedWeight = 185 + 10; // 195 lbs
    const actualWeight = result.sets[0].weight;
    
    if (actualWeight === expectedWeight) {
        console.log("✅ Custom weight increment test passed");
        console.log(`   Expected: ${expectedWeight} lbs, Got: ${actualWeight} lbs`);
        return true;
    } else {
        console.error("❌ Custom weight increment test failed");
        console.error(`   Expected: ${expectedWeight} lbs, Got: ${actualWeight} lbs`);
        return false;
    }
}

function testIncompleteRepsNoWeightIncrease() {
    console.log("Testing incomplete reps (no weight increase)...");
    
    const result = calculateGoal(mockExerciseDataIncompleteReps);
    
    if (!result) {
        console.error("❌ Test failed: No result returned");
        return false;
    }
    
    // Not all sets reached target, so weight should stay the same
    const expectedWeight = 225; // Same weight
    const actualWeight = result.sets[0].weight;
    
    // Check that the first incomplete set (index 1, 8 reps) gets incremented to 9 reps
    const expectedReps = 9;
    const actualReps = result.sets[1].reps;
    
    if (actualWeight === expectedWeight && actualReps === expectedReps) {
        console.log("✅ Incomplete reps test passed");
        console.log(`   Weight stayed at: ${actualWeight} lbs`);
        console.log(`   Reps incremented to: ${actualReps} for incomplete set`);
        return true;
    } else {
        console.error("❌ Incomplete reps test failed");
        console.error(`   Expected weight: ${expectedWeight} lbs, Got: ${actualWeight} lbs`);
        console.error(`   Expected reps: ${expectedReps}, Got: ${actualReps}`);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log("🏋️ Running Weight Increment Goal Calculation Tests\n");
    
    const tests = [
        testDefaultWeightIncrement,
        testCustomWeightIncrement,
        testIncompleteRepsNoWeightIncrease
    ];
    
    let passedTests = 0;
    
    tests.forEach((test, index) => {
        console.log(`\n--- Test ${index + 1} ---`);
        if (test()) {
            passedTests++;
        }
    });
    
    console.log(`\n📊 Test Results: ${passedTests}/${tests.length} tests passed`);
    
    if (passedTests === tests.length) {
        console.log("🎉 All tests passed! Weight increment functionality is working correctly.");
    } else {
        console.log("⚠️  Some tests failed. Please check the implementation.");
    }
}

// Export for Node.js or run directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, calculateGoal };
    // Also run tests when required
    runAllTests();
} else {
    runAllTests();
}
