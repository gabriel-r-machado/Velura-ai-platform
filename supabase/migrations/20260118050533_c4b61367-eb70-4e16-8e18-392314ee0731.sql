-- Ensure the realtime publication includes generated_sites (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'generated_sites'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_sites';
  END IF;
END $$;

-- Ensure a SELECT policy exists for authenticated users to receive realtime events (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_sites'
      AND policyname = 'Users can view their own projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own projects" ON public.generated_sites FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;