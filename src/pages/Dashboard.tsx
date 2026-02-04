import { useState, useEffect } from 'react';
import { Plus, Clock, Bell, Package, LogOut, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  image_url: string | null;
}

interface Reminder {
  id: string;
  user_id: string;
  product_id: string;
  reminder_time: string;
  days_of_week: number[];
  is_active: boolean;
  notes: string | null;
  products?: Product;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'default'
  );

  useEffect(() => {
    fetchProducts();
    fetchReminders();
    // Check permission on load
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      reminders.forEach(reminder => {
        if (
          reminder.is_active &&
          reminder.days_of_week.includes(currentDay) &&
          reminder.reminder_time.startsWith(currentTime)
        ) {
          sendNotification(reminder);
        }
      });
    };

    // Calculate delay to sync with next minute
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000;
    
    const timeoutId = setTimeout(() => {
      checkReminders();
      const intervalId = setInterval(checkReminders, 60000);
      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [reminders]);

  const sendNotification = (reminder: Reminder) => {
    if (Notification.permission === 'granted') {
      // Play a sound if available
      try {
        const audio = new Audio('/notification.mp3'); // We might need to add this file or use a default sound approach
        audio.play().catch(e => console.log('Audio play failed', e));
      } catch (e) {
        console.log('Audio not supported');
      }

      new Notification(`Hora de usar ${reminder.products?.name}`, {
        body: reminder.products?.instructions || 'Lembrete de saúde',
        icon: '/placeholder.svg',
        tag: `reminder-${reminder.id}-${new Date().toISOString().slice(0, 16)}` // Prevent duplicate notifications
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Notificações habilitadas com sucesso!');
        // Test notification
        new Notification('Equilibrium Vida', {
          body: 'As notificações estão ativas!'
        });
      } else {
        toast.error('É necessário permitir notificações para receber os lembretes');
      }
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchReminders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        products (*)
      `)
      .order('reminder_time');
    
    if (!error && data) {
      setReminders(data as Reminder[]);
    }
    setIsLoading(false);
  };

  const handleAddReminder = async () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    const { error } = await supabase
      .from('reminders')
      .insert({
        product_id: selectedProduct,
        reminder_time: reminderTime,
        days_of_week: selectedDays,
        user_id: profile?.id,
      });

    if (error) {
      toast.error('Erro ao adicionar lembrete');
    } else {
      toast.success('Lembrete adicionado com sucesso!');
      setIsAddDialogOpen(false);
      setSelectedProduct('');
      setReminderTime('08:00');
      setSelectedDays([1, 2, 3, 4, 5]);
      fetchReminders();
    }
  };

  const handleToggleReminder = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      fetchReminders();
      toast.success(isActive ? 'Lembrete desativado' : 'Lembrete ativado');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchReminders();
      toast.success('Lembrete removido');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const formatDays = (days: number[]) => {
    if (days.length === 7) return 'Todos os dias';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Dias úteis';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Fim de semana';
    return days.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, <span className="font-medium text-foreground">{profile?.name}</span>
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Sua Agenda de Saúde
          </h1>
          <p className="text-muted-foreground">
            Configure lembretes para nunca esquecer de usar seus produtos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bell className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {reminders.filter(r => r.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Lembretes ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent">
                  <Package className="text-accent-foreground" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Produtos disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary">
                  <Calendar className="text-secondary-foreground" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {reminders.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total de lembretes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Reminder Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-serif font-semibold text-foreground">
            Meus Lembretes
          </h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {notificationPermission !== 'granted' && (
              <Button 
                onClick={requestNotificationPermission} 
                variant="outline"
                className="flex-1 sm:flex-none border-primary text-primary hover:bg-primary/10"
              >
                <Bell size={20} className="mr-2" />
                Ativar Notificações
              </Button>
            )}

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary flex-1 sm:flex-none">
                  <Plus size={20} className="mr-2" />
                  Novo Lembrete
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Adicionar Lembrete</DialogTitle>
                <DialogDescription>
                  Configure quando você quer ser lembrado de usar o produto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Dias da semana</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          selectedDays.includes(day.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddReminder}
                  className="w-full gradient-primary h-12"
                  disabled={!selectedProduct || selectedDays.length === 0}
                >
                  Adicionar Lembrete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Reminders List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Bell className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum lembrete configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione seu primeiro lembrete para começar a cuidar da sua saúde
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-primary">
                <Plus size={20} className="mr-2" />
                Adicionar Lembrete
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder, index) => (
              <Card
                key={reminder.id}
                className={`glass-card animate-slide-up ${!reminder.is_active ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${reminder.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Package className={reminder.is_active ? 'text-primary' : 'text-muted-foreground'} size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {reminder.products?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reminder.products?.instructions}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xl font-bold text-foreground">{reminder.reminder_time.slice(0, 5)}</p>
                        <p className="text-xs text-muted-foreground">{formatDays(reminder.days_of_week)}</p>
                      </div>
                      <Switch
                        checked={reminder.is_active}
                        onCheckedChange={() => handleToggleReminder(reminder.id, reminder.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Products Section */}
        <div className="mt-12">
          <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
            Produtos Chronus21
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className="glass-card hover:shadow-medium transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-3">
                    <Package className="text-primary-foreground" size={24} />
                  </div>
                  <CardTitle className="text-lg font-serif">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Como usar:</strong> {product.instructions}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedProduct(product.id);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Bell size={16} className="mr-2" />
                    Criar Lembrete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
