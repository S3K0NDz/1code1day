"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  Loader2,
  Users,
  FileText,
  CreditCard,
  Mail,
  BarChart,
  Settings,
  Shield,
  AlertCircle,
  Database,
  Info,
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [missingTables, setMissingTables] = useState<string[]>([])
  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [showSqlDialog, setShowSqlDialog] = useState(false)

  // Verificar que el usuario es administrador
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [isLoading, isAdmin, router])

  // Verificar si existen las tablas de administración
  useEffect(() => {
    const checkAdminTables = async () => {
      if (!isAdmin) return

      try {
        setIsInitializing(true)
        setInitError(null)

        const response = await fetch("/api/admin/init-admin-tables", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        // Verificar si la respuesta es válida antes de intentar parsearla
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Respuesta no válida: ${await response.text()}`)
        }

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404 && data.missingTables) {
            setMissingTables(data.missingTables)
            setShowSqlDialog(true)
          } else {
            throw new Error(data.error || "Error al verificar tablas de administración")
          }
        }

        console.log("Verificación de tablas:", data)
      } catch (error) {
        console.error("Error al verificar tablas:", error)
        setInitError(error instanceof Error ? error.message : "Error desconocido")
        toast({
          title: "Error de verificación",
          description:
            "No se pudieron verificar las tablas de administración. Algunas funciones pueden no estar disponibles.",
          variant: "destructive",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    checkAdminTables()
  }, [isAdmin])

  // Función para ejecutar el diagnóstico
  const runDiagnostic = async () => {
    try {
      setIsDiagnosing(true)
      const response = await fetch("/api/admin/check-tables")
      const data = await response.json()
      setDiagnosticResults(data)
    } catch (error) {
      console.error("Error al ejecutar diagnóstico:", error)
      toast({
        title: "Error de diagnóstico",
        description: "No se pudo completar el diagnóstico",
        variant: "destructive",
      })
    } finally {
      setIsDiagnosing(false)
    }
  }

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando...</p>
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  if (!isAdmin) {
    return null // Redirección manejada en el useEffect
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={runDiagnostic} disabled={isDiagnosing}>
                {isDiagnosing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Diagnosticando...
                  </>
                ) : (
                  <>Diagnóstico</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSqlDialog(true)}>
                <Database className="mr-2 h-4 w-4" />
                SQL Manual
              </Button>
            </div>
          </div>

          {isInitializing && (
            <Alert className="mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Verificando</AlertTitle>
              <AlertDescription>Verificando las tablas de administración...</AlertDescription>
            </Alert>
          )}

          {initError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{initError}</AlertDescription>
            </Alert>
          )}

          {missingTables.length > 0 && (
            <Alert variant="warning" className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Tablas faltantes</AlertTitle>
              <AlertDescription>
                <p>Faltan las siguientes tablas: {missingTables.join(", ")}.</p>
                <p className="mt-2">Haz clic en el botón "SQL Manual" para ver el SQL necesario para crearlas.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowSqlDialog(true)}>
                  <Database className="mr-2 h-4 w-4" />
                  Ver SQL
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {diagnosticResults && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resultados del diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(diagnosticResults, null, 2)}
                </pre>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setDiagnosticResults(null)}>
                  Cerrar
                </Button>
              </CardFooter>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="Usuarios"
              description="Gestiona los usuarios de la plataforma"
              icon={<Users className="h-8 w-8" />}
              href="/admin/usuarios"
            />

            <AdminCard
              title="Retos"
              description="Administra los retos de programación"
              icon={<FileText className="h-8 w-8" />}
              href="/admin/retos"
            />

            <AdminCard
              title="Suscripciones"
              description="Gestiona las suscripciones premium"
              icon={<CreditCard className="h-8 w-8" />}
              href="/admin/suscripciones"
            />

            <AdminCard
              title="Correos"
              description="Envía correos a los usuarios"
              icon={<Mail className="h-8 w-8" />}
              href="/admin/correos"
            />

            <AdminCard
              title="Estadísticas"
              description="Visualiza métricas y estadísticas"
              icon={<BarChart className="h-8 w-8" />}
              href="/admin/estadisticas"
              isNew={true}
            />

            <AdminCard
              title="Configuración"
              description="Configura los parámetros de la plataforma"
              icon={<Settings className="h-8 w-8" />}
              href="/admin/configuracion"
              isNew={true}
            />

            <AdminCard
              title="Seguridad"
              description="Gestiona la seguridad y los accesos"
              icon={<Shield className="h-8 w-8" />}
              href="/admin/seguridad"
              isNew={true}
            />
          </div>
        </main>

        <Dialog open={showSqlDialog} onOpenChange={setShowSqlDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>SQL para crear tablas manualmente</DialogTitle>
              <DialogDescription>
                Ejecuta este SQL en el editor SQL de Supabase para crear las tablas necesarias.
              </DialogDescription>
            </DialogHeader>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {`-- Tabla de configuración
CREATE TABLE IF NOT EXISTS public.config (
  id SERIAL PRIMARY KEY,
  general JSONB DEFAULT '{}'::jsonb,
  email JSONB DEFAULT '{}'::jsonb,
  challenge JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insertar configuración por defecto si la tabla está vacía
INSERT INTO public.config (general, email, challenge)
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM public.config);

-- Tabla de configuración de seguridad
CREATE TABLE IF NOT EXISTS public.security_config (
  id SERIAL PRIMARY KEY,
  two_factor_auth_required BOOLEAN DEFAULT false,
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_special_chars BOOLEAN DEFAULT true,
  password_expiry_days INTEGER DEFAULT 90,
  session_timeout_minutes INTEGER DEFAULT 60,
  max_login_attempts INTEGER DEFAULT 5,
  ip_blocking_enabled BOOLEAN DEFAULT true,
  auto_block_after_failed_attempts INTEGER DEFAULT 10,
  block_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insertar configuración de seguridad por defecto si la tabla está vacía
INSERT INTO public.security_config (
  two_factor_auth_required,
  password_min_length,
  password_require_uppercase,
  password_require_numbers,
  password_require_special_chars,
  password_expiry_days,
  session_timeout_minutes,
  max_login_attempts,
  ip_blocking_enabled,
  auto_block_after_failed_attempts,
  block_duration_minutes
)
SELECT 
  false,
  8,
  true,
  true,
  true,
  90,
  60,
  5,
  true,
  10,
  30
WHERE NOT EXISTS (SELECT 1 FROM public.security_config);

-- Tabla de IPs bloqueadas
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id SERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índice para búsquedas rápidas por IP
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);

-- Tabla de logs de seguridad
CREATE TABLE IF NOT EXISTS public.security_logs (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address TEXT,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(timestamp);

-- Tabla de estadísticas
CREATE TABLE IF NOT EXISTS public.stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  users_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  premium_users_count INTEGER DEFAULT 0,
  challenges_created_count INTEGER DEFAULT 0,
  challenges_completed_count INTEGER DEFAULT 0,
  daily_challenge_completion_rate FLOAT DEFAULT 0,
  average_challenge_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índice para búsquedas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_stats_date ON public.stats(date);

-- Insertar algunos datos de ejemplo para estadísticas (opcional)
INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '7 days', 100, 50, 20, 30, 150, 0.75, 1800
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '7 days');

INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '6 days', 105, 55, 22, 32, 160, 0.78, 1750
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '6 days');

INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '5 days', 110, 60, 25, 35, 170, 0.80, 1700
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '5 days');

INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '4 days', 115, 65, 28, 38, 180, 0.82, 1650
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '4 days');

INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '3 days', 120, 70, 30, 40, 190, 0.85, 1600
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '3 days');

INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '2 days', 125, 75, 32, 42, 200, 0.87, 1550
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '2 days');

INSERT INTO public.stats (date, users_count, active_users_count, premium_users_count, challenges_created_count, challenges_completed_count, daily_challenge_completion_rate, average_challenge_time)
SELECT 
  CURRENT_DATE - INTERVAL '1 day', 130, 80, 35, 45, 210, 0.90, 1500
WHERE NOT EXISTS (SELECT 1 FROM public.stats WHERE date = CURRENT_DATE - INTERVAL '1 day');`}
            </pre>
            <DialogFooter>
              <Button onClick={() => setShowSqlDialog(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </InteractiveGridBackground>
  )
}

function AdminCard({ title, description, icon, href, isNew = false }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{title}</CardTitle>
          {icon}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {isNew && (
          <div className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs font-medium px-2 py-1 rounded-full mb-2">
            Nuevo
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full">Acceder</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

