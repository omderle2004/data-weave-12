-- Create analysis_results table to store AI analysis outputs permanently
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analysis results"
ON public.analysis_results
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results"
ON public.analysis_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis results"
ON public.analysis_results
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis results"
ON public.analysis_results
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_analysis_results_updated_at
BEFORE UPDATE ON public.analysis_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_analysis_results_project_id ON public.analysis_results(project_id);
CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);