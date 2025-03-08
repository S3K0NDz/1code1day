"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, RefreshCw, Search } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

export default function AdminSuscripcionesPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingUser, setSyncingUser] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

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

  // Cargar suscripciones
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!isAdmin) return

      try {
        setLoadingSubscriptions(true)
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select(`*`)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Obtener los emails de los usuarios en una consulta separada
        if (data && data.length > 0) {
          const userIds = data.map((sub) => sub.user_id)

          // Usar la API de autenticación de Supabase para obtener usuarios
          const userEmails = {}

          for (const userId of userIds) {
            try {
              const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
              if (!userError && userData?.user) {
                userEmails[userId] = userData.user.email
              }
            } catch (err) {
              console.error(`Error fetching user ${userId}:`, err)
            }
          }

          // Añadir el email a cada suscripción
          const subscriptionsWithEmail = data.map((sub) => ({
            ...sub,
            userEmail: userEmails[sub.user_id] || "Usuario desconocido",
          }))

          setSubscriptions(subscriptionsWithEmail)
        } else {
          setSubscriptions([])
        }
      } catch (error) {
        console.error("Error al cargar suscripciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las suscripciones",
          variant: "destructive",
        })
      } finally {
        setLoadingSubscriptions(false)
      }
    }

    fetchSubscriptions()
  }, [isAdmin])

  // Función para sincronizar una suscripción específica
  const syncSubscription = async (userId: string) => {
    try {
      setSyncingUser(userId)
      const response = await fetch("/api/admin/sync-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar la suscripción")
      }

      toast({
        title: "Suscripción sincronizada",
        description: "La suscripción se ha sincronizado correctamente",
      })

      // Recargar las suscripciones
      const { data: updatedData, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          users:user_id(email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSubscriptions(updatedData || [])
    } catch (error) {
      console.error("Error al sincronizar la suscripción:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al sincronizar la suscripción",
        variant: "destructive",
      })
    } finally {
      setSyncingUser("")
    }
  }

  // Función para sincronizar todas las suscripciones
  const syncAllSubscriptions = async () => {
    let successCount = 0
    let errorCount = 0
    try {
      setSyncingAll(true)

      // Obtener todos los usuarios con is_pro = true
      try {
        // Obtener todas las suscripciones existentes
        const { data: existingSubs, error: subsError } = await supabase.from("user_subscriptions").select("user_id")

        if (subsError) throw subsError

        if (!existingSubs || existingSubs.length === 0) {
          toast({
            title: "Sin suscripciones",
            description: "No se encontraron usuarios con suscripciones activas",
          })
          setSyncingAll(false)
          return
        }

        // Sincronizar cada usuario

        for (const sub of existingSubs) {
          try {
            const response = await fetch("/api/admin/sync-subscription", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId: sub.user_id }),
            })

            if (response.ok) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            console.error(`Error al sincronizar usuario ${sub.user_id}:`, error)
            errorCount++
          }
        }
      } catch (error) {
        console.error("Error al obtener suscripciones:", error)
        toast({
          title: "Error",
          description: "Error al obtener las suscripciones",
          variant: "destructive",
        })
        setSyncingAll(false)
        return
      }

      toast({
        title: "Sincronización completada",
        description: `${successCount} suscripciones sincronizadas correctamente. ${errorCount} errores.`,
      })

      // Recargar las suscripciones
      const { data: updatedData, error: fetchError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          users:user_id(email)
        `)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setSubscriptions(updatedData || [])
    } catch (error) {
      console.error("Error al sincronizar todas las suscripciones:", error)
      toast({
        title: "Error",
        description: "Error al sincronizar todas las suscripciones",
        variant: "destructive",
      })
    } finally {
      setSyncingAll(false)
    }
  }

  // Función para buscar usuarios
  const searchUsers = async () => {
    if (!searchTerm.trim()) return

    try {
      setSearching(true)

      // Buscar usuarios por email o ID
      try {
        // Usar la API de autenticación para buscar usuarios
        // Nota: Esta es una simplificación, ya que la API de autenticación no tiene búsqueda por email
        // En un caso real, podrías implementar esto con una función RPC personalizada en Supabase

        // Como alternativa, mostraremos un mensaje informativo
        toast({
          title: "Búsqueda limitada",
          description: "Introduce el ID exacto del usuario para buscarlo",
        })

        if (searchTerm.length > 30) {
          // Asumiendo que es un UUID
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(searchTerm)

          if (!userError && userData?.user) {
            setSearchResults([
              {
                id: userData.user.id,
                email: userData.user.email,
                user_metadata: userData.user.user_metadata,
              },
            ])
          } else {
            setSearchResults([])
          }
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error al buscar usuarios:", error)
        toast({
          title: "Error",
          description: "Error al buscar usuarios",
          variant: "destructive",
        })
      }
    } finally {
      setSearching(false)
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
          <div className="flex items-center mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al panel
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Gestión de Suscripciones</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sincronizar Suscripciones</CardTitle>
                <CardDescription>Sincroniza las suscripciones de Stripe con la base de datos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={syncAllSubscriptions} disabled={syncingAll} className="w-full">
                  {syncingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sincronizar Todas
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Buscar Usuario</CardTitle>
                <CardDescription>Busca un usuario por email o ID para sincronizar su suscripción</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="flex-grow">
                    <Input
                      placeholder="Email o ID de usuario"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={searchUsers} disabled={searching || !searchTerm.trim()}>
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border rounded-md divide-y">
                    {searchResults.map((user) => (
                      <div key={user.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                          <div className="text-xs mt-1">
                            {user.user_metadata?.is_pro ? (
                              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/20">
                                Pro
                              </Badge>
                            ) : (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => syncSubscription(user.id)} disabled={syncingUser === user.id}>
                          {syncingUser === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sincronizar"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchTerm && !searching && (
                  <p className="text-center text-muted-foreground py-2">No se encontraron usuarios</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Suscripciones Actuales</CardTitle>
              <CardDescription>Lista de todas las suscripciones registradas en la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubscriptions ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Cargando suscripciones...</p>
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Usuario</th>
                        <th className="text-left p-3 font-medium">Plan</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-left p-3 font-medium">Ciclo</th>
                        <th className="text-left p-3 font-medium">Próxima facturación</th>
                        <th className="text-center p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-medium">{subscription.userEmail || "Usuario desconocido"}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {subscription.user_id.substring(0, 8)}...
                            </div>
                          </td>
                          <td className="p-3">{subscription.plan_id}</td>
                          <td className="p-3">
                            {subscription.status === "active" ? (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500/20">Activo</Badge>
                            ) : subscription.status === "canceled" ? (
                              <Badge variant="destructive">Cancelado</Badge>
                            ) : (
                              <Badge variant="outline">{subscription.status}</Badge>
                            )}
                          </td>
                          <td className="p-3">{subscription.billing_cycle}</td>
                          <td className="p-3">{new Date(subscription.current_period_end).toLocaleDateString()}</td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncSubscription(subscription.user_id)}
                              disabled={syncingUser === subscription.user_id}
                            >
                              {syncingUser === subscription.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay suscripciones registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

