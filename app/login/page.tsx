"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Github } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicLinkEmail, setMagicLinkEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)
  const { signIn, signInWithMagicLink, signInWithGitHub } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      router.push("/reto-diario")
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Verifica tus credenciales e intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signInWithMagicLink(magicLinkEmail)
      if (error) throw error
      setIsMagicLinkSent(true)
    } catch (error: any) {
      toast({
        title: "Error al enviar el enlace mágico",
        description: error.message || "Verifica tu correo e intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    try {
      const { error } = await signInWithGitHub()
      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión con GitHub",
        description: error.message || "Ha ocurrido un error. Intenta de nuevo.",
        variant: "destructive",
      })
    }
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
            <h1 className="text-2xl font-bold mt-6">Iniciar sesión</h1>
            <p className="text-muted-foreground mt-2">Ingresa a tu cuenta para continuar</p>
          </div>

          <div className="bg-card/30 border border-border rounded-lg p-6">
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password">Contraseña</TabsTrigger>
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <Link href="/recuperar-password" className="text-sm text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                    </div>
                  </div>

                  <Button type="button" variant="outline" className="w-full" onClick={handleGitHubLogin}>
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="magic-link">
                {!isMagicLinkSent ? (
                  <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-link-email">Correo electrónico</Label>
                      <Input
                        id="magic-link-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando enlace...
                        </>
                      ) : (
                        "Enviar enlace mágico"
                      )}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                      </div>
                    </div>

                    <Button type="button" variant="outline" className="w-full" onClick={handleGitHubLogin}>
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">¡Enlace enviado!</h3>
                    <p className="text-muted-foreground mb-4">
                      Hemos enviado un enlace mágico a <strong>{magicLinkEmail}</strong>. Revisa tu bandeja de entrada y
                      haz clic en el enlace para iniciar sesión.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => setIsMagicLinkSent(false)}>
                      Volver
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/registro" className="text-primary hover:underline">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

