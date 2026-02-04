-- Corrigir políticas RLS para permitir que o usuário veja e edite seu próprio perfil (incluindo token FCM)
-- Primeiro, remover políticas conflitantes ou restritivas criadas anteriormente

DROP POLICY IF EXISTS "No direct SELECT access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar políticas permissivas e seguras
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Garantir que a função get_own_profile continue funcionando (ela é SECURITY DEFINER, então ok)

-- Melhorar o trigger de criação de usuário para ser mais robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, surname, cpf)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'surname', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    surname = EXCLUDED.surname,
    cpf = EXCLUDED.cpf;
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Logar erro mas não impedir criação do usuário no Auth (opcional, mas seguro para evitar bloqueio total)
  RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
