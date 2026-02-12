
-- Create health_check_log table
CREATE TABLE public.health_check_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  checked_at timestamptz NOT NULL DEFAULT now(),
  is_up boolean NOT NULL,
  status text,
  status_code integer,
  checks jsonb
);

-- Index for fast queries
CREATE INDEX idx_health_check_log_project_checked ON public.health_check_log (project_id, checked_at DESC);

-- Enable RLS
ALTER TABLE public.health_check_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own project health checks
CREATE POLICY "Users can view own project health checks"
ON public.health_check_log
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = health_check_log.project_id
    AND projects.user_id = auth.uid()
));

-- Only service_role can insert
CREATE POLICY "Only service_role inserts health checks"
ON public.health_check_log
FOR INSERT
WITH CHECK (false);

-- Cleanup function for 7-day retention
CREATE OR REPLACE FUNCTION public.cleanup_old_health_checks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.health_check_log
  WHERE checked_at < now() - interval '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Schedule daily cleanup via pg_cron
SELECT cron.schedule(
  'cleanup-health-check-log',
  '0 3 * * *',
  $$SELECT public.cleanup_old_health_checks()$$
);
