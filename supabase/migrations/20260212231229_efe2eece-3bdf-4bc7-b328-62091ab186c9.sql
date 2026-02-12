
CREATE TABLE public.notification_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification emails"
  ON public.notification_emails FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert own notification emails"
  ON public.notification_emails FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update own notification emails"
  ON public.notification_emails FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete own notification emails"
  ON public.notification_emails FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));
