import { useState } from 'react';
import { Briefcase, Plus, Trash2, Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

const ProjectsPage = () => {
  const { projects, isLoading, createProject, deleteProject } = useProjects();
  const [newName, setNewName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await createProject.mutateAsync(name);
      setNewName('');
      toast({ title: 'Projeto criado', description: 'Token API gerado com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: 'Projeto removido' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <PageHeader title="Projetos" icon={Briefcase} subtitle="Gerencie seus projetos e tokens de API" />

      <form onSubmit={handleCreate} className="flex gap-2 mb-6 max-w-md">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nome do projeto"
          className="h-9 text-xs"
          maxLength={100}
        />
        <Button type="submit" size="sm" className="h-9 gap-1.5" disabled={createProject.isPending}>
          <Plus className="h-3.5 w-3.5" />
          Criar
        </Button>
      </form>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : projects.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum projeto criado ainda.</p>
          <p className="text-xs text-muted-foreground mt-1">Crie um projeto acima para gerar um token de API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.id} className="border rounded-lg p-4 bg-card card-hover">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[10px] bg-muted/30 px-2 py-1 rounded font-mono text-muted-foreground flex-1 truncate">
                  {project.api_token}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleCopy(project.api_token, project.id)}
                >
                  {copiedId === project.id ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border rounded-lg p-4 bg-card">
        <h3 className="text-xs font-semibold text-foreground mb-2">Como usar</h3>
        <pre className="text-[10px] bg-muted/30 p-3 rounded font-mono text-muted-foreground overflow-auto">
{`curl -X POST \\
  ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -H "Content-Type: application/json" \\
  -d '{
    "events": [{
      "type": "request",
      "status": "success",
      "summary": "POST /api/v1/pix — 200 em 45ms",
      "meta": {"method": "POST", "uri": "/api/v1/pix", "http_status": 200}
    }]
  }'`}
        </pre>
      </div>
    </div>
  );
};

export default ProjectsPage;
