/**
 * Workout Model
 * Handles data operations for workouts, exercises, and workout logs
 */

const db = require('../db');
const fs = require('fs');
const path = require('path');

// Define constants
const progressPhotosDir = path.join(__dirname, '..', 'public', 'uploads', 'progress_photos');

// Ensure the upload directory exists
if (!fs.existsSync(progressPhotosDir)){
    console.log(`Creating directory: ${progressPhotosDir}`);
    fs.mkdirSync(progressPhotosDir, { recursive: true });
}

/**
 * Get all available exercises with their preferences
 * @returns {Promise<Array>} - Promise resolving to an array of exercises with preferences
 */
async function getAllExercises() {
    const result = await db.query(`
        SELECT e.exercise_id, e.name, e.category, COALESCE(ep.weight_unit, 'kg') as preferred_weight_unit
        FROM exercises e
        LEFT JOIN exercise_preferences ep ON e.exercise_id = ep.exercise_id
        ORDER BY e.name ASC
    `);
    return result.rows;
}

/**
 * Get all workout templates with their exercises
 * @returns {Promise<Array>} - Promise resolving to an array of workout templates
 */
async function getWorkoutTemplates() {
    const templatesQuery = `
        SELECT
            w.workout_id, w.name, w.description, w.created_at,
            COALESCE(json_agg(json_build_object(
                'workout_exercise_id', we.workout_exercise_id,
                'exercise_id', e.exercise_id,
                'name', e.name,
                'category', e.category,
                'sets', we.sets,
                'reps', we.reps,
                'weight', we.weight,
                'weight_unit', we.weight_unit,
                'order_position', we.order_position,
                'notes', we.notes
            ) ORDER BY we.order_position) FILTER (WHERE e.exercise_id IS NOT NULL), '[]') AS exercises
        FROM workouts w
        LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
        LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
        WHERE w.is_template = true -- Ensure we only get templates
        GROUP BY w.workout_id, w.name, w.description, w.created_at
        ORDER BY w.name ASC;
    `;
    const result = await db.query(templatesQuery);
    return result.rows;
}

/**
 * Get a workout template by ID
 * @param {number} templateId - The workout template ID
 * @returns {Promise<Object>} - Promise resolving to the workout template
 */
async function getWorkoutTemplateById(templateId) {
    const templateQuery = `
        SELECT
            w.workout_id, w.name, w.description, w.created_at,
            COALESCE(json_agg(json_build_object(
                'workout_exercise_id', we.workout_exercise_id,
                'exercise_id', e.exercise_id,
                'name', e.name,
                'category', e.category,
                'sets', we.sets,
                'reps', we.reps,
                'weight', we.weight,
                'weight_unit', we.weight_unit,
                'order_position', we.order_position,
                'notes', we.notes
            ) ORDER BY we.order_position) FILTER (WHERE e.exercise_id IS NOT NULL), '[]') AS exercises
        FROM workouts w
        LEFT JOIN workout_exercises we ON w.workout_id = we.workout_id
        LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
        WHERE w.workout_id = $1 AND w.is_template = true
        GROUP BY w.workout_id, w.name, w.description, w.created_at;
    `;
    const result = await db.query(templateQuery, [templateId]);

    if (result.rowCount === 0) {
        throw new Error('Workout template not found');
    }

    return result.rows[0];
}

/**
 * Create a new workout template
 * @param {string} name - The template name
 * @param {string} description - The template description
 * @param {Array} exercises - Array of exercise objects
 * @returns {Promise<Object>} - Promise resolving to the created template
 */
async function createWorkoutTemplate(name, description, exercises) {
    if (!name || name.trim() === '') {
        throw new Error('Template name cannot be empty');
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new Error('Template must contain at least one exercise');
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert the workout template
        const workoutResult = await client.query(
            'INSERT INTO workouts (name, description, is_template) VALUES ($1, $2, true) RETURNING workout_id',
            [name.trim(), description || null]
        );
        const newTemplateId = workoutResult.rows[0].workout_id;

        // 2. Insert each exercise
        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];

            // Validate exercise data
            if (!ex.exercise_id) {
                throw new Error('Each exercise must have an exercise_id');
            }

            await client.query(
                `INSERT INTO workout_exercises
                (workout_id, exercise_id, sets, reps, weight, weight_unit, order_position, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    newTemplateId,
                    ex.exercise_id,
                    ex.sets || 1,
                    ex.reps || '',
                    ex.weight || null,
                    ex.weight_unit || 'kg',
                    i + 1, // Use array index + 1 for order
                    ex.notes || null
                ]
            );
        }

        await client.query('COMMIT');

        // Fetch the complete template to return
        return await getWorkoutTemplateById(newTemplateId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Update a workout template
 * @param {number} templateId - The template ID
 * @param {string} name - The updated template name
 * @param {string} description - The updated template description
 * @param {Array} exercises - Array of updated exercise objects
 * @returns {Promise<Object>} - Promise resolving to the updated template
 */
async function updateWorkoutTemplate(templateId, name, description, exercises) {
    if (!name || name.trim() === '') {
        throw new Error('Template name cannot be empty');
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new Error('Template must contain at least one exercise');
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if template exists
        const templateCheck = await client.query(
            'SELECT workout_id FROM workouts WHERE workout_id = $1 AND is_template = true',
            [templateId]
        );

        if (templateCheck.rowCount === 0) {
            throw new Error('Workout template not found');
        }

        // 2. Update the workout template
        await client.query(
            'UPDATE workouts SET name = $1, description = $2 WHERE workout_id = $3',
            [name.trim(), description || null, templateId]
        );

        // 3. Delete all existing exercises for this template
        await client.query('DELETE FROM workout_exercises WHERE workout_id = $1', [templateId]);

        // 4. Insert updated exercises
        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];

            // Validate exercise data
            if (!ex.exercise_id) {
                throw new Error('Each exercise must have an exercise_id');
            }

            await client.query(
                `INSERT INTO workout_exercises
                (workout_id, exercise_id, sets, reps, weight, weight_unit, order_position, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    templateId,
                    ex.exercise_id,
                    ex.sets || 1,
                    ex.reps || '',
                    ex.weight || null,
                    ex.weight_unit || 'kg',
                    i + 1, // Use array index + 1 for order
                    ex.notes || null
                ]
            );
        }

        await client.query('COMMIT');

        // Fetch the updated template to return
        return await getWorkoutTemplateById(templateId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Delete a workout template
 * @param {number} templateId - The template ID
 * @returns {Promise<Object>} - Promise resolving to the deleted template ID
 */
async function deleteWorkoutTemplate(templateId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if template exists
        const templateCheck = await client.query(
            'SELECT workout_id, name FROM workouts WHERE workout_id = $1 AND is_template = true',
            [templateId]
        );

        if (templateCheck.rowCount === 0) {
            throw new Error('Workout template not found');
        }

        const templateName = templateCheck.rows[0].name;

        // 2. Delete all exercises for this template
        await client.query('DELETE FROM workout_exercises WHERE workout_id = $1', [templateId]);

        // 3. Delete the template
        await client.query('DELETE FROM workouts WHERE workout_id = $1', [templateId]);

        await client.query('COMMIT');

        return {
            id: parseInt(templateId),
            name: templateName
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Log a completed workout
 * @param {string} workoutName - The workout name
 * @param {string} duration - The workout duration (ISO 8601 interval string)
 * @param {string} notes - The workout notes
 * @param {Array} exercises - Array of completed exercise objects
 * @returns {Promise<Object>} - Promise resolving to the logged workout
 */
async function logWorkout(workoutName, duration, notes, exercises) {
    if (!workoutName || workoutName.trim() === '') {
        throw new Error('Workout name cannot be empty');
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new Error('Workout must contain at least one logged exercise');
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert into workout_logs
        const logInsertResult = await client.query(
            'INSERT INTO workout_logs (workout_name, duration, notes) VALUES ($1, $2::interval, $3) RETURNING log_id',
            [workoutName.trim(), duration || null, notes || null]
        );
        const newLogId = logInsertResult.rows[0].log_id;

        // 2. Insert each exercise log
        for (const exLog of exercises) {
            if (!exLog.exercise_id || !exLog.exercise_name || exLog.sets_completed == null || !exLog.reps_completed) {
                throw new Error('Invalid exercise log data received');
            }

            // Ensure numeric fields are numbers or null
            const setsCompleted = parseInt(exLog.sets_completed);
            const weightUsed = exLog.weight_used ? exLog.weight_used.toString() : null;

            if (isNaN(setsCompleted)) {
                throw new Error('Invalid sets_completed value');
            }

            await client.query(
                `INSERT INTO exercise_logs
                (workout_log_id, exercise_id, exercise_name, sets_completed, reps_completed, weight_used, weight_unit, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    newLogId,
                    exLog.exercise_id,
                    exLog.exercise_name,
                    setsCompleted,
                    exLog.reps_completed,
                    weightUsed,
                    exLog.weight_unit || 'kg',
                    exLog.notes || null
                ]
            );
        }

        await client.query('COMMIT');

        // Fetch the complete log to return
        const logResult = await db.query('SELECT * FROM workout_logs WHERE log_id = $1', [newLogId]);
        const exerciseLogsResult = await db.query('SELECT * FROM exercise_logs WHERE workout_log_id = $1', [newLogId]);

        const workoutLog = logResult.rows[0];
        workoutLog.exercises = exerciseLogsResult.rows;

        return workoutLog;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Get workout logs with pagination
 * @param {number} limit - The maximum number of logs to return
 * @param {number} offset - The offset for pagination
 * @returns {Promise<Object>} - Promise resolving to the workout logs and count
 */
async function getWorkoutLogs(limit = 10, offset = 0) {
    // Get total count for pagination
    const countResult = await db.query('SELECT COUNT(*) FROM workout_logs');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get workout logs with their exercises
    const logsQuery = `
        SELECT
            wl.log_id, wl.workout_name, wl.duration, wl.notes, wl.created_at,
            COALESCE(json_agg(json_build_object(
                'exercise_log_id', el.exercise_log_id,
                'exercise_id', el.exercise_id,
                'exercise_name', el.exercise_name,
                'sets_completed', el.sets_completed,
                'reps_completed', el.reps_completed,
                'weight_used', el.weight_used,
                'weight_unit', el.weight_unit,
                'notes', el.notes
            ) ORDER BY el.exercise_log_id) FILTER (WHERE el.exercise_log_id IS NOT NULL), '[]') AS exercises
        FROM workout_logs wl
        LEFT JOIN exercise_logs el ON wl.log_id = el.workout_log_id
        GROUP BY wl.log_id
        ORDER BY wl.created_at DESC
        LIMIT $1 OFFSET $2;
    `;

    const logsResult = await db.query(logsQuery, [limit, offset]);

    return {
        logs: logsResult.rows,
        total: totalCount,
        limit: limit,
        offset: offset
    };
}

/**
 * Get a workout log by ID
 * @param {number} logId - The workout log ID
 * @returns {Promise<Object>} - Promise resolving to the workout log
 */
async function getWorkoutLogById(logId) {
    const logQuery = `
        SELECT
            wl.log_id, wl.workout_name, wl.duration, wl.notes, wl.created_at,
            COALESCE(json_agg(json_build_object(
                'exercise_log_id', el.exercise_log_id,
                'exercise_id', el.exercise_id,
                'exercise_name', el.exercise_name,
                'sets_completed', el.sets_completed,
                'reps_completed', el.reps_completed,
                'weight_used', el.weight_used,
                'weight_unit', el.weight_unit,
                'notes', el.notes
            ) ORDER BY el.exercise_log_id) FILTER (WHERE el.exercise_log_id IS NOT NULL), '[]') AS exercises
        FROM workout_logs wl
        LEFT JOIN exercise_logs el ON wl.log_id = el.workout_log_id
        WHERE wl.log_id = $1
        GROUP BY wl.log_id;
    `;

    const result = await db.query(logQuery, [logId]);

    if (result.rowCount === 0) {
        throw new Error('Workout log not found');
    }

    return result.rows[0];
}

/**
 * Delete a workout log
 * @param {number} logId - The workout log ID
 * @returns {Promise<Object>} - Promise resolving to the deleted log ID
 */
async function deleteWorkoutLog(logId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Check if log exists
        const logCheck = await client.query(
            'SELECT log_id FROM workout_logs WHERE log_id = $1',
            [logId]
        );

        if (logCheck.rowCount === 0) {
            throw new Error('Workout log not found');
        }

        // 2. Delete all exercise logs for this workout log
        await client.query('DELETE FROM exercise_logs WHERE workout_log_id = $1', [logId]);

        // 3. Delete the workout log
        await client.query('DELETE FROM workout_logs WHERE log_id = $1', [logId]);

        await client.query('COMMIT');

        return { id: parseInt(logId) };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Search exercises by name or category
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Promise resolving to matching exercises
 */
async function searchExercises(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    const searchQuery = `%${query.trim().toLowerCase()}%`;

    const result = await db.query(
        `SELECT exercise_id, name, category
         FROM exercises
         WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
         ORDER BY name ASC
         LIMIT 20`,
        [searchQuery]
    );

    return result.rows;
}

/**
 * Create a new exercise
 * @param {string} name - The exercise name
 * @param {string} category - The exercise category
 * @returns {Promise<Object>} - Promise resolving to the created exercise
 */
async function createExercise(name, category) {
    if (!name || name.trim() === '') {
        throw new Error('Exercise name cannot be empty');
    }

    if (!category || category.trim() === '') {
        throw new Error('Exercise category cannot be empty');
    }

    // Check if exercise with this name already exists
    const existingCheck = await db.query(
        'SELECT exercise_id FROM exercises WHERE LOWER(name) = LOWER($1)',
        [name.trim()]
    );

    if (existingCheck.rowCount > 0) {
        throw new Error('An exercise with this name already exists');
    }

    const result = await db.query(
        'INSERT INTO exercises (name, category) VALUES ($1, $2) RETURNING *',
        [name.trim(), category.trim()]
    );

    return result.rows[0];
}

/**
 * Save or update exercise weight unit preference
 * @param {number} exerciseId - The exercise ID
 * @param {string} weightUnit - The preferred weight unit (kg, lbs, bodyweight, assisted)
 * @returns {Promise<Object>} - Promise resolving to the saved preference
 */
async function saveExercisePreference(exerciseId, weightUnit) {
    if (!exerciseId) {
        throw new Error('Exercise ID is required');
    }

    if (!weightUnit || !['kg', 'lbs', 'bodyweight', 'assisted'].includes(weightUnit)) {
        throw new Error('Valid weight unit is required (kg, lbs, bodyweight, assisted)');
    }

    // Check if preference already exists
    const existingCheck = await db.query(
        'SELECT preference_id FROM exercise_preferences WHERE exercise_id = $1',
        [exerciseId]
    );

    if (existingCheck.rowCount > 0) {
        // Update existing preference
        const result = await db.query(
            'UPDATE exercise_preferences SET weight_unit = $1, updated_at = CURRENT_TIMESTAMP WHERE exercise_id = $2 RETURNING *',
            [weightUnit, exerciseId]
        );
        return result.rows[0];
    } else {
        // Create new preference
        const result = await db.query(
            'INSERT INTO exercise_preferences (exercise_id, weight_unit) VALUES ($1, $2) RETURNING *',
            [exerciseId, weightUnit]
        );
        return result.rows[0];
    }
}

/**
 * Get exercise preference by exercise ID
 * @param {number} exerciseId - The exercise ID
 * @returns {Promise<Object|null>} - Promise resolving to the preference or null if not found
 */
async function getExercisePreference(exerciseId) {
    if (!exerciseId) {
        throw new Error('Exercise ID is required');
    }

    const result = await db.query(
        'SELECT * FROM exercise_preferences WHERE exercise_id = $1',
        [exerciseId]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
}

module.exports = {
    getAllExercises,
    getWorkoutTemplates,
    getWorkoutTemplateById,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    logWorkout,
    getWorkoutLogs,
    getWorkoutLogById,
    deleteWorkoutLog,
    searchExercises,
    createExercise,
    saveExercisePreference,
    getExercisePreference,
    progressPhotosDir
};
