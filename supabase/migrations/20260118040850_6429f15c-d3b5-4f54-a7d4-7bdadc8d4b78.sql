-- Add status column to track generation progress
ALTER TABLE public.generated_sites 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'idle' 
CHECK (status IN ('idle', 'processing', 'completed', 'error'));

-- Add error_message column for error states
ALTER TABLE public.generated_sites 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Enable Realtime for generated_sites table
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_sites;