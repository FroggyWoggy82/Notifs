-- Add youtube_url column to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255);

-- Verify the column exists
DO $$
BEGIN
    RAISE NOTICE 'Verifying youtube_url column...';
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'exercises'
        AND column_name = 'youtube_url'
    ) THEN
        RAISE NOTICE 'youtube_url column exists.';
    ELSE
        RAISE EXCEPTION 'youtube_url column does not exist!';
    END IF;
END $$;
