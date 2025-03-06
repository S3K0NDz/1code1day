-- Función para actualizar varios campos de un usuario
CREATE OR REPLACE FUNCTION update_user(user_id UUID, user_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_is_admin BOOLEAN;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Verificar si el usuario actual es un administrador
  SELECT (raw_user_meta_data->>'is_admin')::BOOLEAN INTO current_user_is_admin
  FROM auth.users
  WHERE id = current_user_id;
  
  -- Solo permitir que los administradores ejecuten esta función
  IF current_user_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Acceso denegado: solo los administradores pueden modificar usuarios';
  END IF;
  
  -- Actualizar los datos del usuario
  UPDATE auth.users
  SET 
    raw_user_meta_data = raw_user_meta_data || user_data
  WHERE id = user_id;
  
END;
$$;

