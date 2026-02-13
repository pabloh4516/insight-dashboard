import { useState, useEffect } from 'react';
import { Settings, Save, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const INTERVAL_OPTIONS = [
  { value: 30, label: '30s' },
  { value: 60, label: '1min' },
  { value: 120, label: '2min' },
  { value: 180, label: '3min' },
  { value: 300, label: '5min' },
  { value: 600, label: '10min' },
];

const SettingsPage = () => {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [interval, setInterval_] = useState(120);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      setInterval_(selectedProject.polling_interval_seconds ?? 120);
    }
  }, [selectedProject]);

  const handleSave = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ polling_interval_seconds: interval } as any)
        .eq('id', selectedProject.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Configuração salva', description: `Intervalo de polling atualizado para ${formatInterval(interval)}.` });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds} segundos`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}min ${sec}s` : `${min} minuto${min > 1 ? 's' : ''}`;
  };

  const closestOptionIndex = INTERVAL_OPTIONS.reduce((best, opt, i) =>
    Math.abs(opt.value - interval) < Math.abs(INTERVAL_OPTIONS[best].value - interval) ? i : best, 0
  );

  if (!selectedProject) {
    return (
      <div>
        <PageHeader title="Configurações" icon={Settings} subtitle="Selecione um projeto para configurar" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Configurações" icon={Settings} subtitle={`Configurações do projeto ${selectedProject.name}`} />

      <div className="max-w-lg space-y-6">
        {/* Polling Interval */}
        <div className="border rounded-lg p-5 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Intervalo de Health Check</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Define o intervalo entre verificações automáticas de saúde do sistema. Valores menores detectam problemas mais rápido, mas consomem mais recursos.
          </p>

          <div className="space-y-4">
            <Slider
              value={[closestOptionIndex]}
              min={0}
              max={INTERVAL_OPTIONS.length - 1}
              step={1}
              onValueChange={([i]) => setInterval_(INTERVAL_OPTIONS[i].value)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {INTERVAL_OPTIONS.map(opt => (
                <span key={opt.value} className={opt.value === interval ? 'text-primary font-medium' : ''}>{opt.label}</span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground">Valor atual: </span>
                <span className="text-sm font-mono font-semibold text-foreground">{formatInterval(interval)}</span>
              </div>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleSave}
                disabled={saving || interval === (selectedProject.polling_interval_seconds ?? 120)}
              >
                <Save className="h-3.5 w-3.5" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
