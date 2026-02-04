import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { signUpSchema, SignUpFormData, formatCPF } from '@/lib/validators';
import { toast } from 'sonner';

export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const cpfValue = watch('cpf', '');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    const cleanCPF = data.cpf.replace(/\D/g, '');
    const { error } = await signUp(data.email, data.password, data.name, data.surname, cleanCPF);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else if (error.message.includes('duplicate key') && error.message.includes('cpf')) {
        toast.error('Este CPF já está cadastrado');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
    } else {
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        
        <div className="max-w-lg text-center text-primary-foreground animate-slide-up relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Transforme sua rotina de saúde
          </h2>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            Cadastre-se e receba lembretes personalizados para nunca esquecer 
            de usar seus produtos Chronus21.
          </p>
          
          {/* Benefits */}
          <div className="mt-10 space-y-4 text-left">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">1</span>
              </div>
              <div>
                <div className="font-semibold">Crie sua conta</div>
                <div className="text-sm opacity-75">Rápido e seguro</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">2</span>
              </div>
              <div>
                <div className="font-semibold">Configure seus lembretes</div>
                <div className="text-sm opacity-75">Escolha horários e produtos</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">3</span>
              </div>
              <div>
                <div className="font-semibold">Receba notificações</div>
                <div className="text-sm opacity-75">Nunca mais esqueça</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Card Container */}
          <div className="glass-card p-8 md:p-10 animate-fade-in">
            <div className="mb-8 text-center">
              <Logo size="lg" className="mb-6 justify-center" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                Criar conta
              </h1>
              <p className="text-muted-foreground text-base">
                Preencha seus dados para começar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                  <Input
                    id="name"
                    placeholder="João"
                    {...register('name')}
                    className="h-12 bg-background/50 border-border/60 focus:border-primary transition-colors"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-sm font-medium">Sobrenome</Label>
                  <Input
                    id="surname"
                    placeholder="Silva"
                    {...register('surname')}
                    className="h-12 bg-background/50 border-border/60 focus:border-primary transition-colors"
                  />
                  {errors.surname && (
                    <p className="text-xs text-destructive">{errors.surname.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpfValue}
                  onChange={handleCPFChange}
                  className="h-12 bg-background/50 border-border/60 focus:border-primary transition-colors"
                />
                {errors.cpf && (
                  <p className="text-xs text-destructive">{errors.cpf.message}</p>
                )}
              </div>

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
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
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
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    {...register('confirmPassword')}
                    className="h-12 pr-12 bg-background/50 border-border/60 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all shadow-medium mt-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <UserPlus className="mr-2" size={20} />
                )}
                Criar conta
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline underline-offset-4"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
