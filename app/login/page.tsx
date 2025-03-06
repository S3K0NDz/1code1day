"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Mail } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState<"password" | "magic-link">("password")
  const { toast } = useToast()
  const { signIn, signInWithMagicLink } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (authMethod === "password") {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push("/reto-diario")
      } else {
        const { error } = await signInWithMagicLink(email)
        if (error) throw error
        toast({
          title: "Enlace enviado",
          description: "Revisa tu correo electrónico para iniciar sesión.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
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
          <div className="text-sm text-center text-muted-foreground mb-8">Inicia sesión para continuar</div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "password" | "magic-link")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="password">Contraseña</TabsTrigger>
                  <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                </TabsList>

                <TabsContent value="password">
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
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Contraseña</Label>
                          <Link
                            href="/recuperar-password"
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">
                              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            </span>
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="magic-link">
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="magic-email">Correo electrónico</Label>
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="tu@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="bg-primary/10 p-3 rounded-md text-sm text-muted-foreground flex items-start gap-2">
                        <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p>
                          Te enviaremos un enlace mágico a tu correo electrónico. Haz clic en él para iniciar sesión sin
                          contraseña.
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Enviando enlace..." : "Enviar enlace mágico"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="underline-offset-4 hover:underline">
                  Regístrate
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

