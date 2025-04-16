/**
 * Habit Model
 * Handles data operations for habits
 */

const db = require('../db');

/**
 * Get today's date in YYYY-MM-DD format using Central Time
 * @returns {string} - Today's date in YYYY-MM-DD format in Central Time
 */
function getTodayDateKey() {
    // Create a date object for the current time
    const now = new Date();

    // Convert to Central Time (America/Chicago)
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    // Format as YYYY-MM-DD
    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Get all habits with today's completion count and total completions
 * @returns {Promise<Array>} - Promise resolving to an array of habits
 */
async function getAllHabits() {
    const todayKey = getTodayDateKey();

    const result = await db.query(
        `SELECT
            h.id,
            h.title,
            h.frequency,
            h.completions_per_day,
            h.created_at,
            h.total_completions,
            COUNT(DISTINCT CASE WHEN hc.completion_date = $1 AND hc.deleted_at IS NULL THEN hc.id ELSE NULL END) AS completions_today
         FROM habits h
         LEFT JOIN habit_completions hc ON h.id = hc.habit_id
         GROUP BY h.id
         ORDER BY h.created_at DESC`,
        [todayKey]
    );

    // Process habits to ensure counter habits show correct values
    const habits = result.rows.map(habit => {
        // Parse the completions as numbers
        const completionsToday = parseInt(habit.completions_today, 10) || 0;
        const totalCompletions = parseInt(habit.total_completions, 10) || 0;

        // Check if this is a counter habit (has pattern like (5/8) in title)
        const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
        if (counterMatch) {
            // For counter habits, ensure the counter in the title reflects today's completions
            // If there are no completions today, reset to 0/X
            if (completionsToday === 0) {
                const totalCount = parseInt(counterMatch[2], 10) || 0;
                habit.title = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);
                console.log(`Reset counter for habit: ${habit.title} (no completions today)`);
            }
        }

        return {
            ...habit,
            completions_today: completionsToday,
            total_completions: totalCompletions,
            // Level is now simply the total completions
            level: totalCompletions
        };
    });

    return habits;
}

/**
 * Create a new habit
 * @param {Object} habitData - The habit data object
 * @param {string} habitData.title - The habit title
 * @param {string} habitData.frequency - The habit frequency (daily, weekly, monthly)
 * @param {number} habitData.completions_per_day - The number of completions per day
 * @returns {Promise<Object>} - Promise resolving to the created habit
 */
async function createHabit(habitData) {
    console.log('createHabit called with:', JSON.stringify(habitData));
    console.log('habitData type:', typeof habitData);

    // Handle both object and individual parameters
    let title, frequency, completionsPerDay;

    if (typeof habitData === 'object' && habitData !== null) {
        // Extract properties from the object
        title = habitData.title;
        frequency = habitData.frequency || 'daily';
        completionsPerDay = habitData.completions_per_day || 1;
        console.log('Extracted from object - title:', title, 'frequency:', frequency, 'completionsPerDay:', completionsPerDay);
    } else {
        // If it's not an object, assume it's the title
        title = habitData;
        frequency = 'daily';
        completionsPerDay = 1;
        console.log('Using habitData as title:', title);
    }

    // Validate inputs
    if (!title || title.trim() === '') {
        throw new Error('Habit title is required');
    }

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!frequency || !validFrequencies.includes(frequency)) {
        throw new Error('Invalid frequency specified');
    }

    let p_completions = 1;
    if (frequency === 'daily' && completionsPerDay) {
        try {
            p_completions = parseInt(completionsPerDay, 10);
            if (isNaN(p_completions) || p_completions < 1) p_completions = 1;
        } catch {
            p_completions = 1;
        }
    }

    console.log('Executing database query with parameters:', {
        title: title.trim(),
        frequency,
        p_completions
    });

    try {
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

        // Now insert the habit
        console.log('Inserting habit with parameters:', [title.trim(), frequency, p_completions]);
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [title.trim(), frequency, p_completions]
        );
        console.log('Database query successful, result:', result.rows[0]);
        return { ...result.rows[0], completions_today: 0 };
    } catch (dbError) {
        console.error('Database error:', dbError);
        console.error('Error stack:', dbError.stack);
        throw new Error(`Database error: ${dbError.message}`);
    }

    // The return statement is now in the try block
}

/**
 * Update a habit
 * @param {number} habitId - The habit ID
 * @param {string} title - The habit title
 * @param {string} frequency - The habit frequency (daily, weekly, monthly)
 * @param {number} completionsPerDay - The number of completions per day
 * @returns {Promise<Object>} - Promise resolving to the updated habit
 */
async function updateHabit(habitId, titleOrData, frequency, completionsPerDay) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    // Handle both object and individual parameters
    let title, freq, completions;

    if (typeof titleOrData === 'object' && titleOrData !== null) {
        // If first parameter after habitId is an object, extract properties
        const data = titleOrData;
        title = data.title;
        freq = data.frequency || frequency;
        completions = data.completions_per_day || completionsPerDay;
    } else {
        // Otherwise use the individual parameters
        title = titleOrData;
        freq = frequency;
        completions = completionsPerDay;
    }

    // Validate title
    if (!title || (typeof title === 'string' && title.trim() === '')) {
        throw new Error('Habit title cannot be empty');
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!freq || !validFrequencies.includes(freq)) {
        throw new Error('Invalid frequency specified');
    }

    let p_completions = 1;
    if (freq === 'daily' && completions) {
        try {
            p_completions = parseInt(completions, 10);
            if (isNaN(p_completions) || p_completions < 1) p_completions = 1;
        } catch {
            p_completions = 1;
        }
    }

    try {
        // Get current habit data to preserve completions_today
        const todayKey = getTodayDateKey();
        const currentHabitResult = await db.query(
            `SELECT
                h.*,
                COUNT(DISTINCT CASE WHEN hc.completion_date = $1 AND hc.deleted_at IS NULL THEN hc.id ELSE NULL END) AS completions_today
             FROM habits h
             LEFT JOIN habit_completions hc ON h.id = hc.habit_id
             WHERE h.id = $2
             GROUP BY h.id`,
            [todayKey, habitId]
        );

        if (currentHabitResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        // Update the habit
        const result = await db.query(
            'UPDATE habits SET title = $1, frequency = $2, completions_per_day = $3 WHERE id = $4 RETURNING *',
            [typeof title === 'string' ? title.trim() : title, freq, p_completions, habitId]
        );

        if (result.rowCount === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        // Get the updated habit data
        const updatedHabit = result.rows[0];
        const completionsToday = parseInt(currentHabitResult.rows[0].completions_today, 10) || 0;

        // Check if this is a counter habit (has pattern like (5/8) in title)
        const counterMatch = updatedHabit.title.match(/\((\d+)\/(\d+)\)/);
        if (counterMatch && completionsToday === 0) {
            // If there are no completions today, ensure the counter is reset to 0/X
            const totalCount = parseInt(counterMatch[2], 10) || 0;
            updatedHabit.title = updatedHabit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

            // Update the title in the database
            await db.query(
                'UPDATE habits SET title = $1 WHERE id = $2',
                [updatedHabit.title, habitId]
            );

            console.log(`Reset counter for updated habit: ${updatedHabit.title} (no completions today)`);
        }

        // Return updated habit with completions_today preserved
        return {
            ...updatedHabit,
            completions_today: completionsToday
        };
    } catch (error) {
        console.error(`Error updating habit ${habitId}:`, error);
        throw error;
    }
}

/**
 * Delete a habit
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the deleted habit ID
 */
async function deleteHabit(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const result = await db.query(
        'DELETE FROM habits WHERE id = $1 RETURNING id',
        [habitId]
    );

    if (result.rowCount === 0) {
        throw new Error(`Habit with ID ${habitId} not found`);
    }

    return { id: parseInt(habitId) };
}

/**
 * Record a habit completion
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the completion data
 */
async function recordCompletion(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const todayKey = getTodayDateKey();
    console.log(`Recording completion for habit ${habitId} on ${todayKey}`);

    try {
        // 1. Check if the habit exists
        const habitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [habitId]
        );

        if (habitResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        // 2. Get the current total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [habitId]
        );

        const currentTotalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        console.log(`Habit ${habitId} current total completions: ${currentTotalCompletions}`);

        // 3. Check how many completions exist for today
        const completionResult = await db.query(
            'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
            [habitId, todayKey]
        );

        const completionsToday = parseInt(completionResult.rows[0].count, 10) || 0;
        console.log(`Habit ${habitId} has ${completionsToday} completions for today`);

        // Get the habit's completions_per_day value
        const habit = habitResult.rows[0];
        const completionsPerDay = parseInt(habit.completions_per_day, 10) || 1;
        console.log(`Habit ${habitId} has completions_per_day: ${completionsPerDay}`);

        // 4. Check if the habit has reached its maximum completions for today
        if (completionsToday >= completionsPerDay) {
            console.log(`IMPORTANT: Habit ${habitId} has reached maximum completions for today (${completionsToday}/${completionsPerDay})`);

            return {
                completions_today: completionsToday,
                total_completions: currentTotalCompletions,
                level: currentTotalCompletions,
                is_complete: true,
                is_max_completions: true
            };
        }

        // 5. If we get here, this is the first time the habit is being completed today
        console.log(`IMPORTANT: First completion of habit ${habitId} today - incrementing total_completions`);
        console.log(`Current total_completions: ${currentTotalCompletions}, will increment by 1`);

        try {
            // Create a new completion record
            await db.query(
                'INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)',
                [habitId, todayKey]
            );

            // Increment the total_completions counter
            const updateResult = await db.query(
                'UPDATE habits SET total_completions = total_completions + 1 WHERE id = $1 RETURNING total_completions',
                [habitId]
            );

            const newTotalCompletions = updateResult.rows[0].total_completions;
            console.log(`Incremented total_completions for habit ${habitId} from ${currentTotalCompletions} to ${newTotalCompletions}`);

            // Get the updated completion count
            const updatedCompletionResult = await db.query(
                'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
                [habitId, todayKey]
            );

            const updatedCompletionsToday = parseInt(updatedCompletionResult.rows[0].count, 10) || 0;
            console.log(`Habit ${habitId} now has ${updatedCompletionsToday} completions for today after adding a new one`);

            return {
                completions_today: updatedCompletionsToday,
                total_completions: newTotalCompletions,
                level: newTotalCompletions,
                is_first_completion: completionsToday === 0
            };
        } catch (insertError) {
            // If the insert fails due to a unique constraint violation, it means another request
            // completed the habit at the same time. In this case, just return the current state.
            if (insertError.code === '23505') { // Unique violation
                console.log(`Unique constraint violation - another request completed the habit at the same time`);

                // Get the current completion count
                const currentCompletionResult = await db.query(
                    'SELECT COUNT(*) FROM habit_completions WHERE habit_id = $1 AND completion_date = $2 AND deleted_at IS NULL',
                    [habitId, todayKey]
                );

                const currentCompletionsToday = parseInt(currentCompletionResult.rows[0].count, 10) || 0;
                console.log(`Habit ${habitId} has ${currentCompletionsToday} completions for today (unique constraint violation)`);

                return {
                    completions_today: currentCompletionsToday,
                    total_completions: currentTotalCompletions,
                    level: currentTotalCompletions,
                    is_repeat_completion: true
                };
            }

            // For other errors, rethrow
            throw insertError;
        }
    } catch (error) {
        console.error(`Error recording completion for habit ${habitId}:`, error);
        throw error;
    }
}

/**
 * Remove a habit completion for today
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the updated completion data
 */
async function removeCompletion(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const todayKey = getTodayDateKey();
    console.log(`Removing completion for habit ${habitId} on ${todayKey}`);

    try {
        // 1. Check if the habit exists
        const habitResult = await db.query(
            'SELECT * FROM habits WHERE id = $1',
            [habitId]
        );

        if (habitResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        // 2. Check if there's a completion for today
        const completionResult = await db.query(
            'SELECT * FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [habitId, todayKey]
        );

        if (completionResult.rows.length === 0) {
            throw new Error(`No completions found for habit ${habitId} today`);
        }

        // 3. Get the current total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [habitId]
        );

        const currentTotalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        console.log(`Habit ${habitId} current total completions: ${currentTotalCompletions}`);

        // 4. Delete the completion record
        console.log(`IMPORTANT: Deleting completion for habit ${habitId}`);

        await db.query(
            'DELETE FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [habitId, todayKey]
        );

        // 5. Decrement the total_completions counter
        const expectedNewTotal = Math.max(0, currentTotalCompletions - 1);
        console.log(`IMPORTANT: Decrementing total_completions for habit ${habitId} from ${currentTotalCompletions} to ${expectedNewTotal}`);

        const updateResult = await db.query(
            'UPDATE habits SET total_completions = GREATEST(0, total_completions - 1) WHERE id = $1 RETURNING total_completions',
            [habitId]
        );

        const newTotalCompletions = updateResult.rows[0].total_completions;
        console.log(`Habit ${habitId} total completions after decrement: ${newTotalCompletions}`);

        return {
            completions_today: 0,
            total_completions: newTotalCompletions,
            level: newTotalCompletions
        };
    } catch (error) {
        console.error(`Error removing completion for habit ${habitId}:`, error);
        throw error;
    }
}

/**
 * Update a habit's total completions directly
 * @param {number} habitId - The habit ID
 * @param {number} increment - The amount to increment the total completions by
 * @returns {Promise<Object>} - Promise resolving to the updated habit data
 */
async function updateTotalCompletions(habitId, increment) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    try {
        // Get the current total_completions
        const totalResult = await db.query(
            'SELECT total_completions FROM habits WHERE id = $1',
            [habitId]
        );

        if (totalResult.rows.length === 0) {
            throw new Error(`Habit with ID ${habitId} not found`);
        }

        const currentTotalCompletions = parseInt(totalResult.rows[0].total_completions, 10) || 0;
        console.log(`Habit ${habitId} current total completions: ${currentTotalCompletions}`);

        // Update the total_completions
        const expectedNewTotal = Math.max(0, currentTotalCompletions + increment);
        console.log(`IMPORTANT: Updating total_completions for habit ${habitId} from ${currentTotalCompletions} to ${expectedNewTotal}`);

        const updateResult = await db.query(
            'UPDATE habits SET total_completions = GREATEST(0, total_completions + $1) WHERE id = $2 RETURNING id, total_completions',
            [increment, habitId]
        );

        const newTotalCompletions = parseInt(updateResult.rows[0].total_completions, 10) || 0;
        console.log(`Habit ${habitId} total completions after direct update: ${newTotalCompletions}`);

        return {
            total_completions: newTotalCompletions,
            level: newTotalCompletions
        };
    } catch (error) {
        console.error(`Error updating total completions for habit ${habitId}:`, error);
        throw error;
    }
}

/**
 * Get habit completions for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} - Promise resolving to habit completions grouped by date
 */
async function getCompletionsByDateRange(startDate, endDate) {
    try {
        console.log(`getCompletionsByDateRange called with startDate=${startDate}, endDate=${endDate}`);

        // If no dates provided, use current month
        if (!startDate || !endDate) {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            startDate = firstDayOfMonth.toISOString().split('T')[0];
            endDate = lastDayOfMonth.toISOString().split('T')[0];
            console.log(`Using default date range: ${startDate} to ${endDate}`);
        }

        // Get all habits
        const habitsResult = await db.query('SELECT id, title, frequency, completions_per_day, total_completions FROM habits');
        const habits = habitsResult.rows;
        console.log(`Found ${habits.length} habits:`, habits);

        // Get completions for the date range
        console.log(`Querying completions between ${startDate} and ${endDate}`);
        const completionsResult = await db.query(
            `SELECT
                hc.habit_id,
                hc.completion_date,
                COUNT(*) as count
             FROM habit_completions hc
             WHERE hc.completion_date BETWEEN $1 AND $2
                AND hc.deleted_at IS NULL
             GROUP BY hc.habit_id, hc.completion_date
             ORDER BY hc.completion_date`,
            [startDate, endDate]
        );
        console.log(`Found ${completionsResult.rows.length} completion records:`, completionsResult.rows);

        // Create a map of habits by ID for easy lookup
        const habitsById = {};
        habits.forEach(habit => {
            habitsById[habit.id] = habit;
        });

        // Group completions by date
        const completionsByDate = {};
        completionsResult.rows.forEach(row => {
            // Format the date as YYYY-MM-DD to ensure consistent keys
            const date = new Date(row.completion_date);
            const dateKey = date.toISOString().split('T')[0];
            const habitId = row.habit_id;
            const count = parseInt(row.count, 10);
            const habit = habitsById[habitId];

            if (!completionsByDate[dateKey]) {
                completionsByDate[dateKey] = [];
            }

            completionsByDate[dateKey].push({
                habitId,
                title: habit ? habit.title : `Unknown Habit (${habitId})`,
                count,
                target: habit ? habit.completions_per_day : 1
            });
        });

        // Add all habits to the response with their details
        const response = {
            startDate,
            endDate,
            habits: habits.map(h => ({
                id: h.id,
                title: h.title,
                frequency: h.frequency,
                completionsPerDay: h.completions_per_day,
                totalCompletions: h.total_completions
            })),
            completionsByDate
        };

        console.log('Final response:', JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.error('Error fetching habit completions by date range:', error);
        throw error;
    }
}

/**
 * Get a habit by ID with today's completion count
 * @param {number} habitId - The habit ID
 * @returns {Promise<Object>} - Promise resolving to the habit data
 */
async function getHabitById(habitId) {
    if (!/^[1-9]\d*$/.test(habitId)) {
        throw new Error('Invalid habit ID format');
    }

    const todayKey = getTodayDateKey();

    const result = await db.query(
        `SELECT
            h.id,
            h.title,
            h.frequency,
            h.completions_per_day,
            h.created_at,
            h.total_completions,
            COUNT(DISTINCT CASE WHEN hc.completion_date = $1 AND hc.deleted_at IS NULL THEN hc.id ELSE NULL END) AS completions_today
         FROM habits h
         LEFT JOIN habit_completions hc ON h.id = hc.habit_id
         WHERE h.id = $2
         GROUP BY h.id`,
        [todayKey, habitId]
    );

    if (result.rows.length === 0) {
        throw new Error(`Habit with ID ${habitId} not found`);
    }

    const habit = result.rows[0];

    // Parse the completions as numbers
    habit.completions_today = parseInt(habit.completions_today, 10) || 0;
    habit.total_completions = parseInt(habit.total_completions, 10) || 0;

    return habit;
}

module.exports = {
    getAllHabits,
    getHabitById,
    createHabit,
    updateHabit,
    deleteHabit,
    recordCompletion,
    removeCompletion,
    updateTotalCompletions,
    getCompletionsByDateRange
};
