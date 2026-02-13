import { useState } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UsersPage = () => {
  const { projects } = useProjects();
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Only show projects the user owns
  const ownedProjects = projects.filter(p => p.user_id === user?.id);

  const { members, isLoading, inviteUser, removeMember } = useProjectMembers(
    selectedProjectId || null
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !selectedProjectId) return;
    try {
      await inviteUser.mutateAsync({
        email: email.trim(),
        password: password.trim(),
        project_id: selectedProjectId,
      });
      setEmail('');
      setPassword('');
      toast({ title: 'Usuário convidado', description: `${email} adicionado ao projeto.` });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId);
      toast({ title: 'Membro removido' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader title="Usuários" icon={Users} subtitle="Gerencie o acesso de usuários aos seus projetos" />

      <div className="max-w-lg space-y-6">
        <div className="border rounded-lg p-4 bg-card space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Convidar usuário</h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <Label className="text-xs">Projeto</Label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
              >
                <option value="">Selecione um projeto</option>
                {ownedProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                className="h-9 text-xs mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha inicial"
                className="h-9 text-xs mt-1"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5"
              disabled={inviteUser.isPending || !selectedProjectId}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Convidar
            </Button>
          </form>
        </div>

        {selectedProjectId && (
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Membros do projeto
            </h3>
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Carregando...</p>
            ) : members.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum membro adicionado ainda.</p>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30"
                  >
                    <div>
                      <p className="text-xs text-foreground font-mono">{member.user_id}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Adicionado em {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
