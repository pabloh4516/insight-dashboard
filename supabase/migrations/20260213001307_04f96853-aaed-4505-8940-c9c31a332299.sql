
-- Allow members to see their own membership records
CREATE POLICY "Members can view own memberships"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
