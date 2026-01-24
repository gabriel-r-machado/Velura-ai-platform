-- Create table for storing generated sites
CREATE TABLE public.generated_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  code_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sites
CREATE POLICY "Users can view their own sites" 
ON public.generated_sites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sites" 
ON public.generated_sites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" 
ON public.generated_sites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" 
ON public.generated_sites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow anonymous inserts for demo purposes (sites without user_id)
CREATE POLICY "Allow anonymous site creation" 
ON public.generated_sites 
FOR INSERT 
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow viewing anonymous sites" 
ON public.generated_sites 
FOR SELECT 
USING (user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_sites_updated_at
BEFORE UPDATE ON public.generated_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();