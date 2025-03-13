-- Función para crear la tabla de configuración si no existe
CREATE OR REPLACE FUNCTION create_config_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'config'
  ) THEN
    -- Crear la tabla
    CREATE TABLE public.config (
      id SERIAL PRIMARY KEY,
      general JSONB DEFAULT '{}'::jsonb,
      email JSONB DEFAULT '{}'::jsonb,
      challenge JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Insertar configuración por defecto
    INSERT INTO public.config (general, email, challenge) VALUES (
      '{
        "siteName": "1code1day",
        "siteDescription": "Mejora tus habilidades de programación con un reto diario",
        "maintenanceMode": false,
        "allowRegistrations": true,
        "defaultUserRole": "user",
        "maxLoginAttempts": 5,
        "sessionTimeout": 60
      }'::jsonb,
      '{
        "emailSender": "no-reply@1code1day.app",
        "emailFooter": "© 2025 1code1day. Todos los derechos reservados.",
        "welcomeEmailEnabled": true,
        "dailyChallengeEmailEnabled": true,
        "dailyChallengeEmailTime": "08:00",
        "emailNotificationsEnabled": true
      }'::jsonb,
      '{
        "defaultTimeLimit": 45,
        "defaultDifficulty": "Intermedio",
        "showSolutionsAfterCompletion": true,
        "allowHints": true,
        "maxHintsPerChallenge": 3,
        "showLeaderboard": true,
        "dailyChallengeEnabled": true,
        "freeChallengesPercentage": 30
      }'::jsonb
    );

    -- Crear políticas de seguridad
    ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Solo administradores pueden ver la configuración"
      ON public.config
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
    
    CREATE POLICY "Solo administradores pueden modificar la configuración"
      ON public.config
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END;
$$;

-- Función para crear la tabla de configuración de seguridad si no existe
CREATE OR REPLACE FUNCTION create_security_config_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'security_config'
  ) THEN
    -- Crear la tabla
    CREATE TABLE public.security_config (
      id SERIAL PRIMARY KEY,
      twoFactorAuthRequired BOOLEAN DEFAULT false,
      passwordMinLength INTEGER DEFAULT 8,
      passwordRequireUppercase BOOLEAN DEFAULT true,
      passwordRequireNumbers BOOLEAN DEFAULT true,
      passwordRequireSpecialChars BOOLEAN DEFAULT true,
      passwordExpiryDays INTEGER DEFAULT 90,
      sessionTimeoutMinutes INTEGER DEFAULT 60,
      maxLoginAttempts INTEGER DEFAULT 5,
      ipBlockingEnabled BOOLEAN DEFAULT true,
      autoBlockAfterFailedAttempts INTEGER DEFAULT 10,
      blockDurationMinutes INTEGER DEFAULT 30,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Insertar configuración por defecto
    INSERT INTO public.security_config DEFAULT VALUES;

    -- Crear políticas de seguridad
    ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Solo administradores pueden ver la configuración de seguridad"
      ON public.security_config
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
    
    CREATE POLICY "Solo administradores pueden modificar la configuración de seguridad"
      ON public.security_config
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END;
$$;

-- Función para crear la tabla de IPs bloqueadas si no existe
CREATE OR REPLACE FUNCTION create_blocked_ips_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'blocked_ips'
  ) THEN
    -- Crear la tabla
    CREATE TABLE public.blocked_ips (
      id SERIAL PRIMARY KEY,
      ip_address TEXT NOT NULL,
      reason TEXT,
      blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      blocked_by UUID REFERENCES auth.users(id),
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Crear índice para búsquedas rápidas por IP
    CREATE INDEX idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);

    -- Crear políticas de seguridad
    ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Solo administradores pueden ver IPs bloqueadas"
      ON public.blocked_ips
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
    
    CREATE POLICY "Solo administradores pueden modificar IPs bloqueadas"
      ON public.blocked_ips
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
  END IF;
END;
$$;

-- Función para crear la tabla de logs de seguridad si no existe
CREATE OR REPLACE FUNCTION create_security_logs_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'security_logs'
  ) THEN
    -- Crear la tabla
    CREATE TABLE public.security_logs (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      user_email TEXT,
      ip_address TEXT,
      details TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Crear índices para búsquedas rápidas
    CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
    CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
    CREATE INDEX idx_security_logs_timestamp ON public.security_logs(timestamp);

    -- Crear políticas de seguridad
    ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Solo administradores pueden ver logs de seguridad"
      ON public.security_logs
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
      );
    
    CREATE POLICY "Inserción automática de logs"
      ON public.security_logs
      FOR INSERT
      WITH CHECK (true);
  END IF;
END;
$$;

-- Función para registrar eventos de seguridad
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  user_email TEXT DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  details TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_logs (event_type, user_id, user_email, ip_address, details)
  VALUES (event_type, user_id, user_email, ip_address, details);
END;
$$;

