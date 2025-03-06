"use client"

import { useEffect } from "react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Loader2, UserCog, Code, Settings, BarChart, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function AdminPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()

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

  const adminModules = [
    {
      title: "Gestión de Usuarios",
      description: "Administra los usuarios, permisos y suscripciones",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      link: "/admin/usuarios",
    },
    {
      title: "Gestión de Retos",
      description: "Crea, edita y programa los retos diarios",
      icon: <Code className="h-8 w-8 text-green-500" />,
      link: "/admin/retos",
    },
    {
      title: "Estadísticas",
      description: "Visualiza estadísticas y métricas de la plataforma",
      icon: <BarChart className="h-8 w-8 text-indigo-500" />,
      link: "/admin/estadisticas",
    },
    {
      title: "Configuración",
      description: "Configura parámetros generales de la plataforma",
      icon: <Settings className="h-8 w-8 text-orange-500" />,
      link: "/admin/configuracion",
    },
    {
      title: "Seguridad",
      description: "Gestiona seguridad y accesos de usuarios",
      icon: <Shield className="h-8 w-8 text-red-500" />,
      link: "/admin/seguridad",
    },
  ]

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <UserCog className="mr-2 h-8 w-8" />
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">
              Bienvenido al panel de administración. Aquí puedes gestionar todos los aspectos de la plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {adminModules.map((module, index) => (
              <Link href={module.link} key={index}>
                <Card className="h-full hover:border-primary transition-colors duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {module.icon}
                      <span>{module.title}</span>
                    </CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Acceder</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas por los administradores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCog className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Usuario actualizado</p>
                    <p className="text-sm text-muted-foreground">Se actualizaron permisos de usuario ID: 425789</p>
                    <p className="text-xs text-muted-foreground">Hace 2 horas - por {user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Code className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Nuevo reto creado</p>
                    <p className="text-sm text-muted-foreground">Se creó el reto "Búsqueda binaria"</p>
                    <p className="text-xs text-muted-foreground">Hace 1 día - por admin@1code1day.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Intento de acceso no autorizado</p>
                    <p className="text-sm text-muted-foreground">IP: 203.0.113.1 - Bloqueado automáticamente</p>
                    <p className="text-xs text-muted-foreground">Hace 3 días - Sistema</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

