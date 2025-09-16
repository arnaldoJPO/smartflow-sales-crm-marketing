-- Ajustar políticas RLS para permitir criação de restaurantes por usuários autenticados
-- Esta query deve ser executada no dashboard do Supabase

-- Remover política existente que pode estar causando problemas
DROP POLICY IF EXISTS "Users can insert restaurants" ON public.restaurants;

-- Criar política mais permissiva para inserção
CREATE POLICY "Users can insert own restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Garantir que o trigger de profile está funcionando corretamente
-- Atualizar função para incluir phone no profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se todas as políticas estão ativas
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'restaurants';