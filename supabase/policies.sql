-- Políticas de seguridad para la tabla user_subscriptions

-- Habilitar RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para permitir insertar/actualizar suscripciones desde las funciones del servidor
CREATE POLICY "Permitir operaciones desde el servidor"
ON user_subscriptions
USING (true)
WITH CHECK (true);

-- Política para permitir a los usuarios ver sus propias suscripciones
CREATE POLICY "Usuarios pueden ver sus propias suscripciones"
ON user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Política para permitir a los administradores ver todas las suscripciones
CREATE POLICY "Administradores pueden ver todas las suscripciones"
ON user_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
  )
);

