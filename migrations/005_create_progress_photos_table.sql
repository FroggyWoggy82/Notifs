-- Create progress_photos table if it doesn't exist
CREATE TABLE IF NOT EXISTS progress_photos (
    photo_id SERIAL PRIMARY KEY,
    date_taken DATE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on date_taken for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_photos_date ON progress_photos(date_taken);

-- Verify the table exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying progress_photos table...';
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'progress_photos'
    ) THEN
        RAISE NOTICE 'progress_photos table exists.';
    ELSE
        RAISE EXCEPTION 'progress_photos table does not exist!';
    END IF;
END $$;
