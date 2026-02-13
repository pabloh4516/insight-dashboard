import { useState, useEffect } from "react";
import { Download, Smartphone, Share, MoreVertical, Plus, ArrowRight } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Instalar Telescope</h1>
          <p className="text-sm text-muted-foreground">
            Instale o Telescope no seu dispositivo para acesso rápido, mesmo offline.
          </p>
        </div>

        {installed ? (
          <div className="border rounded-xl p-6 bg-card">
            <div className="text-primary text-lg font-semibold mb-2">✓ App Instalado!</div>
            <p className="text-sm text-muted-foreground">O Telescope já está na sua tela inicial.</p>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-5 w-5" />
            Instalar Agora
          </button>
        ) : (
          <div className="space-y-6">
            {/* iOS instructions */}
            <div className="border rounded-xl p-5 bg-card text-left space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🍎</span> iPhone / iPad (Safari)
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">1</span>
                  <span>Toque no botão <Share className="inline h-3.5 w-3.5 text-primary" /> Compartilhar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">2</span>
                  <span>Role e toque em <Plus className="inline h-3.5 w-3.5 text-primary" /> "Adicionar à Tela de Início"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">3</span>
                  <span>Toque em "Adicionar"</span>
                </div>
              </div>
            </div>

            {/* Android instructions */}
            <div className="border rounded-xl p-5 bg-card text-left space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🤖</span> Android (Chrome)
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">1</span>
                  <span>Toque no menu <MoreVertical className="inline h-3.5 w-3.5 text-primary" /> (três pontos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">2</span>
                  <span>Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">3</span>
                  <span>Confirme a instalação</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <a href="/" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          Ir para o Telescope <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default InstallPage;
