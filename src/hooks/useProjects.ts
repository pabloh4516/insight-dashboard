import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Project {
  id: string;
  name: string;
  api_token: string;
  user_id: string;
  created_at: string;
  polling_interval_seconds: number;
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      // Fetch owned projects
      const { data: owned, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (ownedError) throw ownedError;

      // Fetch projects where user is a member
      const { data: memberships, error: memberError } = await (supabase
        .from('project_members' as any)
        .select('project_id')
        .eq('user_id', user!.id) as any);

      let memberProjects: Project[] = [];
      if (!memberError && memberships && memberships.length > 0) {
        const memberIds = memberships.map(m => m.project_id);
        const { data: mp } = await supabase
          .from('projects')
          .select('*')
          .in('id', memberIds)
          .order('created_at', { ascending: false });
        memberProjects = (mp ?? []) as Project[];
      }

      // Merge, avoiding duplicates
      const ownedIds = new Set((owned ?? []).map(p => p.id));
      const merged = [...(owned ?? []), ...memberProjects.filter(p => !ownedIds.has(p.id))];
      return merged as Project[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (name: string) => {
      const apiToken = crypto.randomUUID();
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, api_token: apiToken, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  return { projects: query.data ?? [], isLoading: query.isLoading, createProject, deleteProject };
};
