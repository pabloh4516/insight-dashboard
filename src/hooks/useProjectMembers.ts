import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  email?: string;
}

export const useProjectMembers = (projectId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectMember[];
    },
    enabled: !!projectId,
  });

  const inviteUser = useMutation({
    mutationFn: async ({ email, password, project_id }: { email: string; password: string; project_id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ email, password, project_id }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao convidar usuário');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members'] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members'] });
    },
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    inviteUser,
    removeMember,
  };
};
