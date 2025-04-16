-- Create progress_photos table if it doesn't exist
CREATE TABLE IF NOT EXISTS progress_photos (
    photo_id SERIAL PRIMARY KEY,
    date_taken DATE NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_progress_photos_date ON progress_photos(date_taken);
