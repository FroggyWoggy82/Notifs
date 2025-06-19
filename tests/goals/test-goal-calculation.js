// Test script to verify the calculateGoal function fix
// This simulates the data from your image to test the fix

// Mock exercise data that matches your image
const hipAbductionData = {
    name: "Hip Abduction \"NewTech\"",
    weight_increment: 5,
    lastLog: {
        weight_used: "50,50,45",
        reps_completed: "15,12,15",
        weight_unit: "lbs"
    }
};

const wideGripLatPulldownData = {
    name: "Wide Grip Lat Pulldown",
    weight_increment: 5,
    lastLog: {
        weight_used: "49,44,40", // Using example weights
        reps_completed: "8,12,10",
        weight_unit: "lbs"
    }
};

// Copy the fixed calculateGoal function
function calculateGoal(exerciseData) {
    if (!exerciseData.lastLog || !exerciseData.lastLog.weight_used || !exerciseData.lastLog.reps_completed) {
        return null; // No previous data to base goal on
    }

    const prevWeights = exerciseData.lastLog.weight_used.split(',').map(w => parseFloat(w.trim()));
    const prevReps = exerciseData.lastLog.reps_completed.split(',').map(r => parseInt(r.trim()));
    const prevUnit = exerciseData.lastLog.weight_unit || 'lbs'; // Default to lbs

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
        return null; // No valid sets to base goal on
    }

    const goalSets = JSON.parse(JSON.stringify(validSets));

    // Always prioritize the weight increment from exercise preferences
    let weightIncrement = parseFloat(exerciseData.weight_increment) || 5; // Default to 5 if not specified

    console.log(`[calculateGoal] Exercise: ${exerciseData.name}`);
    console.log(`[calculateGoal] Previous performance:`, validSets.map(s => `${s.weight}x${s.reps}`).join(', '));

    // Improved progressive overload logic that ensures goals are always >= previous performance
    // First, determine the overall progression strategy based on the best performing set
    const bestSet = validSets.reduce((best, current) => {
        // Calculate a simple strength score (weight * reps) to find the best performing set
        const bestScore = best.weight * best.reps;
        const currentScore = current.weight * current.reps;
        return currentScore > bestScore ? current : best;
    });

    console.log(`[calculateGoal] Best performing set: ${bestSet.weight} x ${bestSet.reps}`);

    // Define target rep ranges for different training styles
    const targetRepRange = {
        strength: { min: 3, max: 5 },      // Heavy strength training
        hypertrophy: { min: 6, max: 12 },  // Muscle building
        endurance: { min: 15, max: 20 }    // Muscular endurance
    };

    // Determine the appropriate rep range based on the best set's performance
    let targetRange;
    if (bestSet.reps <= 5) {
        targetRange = targetRepRange.strength;
    } else if (bestSet.reps <= 12) {
        targetRange = targetRepRange.hypertrophy;
    } else {
        targetRange = targetRepRange.endurance;
    }

    // Determine overall progression strategy
    let shouldIncreaseWeight = false;
    if (bestSet.reps >= targetRange.max) {
        shouldIncreaseWeight = true;
        console.log(`[calculateGoal] Best set exceeded target range (${bestSet.reps} >= ${targetRange.max}), will increase weight`);
    } else if (bestSet.reps >= targetRange.min && validSets.every(set => set.reps >= targetRange.min)) {
        shouldIncreaseWeight = true;
        console.log(`[calculateGoal] All sets in target range, will increase weight`);
    }

    // Apply progressive overload to each set
    for (let i = 0; i < goalSets.length; i++) {
        const currentSet = goalSets[i];
        const prevReps = currentSet.reps;
        const prevWeight = currentSet.weight;

        console.log(`[calculateGoal] Set ${i+1}: Previous ${prevWeight} x ${prevReps}`);

        if (shouldIncreaseWeight) {
            // Increase weight for all sets
            currentSet.weight = prevWeight + weightIncrement;
            
            if (prevReps >= targetRange.max) {
                // If this set exceeded the range, reduce reps to target range minimum
                currentSet.reps = targetRange.min;
                console.log(`[calculateGoal] Set ${i+1}: Increased weight to ${currentSet.weight}, reduced reps to ${currentSet.reps} (was above range)`);
            } else {
                // Keep the same reps if within or below range
                currentSet.reps = prevReps;
                console.log(`[calculateGoal] Set ${i+1}: Increased weight to ${currentSet.weight}, maintained ${currentSet.reps} reps`);
            }
        } else {
            // Keep weight the same, focus on increasing reps
            currentSet.weight = prevWeight;
            
            if (prevReps < targetRange.min) {
                // Add reps to reach minimum of target range
                if (targetRange.min <= 6) {
                    // Strength training - add 1 rep
                    currentSet.reps = prevReps + 1;
                } else {
                    // Hypertrophy/endurance - add 1-2 reps toward minimum
                    currentSet.reps = Math.min(prevReps + 2, targetRange.min);
                }
                console.log(`[calculateGoal] Set ${i+1}: Kept weight at ${currentSet.weight}, increased reps to ${currentSet.reps} (working toward range)`);
            } else {
                // Add 1 rep if already in range
                currentSet.reps = prevReps + 1;
                console.log(`[calculateGoal] Set ${i+1}: Kept weight at ${currentSet.weight}, increased reps to ${currentSet.reps}`);
            }
        }

        // Safety checks to ensure goals are never worse than previous performance
        if (currentSet.weight < prevWeight) {
            currentSet.weight = prevWeight;
            console.log(`[calculateGoal] Set ${i+1}: Safety check - restored weight to ${currentSet.weight}`);
        }
        if (currentSet.weight === prevWeight && currentSet.reps < prevReps) {
            currentSet.reps = prevReps + 1;
            console.log(`[calculateGoal] Set ${i+1}: Safety check - increased reps to ${currentSet.reps}`);
        }
        if (currentSet.reps < 1) {
            currentSet.reps = 1;
        }

        console.log(`[calculateGoal] Set ${i+1}: Final goal ${currentSet.weight} x ${currentSet.reps}`);
    }

    console.log(`[calculateGoal] Final goal sets:`, goalSets.map(s => `${s.weight}x${s.reps}`).join(', '));

    return {
        sets: goalSets,
        unit: prevUnit,
        weight_increment: weightIncrement // Include the weight increment in the result
    };
}

// Test the function
console.log("=== TESTING HIP ABDUCTION ===");
console.log("Previous: 50x15, 50x12, 45x15");
const hipResult = calculateGoal(hipAbductionData);
if (hipResult) {
    console.log("Goals:", hipResult.sets.map(s => `${s.weight}x${s.reps}`).join(', '));
    
    // Verify goals are >= previous performance
    const allGoalsValid = hipResult.sets.every((goalSet, i) => {
        const prevWeight = parseFloat(hipAbductionData.lastLog.weight_used.split(',')[i]);
        const prevReps = parseInt(hipAbductionData.lastLog.reps_completed.split(',')[i]);
        return goalSet.weight >= prevWeight && (goalSet.weight > prevWeight || goalSet.reps >= prevReps);
    });
    console.log("All goals >= previous performance:", allGoalsValid);
}

console.log("\n=== TESTING WIDE GRIP LAT PULLDOWN ===");
console.log("Previous: 49x8, 44x12, 40x10");
const latResult = calculateGoal(wideGripLatPulldownData);
if (latResult) {
    console.log("Goals:", latResult.sets.map(s => `${s.weight}x${s.reps}`).join(', '));
    
    // Verify goals are >= previous performance
    const allGoalsValid = latResult.sets.every((goalSet, i) => {
        const prevWeight = parseFloat(wideGripLatPulldownData.lastLog.weight_used.split(',')[i]);
        const prevReps = parseInt(wideGripLatPulldownData.lastLog.reps_completed.split(',')[i]);
        return goalSet.weight >= prevWeight && (goalSet.weight > prevWeight || goalSet.reps >= prevReps);
    });
    console.log("All goals >= previous performance:", allGoalsValid);
}
