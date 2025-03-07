"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<"success" | "error" | null>(null)

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setSessionStatus("error")
        setIsLoading(false)
        return
      }

      try {
        // Verificar el estado de la sesión en el servidor
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
        const data = await response.json()

        if (data.success) {
          setSessionStatus("success")
        } else {
          setSessionStatus("error")
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error)
        setSessionStatus("error")
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Verificando tu pago...</p>
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center">
              <div className="bg-white text-black px-3 py-1 text-2xl font-bold">1code</div>
              <div className="text-white text-2xl font-bold px-1">1day</div>
            </Link>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              {sessionStatus === "success" ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center">¡Pago completado!</CardTitle>
                  <CardDescription className="text-center">
                    Tu suscripción Premium ha sido activada correctamente
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl text-center">Error en el pago</CardTitle>
                  <CardDescription className="text-center">Ha ocurrido un problema al procesar tu pago</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {sessionStatus === "success" ? (
                <div className="text-center py-4">
                  <p className="mb-4">
                    Gracias por suscribirte a 1code1day Premium. Ya puedes disfrutar de todas las funciones exclusivas.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hemos enviado un recibo a tu correo electrónico con los detalles de tu compra.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-4">
                    No pudimos procesar tu pago correctamente. Por favor, inténtalo de nuevo o contacta con nuestro
                    soporte si el problema persiste.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              {sessionStatus === "success" ? (
                <Button asChild>
                  <Link href="/reto-diario">Ir a mi primer reto</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/planes">Volver a planes</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

