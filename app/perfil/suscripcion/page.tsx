"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Calendar, AlertCircle, Loader2, AlertTriangle } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getUserSubscription } from "@/lib/api"

export default function SuscripcionPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Obtener información de la suscripción del usuario
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  // Añadir un nuevo estado para controlar el proceso de cancelación
  const [isCanceling, setIsCanceling] = useState(false)

  // Añadir la función para manejar la cancelación de la suscripción
  const handleCancelSubscription = async () => {
    if (!user) return

    // Mostrar un diálogo de confirmación
    if (
      !confirm(
        "¿Estás seguro de que deseas cancelar tu suscripción? Seguirás teniendo acceso Premium hasta el final del período actual.",
      )
    ) {
      return
    }

    setIsCanceling(true)
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cancelar la suscripción")
      }

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción se cancelará al final del período actual.",
      })

      // Actualizar los datos de suscripción localmente
      if (subscriptionData) {
        setSubscriptionData({
          ...subscriptionData,
          cancelAtPeriodEnd: true,
          status: "canceling",
        })
      }
    } catch (error) {
      console.error("Error al cancelar la suscripción:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cancelar la suscripción",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return

      try {
        setIsLoadingSubscription(true)

        // Obtener la suscripción de la base de datos
        const { data: subscription, success } = await getUserSubscription(user.id)

        if (success && subscription) {
          setSubscriptionData({
            plan: subscription.plan_id,
            cycle: subscription.billing_cycle,
            status: subscription.status,
            startDate: new Date(subscription.current_period_start).toLocaleDateString(),
            endDate: new Date(subscription.current_period_end).toLocaleDateString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          })
        } else {
          // Fallback a los metadatos del usuario para compatibilidad
          setSubscriptionData(
            user?.user_metadata?.subscription_plan
              ? {
                  plan: user.user_metadata.subscription_plan,
                  cycle: user.user_metadata.subscription_cycle || "monthly",
                  status: user.user_metadata.subscription_status || "active",
                  startDate: user.user_metadata.subscription_start
                    ? new Date(user.user_metadata.subscription_start).toLocaleDateString()
                    : "N/A",
                  endDate: user.user_metadata.subscription_current_period_end
                    ? new Date(user.user_metadata.subscription_current_period_end).toLocaleDateString()
                    : "N/A",
                }
              : null,
          )
        }
      } catch (error) {
        console.error("Error al obtener datos de suscripción:", error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscriptionData()
  }, [user])

  // Modificar la variable isPro para tener en cuenta el estado cancelAtPeriodEnd
  const isPro =
    subscriptionData?.plan === "premium" &&
    (subscriptionData?.status === "active" ||
      (subscriptionData?.status === "canceling" && !subscriptionData?.cancelAtPeriodEnd))

  const handleManageSubscription = async () => {
    if (!user) return

    setLoadingPortal(true)
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error("No se pudo crear la sesión del portal")
      }
    } catch (error) {
      console.error("Error al abrir el portal de gestión:", error)
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de gestión de suscripción",
        variant: "destructive",
      })
    } finally {
      setLoadingPortal(false)
    }
  }

  if (isLoading || isLoadingSubscription) {
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

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <Link href="/perfil">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al perfil
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Mi suscripción</h1>
          </div>

          {isPro ? (
            <Card className="mb-8">
              <CardHeader>
                {/* Dentro del Card para usuarios Premium, actualizar el Badge de estado */}
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Plan Premium</CardTitle>
                    <CardDescription>
                      {subscriptionData?.cycle === "monthly" ? "Facturación mensual" : "Facturación anual"}
                    </CardDescription>
                  </div>
                  {subscriptionData?.cancelAtPeriodEnd ? (
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">Cancelando</Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/20">Activo</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Precio actual</p>
                    <p className="text-xl font-bold">{subscriptionData?.cycle === "monthly" ? "€5/mes" : "€48/año"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">•••• 4242</span>
                  </div>
                </div>
                {subscriptionData?.cancelAtPeriodEnd && (
                  <div className="p-4 bg-yellow-500/10 rounded-lg mt-4 border border-yellow-500/20">
                    <p className="text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span>
                        Tu suscripción se cancelará automáticamente el {subscriptionData?.endDate}. Hasta entonces,
                        seguirás teniendo acceso a todas las funciones Premium.
                      </span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fecha de inicio</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{subscriptionData?.startDate || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Próxima facturación</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{subscriptionData?.endDate || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Beneficios incluidos:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Acceso a todos los retos anteriores</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Editor de código avanzado</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Soluciones explicadas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Estadísticas personales detalladas</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Gestionar suscripción"
                  )}
                </Button>

                {/* Añadir el botón de cancelación */}
                {isPro && !subscriptionData?.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-red-500 hover:bg-red-500/10"
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      "Cancelar suscripción"
                    )}
                  </Button>
                )}

                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/planes">Ver todos los planes</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Plan Gratuito</CardTitle>
                <CardDescription>Funcionalidades básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-xl font-bold mb-2">€0/mes</p>
                  <p className="text-sm text-muted-foreground">Plan gratuito con funcionalidades limitadas</p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <p className="text-sm">
                    Actualiza a Premium para desbloquear todas las funcionalidades y mejorar tu experiencia de
                    aprendizaje.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Funcionalidades actuales:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>1 reto diario</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Editor de código básico</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-500">✓</span>
                      <span>Acceso a comunidad</span>
                    </li>
                    <li className="flex items-start text-muted-foreground">
                      <span className="mr-2">✗</span>
                      <span>Sin acceso a retos anteriores</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/planes">Actualizar a Premium</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              ¿Tienes alguna pregunta sobre tu suscripción?{" "}
              <Link href="/contacto" className="text-primary hover:underline">
                Contacta con soporte
              </Link>
            </p>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

