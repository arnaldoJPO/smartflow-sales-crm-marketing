-- Create a function to automatically create a restaurant when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a new restaurant for the user
  INSERT INTO public.restaurants (owner_id, name, phone)
  VALUES (
    NEW.id,
    'Meu Restaurante',
    '00000000000'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se já houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to execute the function after user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();