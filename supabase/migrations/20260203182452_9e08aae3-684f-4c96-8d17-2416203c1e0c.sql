-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Criar tabela de produtos (catálogo disponível)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (produtos são públicos para leitura)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by authenticated users" 
ON public.products FOR SELECT 
TO authenticated
USING (true);

-- Criar tabela de lembretes do usuário
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,0}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reminders
CREATE POLICY "Users can view own reminders" 
ON public.reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" 
ON public.reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" 
ON public.reminders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" 
ON public.reminders FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Inserir produtos iniciais (Chronus21)
INSERT INTO public.products (name, description, instructions, image_url) VALUES
('Chronus21 Detox', 'Fórmula avançada para limpeza profunda e eliminação de toxinas do organismo.', 'Tome 1 sachê em jejum pela manhã, diluído em 200ml de água.', NULL),
('Chronus21 Energia', 'Suplemento para revigoração instantânea e recuperação de vitalidade.', 'Tome 1 sachê após o almoço, diluído em 200ml de água.', NULL),
('Chronus21 Noturno', 'Fórmula especial para nutrição completa e renovação durante o sono.', 'Tome 1 sachê antes de dormir, diluído em 200ml de água morna.', NULL),
('Chronus21 Metabolismo', 'Acelera o metabolismo e auxilia na queima de gordura natural.', 'Tome 1 sachê 30 minutos antes do treino ou atividade física.', NULL);