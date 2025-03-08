"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import Link from "next/link"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "@/components/ui/use-toast"
import { getUserSubscription } from "@/lib/db-functions"

// Cargar Stripe fuera del componente para evitar recargas innecesarias
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function CheckoutPage() {
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  // Obtener el plan de los parámetros de la URL
  const plan = searchParams.get("plan") || "premium"

  useEffect(() => {
    // Redirigir a login si no hay usuario autenticado
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout")
    }

    // Verificar si el usuario ya tiene una suscripción activa
    const checkSubscription = async () => {
      if (!user) return

      try {
        const { data, success } = await getUserSubscription(user.id)

        if (success && data && data.plan_id === "premium" && data.status === "active") {
          // El usuario ya tiene una suscripción premium activa
          toast({
            title: "Ya tienes una suscripción activa",
            description: "Serás redirigido a tu perfil de suscripción.",
          })
          router.push("/perfil/suscripcion")
        } else {
          setSubscription(data)
        }
      } catch (error) {
        console.error("Error al verificar la suscripción:", error)
      }
    }

    checkSubscription()
  }, [user, authLoading, router])

  // Mejorar el manejo de errores en la función handleCheckout
  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=/checkout")
      return
    }

    setIsLoading(true)

    try {
      // Crear una sesión de checkout en el servidor
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          billingCycle,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la sesión de checkout")
      }

      // Redirigir al usuario a la página de checkout de Stripe
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No se pudo crear la sesión de checkout")
      }
    } catch (error) {
      console.error("Error al iniciar el checkout:", error)
      toast({
        title: "Error al procesar el pago",
        description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo o contacta con soporte.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar un loader mientras se verifica la autenticación
  if (authLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </InteractiveGridBackground>
    )
  }

  // Datos del plan
  const planData = {
    name: "Premium",
    description: "Acceso completo a todas las funciones",
    features: [
      "Todos los retos diarios",
      "Acceso a todos los retos anteriores",
      "Editor de código avanzado",
      "Soluciones explicadas",
      "Estadísticas personales detalladas",
      "Modo práctica ilimitado",
      "Certificados de logros",
      "Soporte prioritario",
    ],
    monthly: {
      price: "€5",
      period: "por mes",
    },
    annual: {
      price: "€4",
      period: "por mes, facturado anualmente",
      savings: "Ahorra un 20%",
    },
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center">
              <div className="bg-white text-black px-3 py-1 text-2xl font-bold">1code</div>
              <div className="text-white text-2xl font-bold px-1">1day</div>
            </Link>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Finalizar compra</CardTitle>
              <CardDescription>Completa tu suscripción al plan Premium</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Plan seleccionado: {planData.name}</h3>
                <p className="text-muted-foreground">{planData.description}</p>
              </div>

              <div className="mb-6">
                <Tabs value={billingCycle} onValueChange={setBillingCycle} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Mensual</TabsTrigger>
                    <TabsTrigger value="annual">
                      Anual
                      <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 border-green-500/20">
                        Ahorra 20%
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-medium">Plan Premium</h4>
                    <p className="text-sm text-muted-foreground">
                      Facturación {billingCycle === "monthly" ? "mensual" : "anual"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {billingCycle === "monthly" ? planData.monthly.price : planData.annual.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {billingCycle === "monthly" ? planData.monthly.period : planData.annual.period}
                    </div>
                  </div>
                </div>

                {billingCycle === "annual" && (
                  <div className="bg-green-500/10 text-green-500 p-2 rounded text-sm mb-4">
                    {planData.annual.savings} comparado con la facturación mensual
                  </div>
                )}

                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="font-medium mb-2">Incluye:</h4>
                  <ul className="space-y-2">
                    {planData.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/planes">Volver</Link>
              </Button>
              <Button className="w-full sm:w-auto" onClick={handleCheckout} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Pagar ${billingCycle === "monthly" ? "€5/mes" : "€48/año"}`
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Pagos procesados de forma segura por Stripe</p>
            <p className="mt-2">
              Al completar tu compra, aceptas nuestros{" "}
              <Link href="/terminos" className="underline underline-offset-4 hover:text-primary">
                Términos y Condiciones
              </Link>
            </p>
          </div>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

