-- Create storage bucket for spreadsheet files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'spreadsheets', 
  'spreadsheets', 
  false, 
  10485760, -- 10MB limit
  ARRAY['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
);

-- Create RLS policies for spreadsheet files
CREATE POLICY "Users can view their own spreadsheet files"
ON storage.objects FOR SELECT
USING (bucket_id = 'spreadsheets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own spreadsheet files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'spreadsheets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own spreadsheet files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'spreadsheets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own spreadsheet files"
ON storage.objects FOR DELETE
USING (bucket_id = 'spreadsheets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table for spreadsheet metadata
CREATE TABLE public.spreadsheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on spreadsheets table
ALTER TABLE public.spreadsheets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for spreadsheets table
CREATE POLICY "Users can view their own spreadsheets"
ON public.spreadsheets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spreadsheets"
ON public.spreadsheets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spreadsheets"
ON public.spreadsheets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spreadsheets"
ON public.spreadsheets FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_spreadsheets_updated_at
BEFORE UPDATE ON public.spreadsheets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();