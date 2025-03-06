"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { supabase } from "@/lib/supabase"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.NODE_ENV === "production"
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/actualizar-password`
            : `${window.location.origin}/actualizar-password`,
      })

      if (error) throw error

      setIsSuccess(true)
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center">
              <div className="bg-white text-black px-4 py-2 text-3xl font-bold">1code</div>
              <div className="text-white text-3xl font-bold px-2">1day</div>
            </Link>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Link href="/login" className="text-muted-foreground hover:text-foreground mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
              </div>
              <CardDescription>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-6">
                  <h3 className="text-lg font-medium mb-2">¡Correo enviado!</h3>
                  <p className="text-muted-foreground mb-4">
                    Hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No olvides revisar tu carpeta de spam si no encuentras el correo en tu bandeja de entrada.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Link href="/login" className="underline-offset-4 hover:underline">
                  Volver al inicio de sesión
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

