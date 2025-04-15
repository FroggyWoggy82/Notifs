-- Fix the trigger to handle timezone issues

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
    
    -- Ensure both dates have the same time component (set to midnight UTC)
    IF NEW.due_date IS NOT NULL AND NEW.assigned_date IS NOT NULL THEN
        -- Extract the date part only (without time)
        NEW.due_date := date_trunc('day', NEW.due_date);
        NEW.assigned_date := date_trunc('day', NEW.assigned_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing tasks to ensure assigned_date and due_date have the same time component
UPDATE tasks 
SET 
    assigned_date = date_trunc('day', due_date),
    due_date = date_trunc('day', due_date)
WHERE 
    due_date IS NOT NULL;
