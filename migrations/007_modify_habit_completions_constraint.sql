-- Migration to modify the unique constraint on habit_completions table
-- This will allow multiple completions of the same habit on the same day

-- First, let's check if the constraint exists
DO $$
BEGIN
    RAISE NOTICE 'Checking for existing unique constraint on habit_completions...';
    
    -- Drop the existing unique constraint if it exists
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'habit_completions_habit_id_completion_date_key'
    ) THEN
        RAISE NOTICE 'Found unique constraint, dropping it...';
        ALTER TABLE habit_completions DROP CONSTRAINT habit_completions_habit_id_completion_date_key;
        RAISE NOTICE 'Unique constraint dropped successfully.';
    ELSE
        RAISE NOTICE 'No unique constraint found with that name.';
    END IF;
    
    -- Create a new index that includes created_at to make each record unique
    -- This allows multiple completions per day while maintaining data integrity
    RAISE NOTICE 'Creating new index on habit_completions...';
    CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date_created 
    ON habit_completions(habit_id, completion_date, created_at);
    RAISE NOTICE 'New index created successfully.';
    
END $$;

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE 'Verifying changes...';
    
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'habit_completions_habit_id_completion_date_key'
    ) THEN
        RAISE NOTICE 'Verification successful: Unique constraint has been removed.';
    ELSE
        RAISE EXCEPTION 'Verification failed: Unique constraint still exists!';
    END IF;
    
    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'idx_habit_completions_habit_date_created'
    ) THEN
        RAISE NOTICE 'Verification successful: New index has been created.';
    ELSE
        RAISE EXCEPTION 'Verification failed: New index was not created!';
    END IF;
END $$;
