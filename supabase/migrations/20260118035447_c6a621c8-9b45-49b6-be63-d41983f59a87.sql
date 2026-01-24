-- Create project_messages table for chat history
CREATE TABLE public.project_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.generated_sites(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- Users can only read messages from their own projects
CREATE POLICY "Users can view messages from their projects"
ON public.project_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.generated_sites
    WHERE generated_sites.id = project_messages.project_id
    AND generated_sites.user_id = auth.uid()
  )
);

-- Users can insert messages to their own projects
CREATE POLICY "Users can insert messages to their projects"
ON public.project_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_sites
    WHERE generated_sites.id = project_messages.project_id
    AND generated_sites.user_id = auth.uid()
  )
);

-- Index for faster queries
CREATE INDEX idx_project_messages_project_id ON public.project_messages(project_id);
CREATE INDEX idx_project_messages_created_at ON public.project_messages(created_at);