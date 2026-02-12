
-- Tabela projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  api_token text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (user_id = auth.uid());

-- Tabela events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  summary text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_project_id ON public.events(project_id);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_created_at ON public.events(created_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own project events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id::text = events.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Only service_role inserts events" ON public.events
  FOR INSERT WITH CHECK (false);

-- Enable Realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
