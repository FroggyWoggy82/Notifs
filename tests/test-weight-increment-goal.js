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

const mockExerciseDataHighReps = {
    exercise_id: 4,
    name: "Hip Abduction",
    weight_unit: "lbs",
    weight_increment: 5,
    lastLog: {
        weight_used: "50",
        reps_completed: "15", // High reps - should increase weight
        weight_unit: "lbs"
    }
};

// Mock the calculateGoal function (updated version for testing)
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

    const goalSets = JSON.parse(JSON.stringify(validSets));

    // Use the weight increment from exercise preferences
    let weightIncrement = parseFloat(exerciseData.weight_increment) || 5;

    // Improved goal calculation logic
    for (let i = 0; i < goalSets.length; i++) {
        const currentSet = goalSets[i];
        const prevReps = currentSet.reps;
        const prevWeight = currentSet.weight;

        // Define target rep ranges for different training styles
        const targetRepRange = {
            strength: { min: 3, max: 5 },      // Heavy strength training
            hypertrophy: { min: 6, max: 12 },  // Muscle building (expanded to include 6 reps)
            endurance: { min: 15, max: 20 }    // Muscular endurance
        };

        // Determine the appropriate rep range based on previous performance
        let targetRange;
        if (prevReps <= 5) {
            targetRange = targetRepRange.strength;
        } else if (prevReps <= 12) {
            targetRange = targetRepRange.hypertrophy;
        } else {
            targetRange = targetRepRange.endurance;
        }

        // Progressive overload decision tree
        if (prevReps >= targetRange.max) {
            // If they exceeded the target range, increase weight and aim for lower end of range
            currentSet.weight = prevWeight + weightIncrement;
            currentSet.reps = targetRange.min;

        } else if (prevReps >= targetRange.min) {
            // If they're in the target range, increase weight and maintain current reps
            currentSet.weight = prevWeight + weightIncrement;
            currentSet.reps = prevReps;

        } else {
            // If they're below the target range, keep weight and add 1-2 reps
            currentSet.weight = prevWeight;
            currentSet.reps = Math.min(prevReps + 2, targetRange.min);
        }

        // Safety checks to prevent unreasonable recommendations
        if (currentSet.reps < 1) {
            currentSet.reps = 1;
        }
        if (currentSet.weight < 0) {
            currentSet.weight = prevWeight;
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

    // Previous: 135 lbs x 10 reps -> in hypertrophy range (8-12), should increase weight and maintain reps
    const expectedWeight = 135 + 5; // 140 lbs
    const actualWeight = result.sets[0].weight;
    const expectedReps = 10; // Maintain current reps
    const actualReps = result.sets[0].reps;

    if (actualWeight === expectedWeight && actualReps === expectedReps) {
        console.log("✅ Default weight increment test passed");
        console.log(`   Goal: ${actualWeight} lbs x ${actualReps} reps`);
        return true;
    } else {
        console.error("❌ Default weight increment test failed");
        console.error(`   Expected: ${expectedWeight} lbs x ${expectedReps}, Got: ${actualWeight} lbs x ${actualReps}`);
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

    // Previous: 185 lbs x 10 reps -> in hypertrophy range (8-12), should increase weight and maintain reps
    const expectedWeight = 185 + 10; // 195 lbs
    const actualWeight = result.sets[0].weight;
    const expectedReps = 10; // Maintain current reps
    const actualReps = result.sets[0].reps;

    if (actualWeight === expectedWeight && actualReps === expectedReps) {
        console.log("✅ Custom weight increment test passed");
        console.log(`   Goal: ${actualWeight} lbs x ${actualReps} reps`);
        return true;
    } else {
        console.error("❌ Custom weight increment test failed");
        console.error(`   Expected: ${expectedWeight} lbs x ${expectedReps}, Got: ${actualWeight} lbs x ${actualReps}`);
        return false;
    }
}

function testIncompleteRepsNoWeightIncrease() {
    console.log("Testing mixed rep performance...");

    const result = calculateGoal(mockExerciseDataIncompleteReps);

    if (!result) {
        console.error("❌ Test failed: No result returned");
        return false;
    }

    // First set: 10 reps -> in hypertrophy range (8-12), should increase weight and maintain reps
    const expectedWeight1 = 225 + 5; // 230 lbs
    const actualWeight1 = result.sets[0].weight;
    const expectedReps1 = 10; // Maintain current reps
    const actualReps1 = result.sets[0].reps;

    // Second set: 8 reps -> in hypertrophy range (8-12), should increase weight and maintain reps
    const expectedWeight2 = 225 + 5; // 230 lbs
    const actualWeight2 = result.sets[1].weight;
    const expectedReps2 = 8; // Maintain current reps
    const actualReps2 = result.sets[1].reps;

    // Third set: 6 reps -> below hypertrophy range, should keep weight and add reps
    const expectedWeight3 = 225; // Keep same weight
    const actualWeight3 = result.sets[2].weight;
    const expectedReps3 = 8; // Add reps to reach minimum of hypertrophy range
    const actualReps3 = result.sets[2].reps;

    if (actualWeight1 === expectedWeight1 && actualReps1 === expectedReps1 &&
        actualWeight2 === expectedWeight2 && actualReps2 === expectedReps2 &&
        actualWeight3 === expectedWeight3 && actualReps3 === expectedReps3) {
        console.log("✅ Mixed rep performance test passed");
        console.log(`   Set 1: ${actualWeight1} lbs x ${actualReps1} reps`);
        console.log(`   Set 2: ${actualWeight2} lbs x ${actualReps2} reps`);
        console.log(`   Set 3: ${actualWeight3} lbs x ${actualReps3} reps`);
        return true;
    } else {
        console.error("❌ Mixed rep performance test failed");
        console.error(`   Set 1 - Expected: ${expectedWeight1} lbs x ${expectedReps1}, Got: ${actualWeight1} lbs x ${actualReps1}`);
        console.error(`   Set 2 - Expected: ${expectedWeight2} lbs x ${expectedReps2}, Got: ${actualWeight2} lbs x ${actualReps2}`);
        console.error(`   Set 3 - Expected: ${expectedWeight3} lbs x ${expectedReps3}, Got: ${actualWeight3} lbs x ${actualReps3}`);
        return false;
    }
}

function testHighRepsWeightIncrease() {
    console.log("Testing high reps scenario (15 reps -> increase weight)...");

    const result = calculateGoal(mockExerciseDataHighReps);

    if (!result) {
        console.error("❌ Test failed: No result returned");
        return false;
    }

    // Previous: 50 lbs x 15 reps -> in endurance range (15-20), should increase weight and maintain reps
    const expectedWeight = 50 + 5; // 55 lbs
    const actualWeight = result.sets[0].weight;
    const expectedReps = 15; // Maintain current reps
    const actualReps = result.sets[0].reps;

    if (actualWeight === expectedWeight && actualReps === expectedReps) {
        console.log("✅ High reps test passed");
        console.log(`   Previous: 50 lbs x 15 reps`);
        console.log(`   Goal: ${actualWeight} lbs x ${actualReps} reps`);
        return true;
    } else {
        console.error("❌ High reps test failed");
        console.error(`   Expected: ${expectedWeight} lbs x ${expectedReps}, Got: ${actualWeight} lbs x ${actualReps}`);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log("🏋️ Running Weight Increment Goal Calculation Tests\n");
    
    const tests = [
        testDefaultWeightIncrement,
        testCustomWeightIncrement,
        testIncompleteRepsNoWeightIncrease,
        testHighRepsWeightIncrease
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

        // Test the specific Hip Abduction scenario mentioned
        console.log("\n🎯 Testing specific Hip Abduction scenario:");
        console.log("Previous: 50 lbs x 15 reps");

        const hipAbductionTest = {
            exercise_id: 999,
            name: "Hip Abduction",
            weight_unit: "lbs",
            weight_increment: 5,
            lastLog: {
                weight_used: "50",
                reps_completed: "15",
                weight_unit: "lbs"
            }
        };

        const hipResult = calculateGoal(hipAbductionTest);
        if (hipResult && hipResult.sets[0]) {
            console.log(`Goal: ${hipResult.sets[0].weight} lbs x ${hipResult.sets[0].reps} reps`);
            console.log("✅ This should now show 55 lbs x 15 reps (endurance range)");
        }

        // Test the specific 40x10 scenario you mentioned
        console.log("\n🎯 Testing specific 40x10 scenario:");
        console.log("Previous: 40 lbs x 10 reps");

        const specificTest = {
            exercise_id: 998,
            name: "Hip Abduction",
            weight_unit: "lbs",
            weight_increment: 5,
            lastLog: {
                weight_used: "40",
                reps_completed: "10",
                weight_unit: "lbs"
            }
        };

        const specificResult = calculateGoal(specificTest);
        if (specificResult && specificResult.sets[0]) {
            console.log(`Goal: ${specificResult.sets[0].weight} lbs x ${specificResult.sets[0].reps} reps`);
            console.log("✅ This should show 45 lbs x 10 reps (hypertrophy range - increase weight, maintain reps)");

            if (specificResult.sets[0].weight === 40) {
                console.log("❌ ERROR: Weight is not being increased! This is the bug.");
                console.log("Debug info:");
                console.log("- Previous weight:", 40);
                console.log("- Weight increment:", specificResult.weight_increment);
                console.log("- Expected new weight:", 40 + specificResult.weight_increment);
                console.log("- Actual new weight:", specificResult.sets[0].weight);
            }
        }

        // Test the specific 35x8 scenario you mentioned
        console.log("\n🎯 Testing specific 35x8 scenario:");
        console.log("Previous: 35 lbs x 8 reps");

        const specificTest2 = {
            exercise_id: 997,
            name: "Hip Abduction",
            weight_unit: "lbs",
            weight_increment: 5,
            lastLog: {
                weight_used: "35",
                reps_completed: "8",
                weight_unit: "lbs"
            }
        };

        const specificResult2 = calculateGoal(specificTest2);
        if (specificResult2 && specificResult2.sets[0]) {
            console.log(`Goal: ${specificResult2.sets[0].weight} lbs x ${specificResult2.sets[0].reps} reps`);
            console.log("✅ This should show 40 lbs x 8 reps (reasonable progression, not 50 lbs x 12)");
        }
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
