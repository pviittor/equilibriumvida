import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Calendar, Clock, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';

const features = [
  {
    icon: Bell,
    title: 'Lembretes Personalizados',
    description: 'Configure horários específicos para cada produto e nunca mais esqueça de usar.',
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Escolha os dias da semana que deseja receber os lembretes.',
  },
  {
    icon: Clock,
    title: 'Notificações em Tempo Real',
    description: 'Receba alertas sonoros e visuais diretamente no seu dispositivo.',
  },
  {
    icon: Shield,
    title: 'Seus Dados Seguros',
    description: 'Suas informações são protegidas com a mais alta tecnologia de segurança.',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button className="gradient-primary">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              Cuide da sua saúde de forma inteligente
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              Nunca mais esqueça de{' '}
              <span className="text-gradient">cuidar de você</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Configure lembretes personalizados para seus produtos Chronus21 e transforme 
              sua rotina de saúde com notificações que funcionam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro">
                <Button size="lg" className="gradient-primary text-lg px-8 h-14 w-full sm:w-auto">
                  Começar Agora
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar sua rotina de suplementação
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="glass-card hover:shadow-medium transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="text-primary-foreground" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-primary overflow-hidden">
            <CardContent className="py-16 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Pronto para transformar sua rotina?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Cadastre-se gratuitamente e comece a receber lembretes personalizados hoje mesmo.
              </p>
              <Link to="/cadastro">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 h-14"
                >
                  Criar Minha Conta Grátis
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2024 Equilibrium Vida. Todos os direitos reservados.
            </p>
            <a
              href="https://equilibriumvida.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Visitar loja oficial
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
