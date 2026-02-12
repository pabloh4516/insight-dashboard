import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Trash2, Send, Mail, Loader2 } from 'lucide-react';

interface NotificationEmail {
  id: string;
  project_id: string;
  email: string;
  enabled: boolean;
  created_at: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NotificationsPage() {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const [emails, setEmails] = useState<NotificationEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const projectId = selectedProject?.id ?? null;

  const fetchEmails = async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_emails' as never)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Erro ao carregar emails', description: error.message, variant: 'destructive' });
    } else {
      setEmails((data as unknown as NotificationEmail[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [projectId]);

  const handleAdd = async () => {
    if (!projectId) return;
    const trimmed = newEmail.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      toast({ title: 'Email inválido', description: 'Insira um endereço de email válido.', variant: 'destructive' });
      return;
    }
    if (trimmed.length > 255) {
      toast({ title: 'Email muito longo', description: 'Máximo de 255 caracteres.', variant: 'destructive' });
      return;
    }
    setAdding(true);
    const { error } = await supabase
      .from('notification_emails' as never)
      .insert({ project_id: projectId, email: trimmed } as never);
    if (error) {
      toast({ title: 'Erro ao adicionar', description: error.message, variant: 'destructive' });
    } else {
      setNewEmail('');
      toast({ title: 'Email adicionado' });
      fetchEmails();
    }
    setAdding(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from('notification_emails' as never)
      .update({ enabled } as never)
      .eq('id', id);
    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    } else {
      setEmails(prev => prev.map(e => e.id === id ? { ...e, enabled } : e));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('notification_emails' as never)
      .delete()
      .eq('id', id);
    if (error) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    } else {
      setEmails(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Email removido' });
    }
  };

  const handleTest = async (email: string, id: string) => {
    setTestingId(id);
    try {
      const { error } = await supabase.functions.invoke('notify-status-change', {
        body: {
          status: 'TEST',
          statusCode: 200,
          checkedAt: new Date().toISOString(),
          project_id: projectId,
          test_email: email,
        },
      });
      if (error) throw error;
      toast({ title: 'Email de teste enviado', description: `Enviado para ${email}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Falha ao enviar teste', description: msg, variant: 'destructive' });
    }
    setTestingId(null);
  };

  if (!projectId) {
    return (
      <div className="p-6">
        <PageHeader title="Notificações" subtitle="Selecione um projeto para gerenciar notificações." icon={Bell} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Notificações" subtitle="Gerencie os emails que recebem alertas quando o gateway muda de status." icon={Bell} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" />
            Emails de Alerta
          </CardTitle>
          <CardDescription>
            Estes emails serão notificados quando o gateway cair ou voltar ao normal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="novo@email.com"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1"
              maxLength={255}
            />
            <Button onClick={handleAdd} disabled={adding} size="sm" className="gap-1.5">
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Adicionar
            </Button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Nenhum email cadastrado. Adicione um acima.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border">
              {emails.map(em => (
                <div key={em.id} className="flex items-center gap-3 px-4 py-3">
                  <Switch
                    checked={em.enabled}
                    onCheckedChange={v => handleToggle(em.id, v)}
                  />
                  <span className={`flex-1 text-sm truncate ${!em.enabled ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {em.email}
                  </span>
                  <Badge variant={em.enabled ? 'default' : 'secondary'} className="text-[10px]">
                    {em.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTest(em.email, em.id)}
                    disabled={testingId === em.id}
                    className="gap-1 text-xs"
                  >
                    {testingId === em.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    Teste
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(em.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuração do Resend</CardTitle>
          <CardDescription>
            Os emails são enviados via Resend. As chaves <code className="text-xs bg-muted px-1 py-0.5 rounded">RESEND_API_KEY</code> e <code className="text-xs bg-muted px-1 py-0.5 rounded">NOTIFICATION_EMAIL_FROM</code> estão configuradas nas variáveis de ambiente do backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span><strong>RESEND_API_KEY</strong> — Chave da API do Resend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span><strong>NOTIFICATION_EMAIL_FROM</strong> — Remetente dos alertas (ex: alertas@seudominio.com)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
