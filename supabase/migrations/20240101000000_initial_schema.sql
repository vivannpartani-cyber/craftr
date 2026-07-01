-- Create Users Table (Extending Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  idea_description TEXT NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'building', 'reviewing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Project Artifacts Table (Outputs from agents)
CREATE TABLE IF NOT EXISTS public.project_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  artifact_type TEXT NOT NULL,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Agent Tasks Table (For the background job queue)
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  agent_role TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_context JSONB,
  output_result JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)

-- Users table RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Projects table RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own projects." ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects." ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects." ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects." ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Project Artifacts table RLS
ALTER TABLE public.project_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view artifacts of their projects." ON public.project_artifacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_artifacts.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can insert artifacts to their projects." ON public.project_artifacts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_artifacts.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update artifacts of their projects." ON public.project_artifacts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_artifacts.project_id AND projects.user_id = auth.uid())
);

-- Agent Tasks table RLS
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view tasks of their projects." ON public.agent_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_tasks.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can insert tasks to their projects." ON public.agent_tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_tasks.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update tasks of their projects." ON public.agent_tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = agent_tasks.project_id AND projects.user_id = auth.uid())
);

-- Trigger to automatically create a user record when a new auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
