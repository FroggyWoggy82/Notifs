-- Add a trigger to automatically set assigned_date equal to due_date when it's null

-- Create the trigger function
CREATE OR REPLACE FUNCTION set_assigned_date_from_due_date()
RETURNS TRIGGER AS $$
BEGIN
    -- If due_date is set but assigned_date is not, set assigned_date equal to due_date
    IF NEW.due_date IS NOT NULL AND NEW.assigned_date IS NULL THEN
        NEW.assigned_date := NEW.due_date;
    END IF;
    
    -- If assigned_date is set but due_date is not, set due_date equal to assigned_date
    IF NEW.assigned_date IS NOT NULL AND NEW.due_date IS NULL THEN
        NEW.due_date := NEW.assigned_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS set_assigned_date_trigger ON tasks;

-- Create the trigger
CREATE TRIGGER set_assigned_date_trigger
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_assigned_date_from_due_date();

-- Update existing tasks to set assigned_date equal to due_date where assigned_date is null
UPDATE tasks 
SET assigned_date = due_date 
WHERE due_date IS NOT NULL AND assigned_date IS NULL;

-- Update existing tasks to set due_date equal to assigned_date where due_date is null
UPDATE tasks 
SET due_date = assigned_date 
WHERE assigned_date IS NOT NULL AND due_date IS NULL;
