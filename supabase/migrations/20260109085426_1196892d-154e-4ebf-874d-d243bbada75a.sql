-- Create enum for case status
CREATE TYPE public.case_status AS ENUM ('open', 'analyzing', 'completed', 'archived');

-- Create enum for media type
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio');

-- Create enum for analysis status
CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create enum for credibility level
CREATE TYPE public.credibility_level AS ENUM ('authentic', 'likely_authentic', 'uncertain', 'likely_manipulated', 'manipulated');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  organization TEXT,
  role TEXT DEFAULT 'investigator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.case_status DEFAULT 'open' NOT NULL,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create media_files table
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  media_type public.media_type NOT NULL,
  mime_type TEXT NOT NULL,
  thumbnail_url TEXT,
  duration NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create analysis_results table
CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES public.media_files(id) ON DELETE CASCADE NOT NULL,
  status public.analysis_status DEFAULT 'pending' NOT NULL,
  credibility_level public.credibility_level,
  credibility_score NUMERIC,
  
  -- Visual analysis
  visual_manipulation_detected BOOLEAN,
  visual_confidence NUMERIC,
  visual_artifacts JSONB DEFAULT '[]',
  heatmap_data JSONB,
  
  -- Audio analysis
  audio_manipulation_detected BOOLEAN,
  audio_confidence NUMERIC,
  audio_artifacts JSONB DEFAULT '[]',
  
  -- Metadata analysis
  metadata_integrity_score NUMERIC,
  metadata_issues JSONB DEFAULT '[]',
  exif_data JSONB,
  
  -- Contextual analysis
  context_verified BOOLEAN,
  context_notes TEXT,
  
  -- Blockchain verification
  sha256_hash TEXT,
  blockchain_tx_id TEXT,
  blockchain_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Explanations
  plain_explanation TEXT,
  legal_explanation TEXT,
  technical_explanation TEXT,
  
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  media_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  icon_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Cases policies
CREATE POLICY "Users can view their own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cases"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases"
  ON public.cases FOR DELETE
  USING (auth.uid() = user_id);

-- Media files policies
CREATE POLICY "Users can view their own media files"
  ON public.media_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own media files"
  ON public.media_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media files"
  ON public.media_files FOR DELETE
  USING (auth.uid() = user_id);

-- Analysis results policies
CREATE POLICY "Users can view analysis for their media"
  ON public.analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files 
      WHERE media_files.id = analysis_results.media_id 
      AND media_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis for their media"
  ON public.analysis_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.media_files 
      WHERE media_files.id = analysis_results.media_id 
      AND media_files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analysis for their media"
  ON public.analysis_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.media_files 
      WHERE media_files.id = analysis_results.media_id 
      AND media_files.user_id = auth.uid()
    )
  );

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analysis_results_updated_at
  BEFORE UPDATE ON public.analysis_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create generate_case_number function
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.cases;
  RETURN 'TC-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', false);

-- Storage policies
CREATE POLICY "Users can upload their own media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);