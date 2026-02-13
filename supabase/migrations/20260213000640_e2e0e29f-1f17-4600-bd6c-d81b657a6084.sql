
-- Create project_members table
CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = _project_id AND user_id = _user_id
  )
$$;

-- Security definer function to check project ownership
CREATE OR REPLACE FUNCTION public.is_project_owner(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND user_id = _user_id
  )
$$;

-- RLS for project_members: only project owner can manage
CREATE POLICY "Project owners can view members"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (public.is_project_owner(project_id, auth.uid()));

CREATE POLICY "Project owners can add members"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_owner(project_id, auth.uid()));

CREATE POLICY "Project owners can remove members"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (public.is_project_owner(project_id, auth.uid()));

-- Update projects RLS: allow members to SELECT
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own or member projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_project_member(id, auth.uid())
  );

-- Update events RLS: allow members to SELECT
DROP POLICY IF EXISTS "Users see own project events" ON public.events;
CREATE POLICY "Users see own or member project events"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id::text = events.project_id
        AND projects.user_id = auth.uid()
    )
    OR public.is_project_member(events.project_id::uuid, auth.uid())
  );

-- Update health_check_log RLS: allow members to SELECT
DROP POLICY IF EXISTS "Users can view own project health checks" ON public.health_check_log;
CREATE POLICY "Users can view own or member project health checks"
  ON public.health_check_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = health_check_log.project_id
        AND projects.user_id = auth.uid()
    )
    OR public.is_project_member(health_check_log.project_id, auth.uid())
  );

-- Update notification_emails RLS: allow members to SELECT
DROP POLICY IF EXISTS "Users can view own notification emails" ON public.notification_emails;
CREATE POLICY "Users can view own or member notification emails"
  ON public.notification_emails FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id::text = notification_emails.project_id::text
        AND projects.user_id = auth.uid()
    )
    OR public.is_project_member(notification_emails.project_id, auth.uid())
  );
