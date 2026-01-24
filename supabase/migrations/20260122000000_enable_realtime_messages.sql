-- Enable Realtime for project_messages table
-- This allows the client to receive real-time updates when messages are inserted

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;

-- Optional: Add a comment to document this
COMMENT ON TABLE public.project_messages IS 'Chat messages with realtime updates enabled';
