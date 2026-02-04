import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Loader2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { signInSchema, SignInFormData } from '@/lib/validators';
import { toast } from 'sonner';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast.error('Email ou senha incorretos');
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="glass-card p-8 md:p-10 animate-fade-in">
            <div className="mb-8 text-center">
              <Logo size="lg" className="mb-6 justify-center" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                Bem-vindo de volta
              </h1>
              <p className="text-muted-foreground text-base">
                Entre na sua conta para gerenciar seus lembretes
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className="h-12 bg-background/50 border-border/60 focus:border-primary transition-colors"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="h-12 pr-12 bg-background/50 border-border/60 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all shadow-medium"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <LogIn className="mr-2" size={20} />
                )}
                Entrar
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground">
                Não tem uma conta?{' '}
                <Link
                  to="/cadastro"
                  className="text-primary font-semibold hover:underline underline-offset-4"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        
        <div className="max-w-lg text-center text-primary-foreground animate-slide-up relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Sua jornada de saúde começa aqui
          </h2>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            Acompanhe sua rotina de suplementação com lembretes personalizados 
            e nunca mais esqueça de cuidar da sua saúde.
          </p>
          
          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="font-semibold mb-1">Lembretes</div>
              <div className="opacity-75">Personalizados</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="font-semibold mb-1">Produtos</div>
              <div className="opacity-75">Chronus21</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="font-semibold mb-1">Saúde</div>
              <div className="opacity-75">Em dia</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
