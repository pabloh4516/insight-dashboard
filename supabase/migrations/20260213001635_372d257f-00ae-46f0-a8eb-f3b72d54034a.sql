
-- Create health_status_tracker table
CREATE TABLE public.health_status_tracker (
  project_id UUID NOT NULL PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  last_status TEXT NOT NULL DEFAULT 'operational',
  last_notified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_status_tracker ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage this table (used by cron edge function)
CREATE POLICY "Only service_role manages health_status_tracker"
  ON public.health_status_tracker
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow project owners/members to read
CREATE POLICY "Users can view own project health tracker"
  ON public.health_status_tracker
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = health_status_tracker.project_id AND projects.user_id = auth.uid()
    )
    OR is_project_member(project_id, auth.uid())
  );

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
