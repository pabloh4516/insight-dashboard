import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setLoading(false);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else if (!isLogin) {
      toast({ title: 'Conta criada', description: 'Verifique seu e-mail para confirmar a conta.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dot-grid">
      <div className="w-full max-w-sm border rounded-xl bg-card p-8 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Tele<span className="text-primary">scope</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-xs"
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 text-xs"
            minLength={6}
            required
          />
          <Button type="submit" className="w-full h-9 text-xs" disabled={loading}>
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors w-full text-center"
        >
          {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Fazer login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
