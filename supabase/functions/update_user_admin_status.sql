-- Esta función debe estar protegida y solo ser accesible para administradores
-- Asegúrate de configurar las políticas de seguridad apropiadas en Supabase
CREATE OR REPLACE FUNCTION update_user_admin_status(user_id UUID, is_admin BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Corre con los privilegios del creador
AS $$
DECLARE
  current_user_id UUID;
  current_user_is_admin BOOLEAN;
BEGIN
  -- Obtener el ID del usuario actual que está ejecutando la función
  current_user_id := auth.uid();
  
  -- Verificar si el usuario actual es un administrador
  SELECT (raw_user_meta_data->>'is_admin')::BOOLEAN INTO current_user_is_admin
  FROM auth.users
  WHERE id = current_user_id;
  
  -- Solo permitir que los administradores ejecuten esta función
  IF current_user_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Acceso denegado: solo los administradores pueden actualizar el estado de administrador';
  END IF;
  
  -- Actualizar el estado de administrador para el usuario especificado
  UPDATE auth.users
  SET raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object('is_admin', is_admin)
  WHERE id = user_id;
  
END;
$$;

