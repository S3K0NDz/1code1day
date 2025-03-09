"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ShieldAlert, CheckCircle, XCircle } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

export default function AdminDebugPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [userMetadata, setUserMetadata] = useState(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    if (user) {
      setUserMetadata(user.user_metadata || {})
    }
  }, [isLoading, user, router])

  const makeAdmin = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      // Actualizar los metadatos del usuario para hacerlo administrador
      const { error } = await supabase.auth.updateUser({
        data: { is_admin: true },
      })

      if (error) throw error

      toast({
        title: "¡Éxito!",
        description: "Ahora eres administrador. Recarga la página para ver los cambios.",
      })

      // Recargar la página para actualizar el estado
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error making user admin:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado de administrador: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
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

  if (!user) {
    return null
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6" />
            Depuración de Permisos de Administrador
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Estado de Administrador</CardTitle>
              <CardDescription>Verifica y actualiza tu estado de administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">¿Eres administrador según useAuth()?</span>
                <span className="flex items-center">
                  {isAdmin ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">Sí</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-1" />
                      <span className="text-red-500 font-medium">No</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">¿is_admin en metadatos?</span>
                <span className="flex items-center">
                  {userMetadata?.is_admin ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">Sí</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-1" />
                      <span className="text-red-500 font-medium">No</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Metadatos completos:</h3>
                <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                  {JSON.stringify(userMetadata, null, 2)}
                </pre>
              </div>

              {!isAdmin && (
                <Button onClick={makeAdmin} disabled={isUpdating} className="w-full">
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Hacer Administrador"
                  )}
                </Button>
              )}

              {isAdmin && (
                <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md">
                  <p className="text-center">
                    Ya eres administrador. Puedes acceder a todas las funciones de administración.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Esta página te permite verificar y actualizar tu estado de administrador. Si no eres administrador,
                puedes hacer clic en el botón "Hacer Administrador" para actualizar tus metadatos de usuario.
              </p>
              <p>
                Después de actualizar tu estado, recarga la página para ver los cambios. Si sigues teniendo problemas,
                contacta al administrador del sistema.
              </p>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-md">
                <p className="text-sm">
                  <strong>Nota:</strong> Esta página solo debe ser accesible para usuarios autorizados. Si has llegado
                  aquí por error, por favor sal de esta página.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

