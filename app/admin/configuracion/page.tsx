"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Settings, Save, RefreshCw, Globe, Mail, Code } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"

export default function AdminConfiguracionPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)

  // Estados para las diferentes configuraciones
  const [generalConfig, setGeneralConfig] = useState({
    siteName: "1code1day",
    siteDescription: "Mejora tus habilidades de programación con un reto diario",
    maintenanceMode: false,
    allowRegistrations: true,
    defaultUserRole: "user",
    maxLoginAttempts: 5,
    sessionTimeout: 60,
  })

  const [emailConfig, setEmailConfig] = useState({
    emailSender: "no-reply@1code1day.app",
    emailFooter: "© 2025 1code1day. Todos los derechos reservados.",
    welcomeEmailEnabled: true,
    dailyChallengeEmailEnabled: true,
    dailyChallengeEmailTime: "08:00",
    emailNotificationsEnabled: true,
  })

  const [challengeConfig, setChallengeConfig] = useState({
    defaultTimeLimit: 45,
    defaultDifficulty: "Intermedio",
    showSolutionsAfterCompletion: true,
    allowHints: true,
    maxHintsPerChallenge: 3,
    showLeaderboard: true,
    dailyChallengeEnabled: true,
    freeChallengesPercentage: 30,
  })

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

  // Inicializar tablas de administración si es necesario
  useEffect(() => {
    const initAdminTables = async () => {
      if (!isAdmin) return

      try {
        const response = await fetch("/api/admin/init-admin-tables", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al inicializar tablas de administración")
        }
      } catch (error) {
        console.error("Error al inicializar tablas:", error)
      }
    }

    initAdminTables()
  }, [isAdmin])

  // Cargar configuración
  useEffect(() => {
    const fetchConfig = async () => {
      if (!isAdmin) return

      try {
        setLoadingConfig(true)

        const response = await fetch("/api/admin/config")
        const result = await response.json()

        if (result.success && result.data) {
          // Actualizar estados con los datos de la base de datos
          if (result.data.general) {
            setGeneralConfig((prev) => ({ ...prev, ...result.data.general }))
          }

          if (result.data.email) {
            setEmailConfig((prev) => ({ ...prev, ...result.data.email }))
          }

          if (result.data.challenge) {
            setChallengeConfig((prev) => ({ ...prev, ...result.data.challenge }))
          }

          // Si los datos son predeterminados, mostrar una notificación
          if (result.data.isDefault) {
            toast({
              title: "Configuración predeterminada",
              description:
                "Se están mostrando valores predeterminados porque la tabla de configuración no existe o está vacía.",
              variant: "warning",
            })
          }
        } else {
          throw new Error(result.error || "Error al cargar configuración")
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración. Se están mostrando valores predeterminados.",
          variant: "destructive",
        })

        // Mantener los valores predeterminados que ya están en los estados
      } finally {
        setLoadingConfig(false)
      }
    }

    fetchConfig()
  }, [isAdmin])

  // Función para guardar la configuración
  const saveConfig = async (configType) => {
    try {
      setSaving(true)

      let section = ""
      let data = {}

      switch (configType) {
        case "general":
          section = "general"
          data = generalConfig
          break
        case "email":
          section = "email"
          data = emailConfig
          break
        case "challenge":
          section = "challenge"
          data = challengeConfig
          break
        default:
          throw new Error("Tipo de configuración no válido")
      }

      const response = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ section, data }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar configuración")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Configuración guardada",
          description: "Los cambios se han guardado correctamente",
        })
      } else {
        throw new Error(result.error || "Error al guardar configuración")
      }
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Función para reiniciar la configuración
  const resetConfig = (configType) => {
    if (confirm("¿Estás seguro de que quieres restablecer esta configuración a los valores predeterminados?")) {
      switch (configType) {
        case "general":
          setGeneralConfig({
            siteName: "1code1day",
            siteDescription: "Mejora tus habilidades de programación con un reto diario",
            maintenanceMode: false,
            allowRegistrations: true,
            defaultUserRole: "user",
            maxLoginAttempts: 5,
            sessionTimeout: 60,
          })
          break
        case "email":
          setEmailConfig({
            emailSender: "no-reply@1code1day.app",
            emailFooter: "© 2025 1code1day. Todos los derechos reservados.",
            welcomeEmailEnabled: true,
            dailyChallengeEmailEnabled: true,
            dailyChallengeEmailTime: "08:00",
            emailNotificationsEnabled: true,
          })
          break
        case "challenge":
          setChallengeConfig({
            defaultTimeLimit: 45,
            defaultDifficulty: "Intermedio",
            showSolutionsAfterCompletion: true,
            allowHints: true,
            maxHintsPerChallenge: 3,
            showLeaderboard: true,
            dailyChallengeEnabled: true,
            freeChallengesPercentage: 30,
          })
          break
      }

      toast({
        title: "Configuración restablecida",
        description: "Se han restablecido los valores predeterminados",
      })
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Volver al panel</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold flex items-center">
              <Settings className="mr-2 h-6 w-6" />
              Configuración
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">Configura los parámetros generales de la plataforma</p>
          </div>

          {loadingConfig ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Cargando configuración...</p>
            </div>
          ) : (
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>General</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Correos</span>
                </TabsTrigger>
                <TabsTrigger value="challenge" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span>Retos</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración General</CardTitle>
                    <CardDescription>Configura los parámetros básicos de la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Nombre del sitio</Label>
                        <Input
                          id="siteName"
                          value={generalConfig.siteName}
                          onChange={(e) => setGeneralConfig({ ...generalConfig, siteName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Descripción del sitio</Label>
                        <Input
                          id="siteDescription"
                          value={generalConfig.siteDescription}
                          onChange={(e) => setGeneralConfig({ ...generalConfig, siteDescription: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultUserRole">Rol de usuario predeterminado</Label>
                        <Select
                          value={generalConfig.defaultUserRole}
                          onValueChange={(value) => setGeneralConfig({ ...generalConfig, defaultUserRole: value })}
                        >
                          <SelectTrigger id="defaultUserRole">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="moderator">Moderador</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Tiempo de sesión (minutos)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          min="5"
                          max="1440"
                          value={generalConfig.sessionTimeout}
                          onChange={(e) =>
                            setGeneralConfig({ ...generalConfig, sessionTimeout: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts">Intentos máximos de inicio de sesión</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          min="1"
                          max="10"
                          value={generalConfig.maxLoginAttempts}
                          onChange={(e) =>
                            setGeneralConfig({ ...generalConfig, maxLoginAttempts: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maintenanceMode">Modo de mantenimiento</Label>
                          <p className="text-sm text-muted-foreground">
                            Activa el modo de mantenimiento para mostrar una página de mantenimiento a los usuarios
                          </p>
                        </div>
                        <Switch
                          id="maintenanceMode"
                          checked={generalConfig.maintenanceMode}
                          onCheckedChange={(checked) =>
                            setGeneralConfig({ ...generalConfig, maintenanceMode: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="allowRegistrations">Permitir registros</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite que los nuevos usuarios se registren en la plataforma
                          </p>
                        </div>
                        <Switch
                          id="allowRegistrations"
                          checked={generalConfig.allowRegistrations}
                          onCheckedChange={(checked) =>
                            setGeneralConfig({ ...generalConfig, allowRegistrations: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => resetConfig("general")}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restablecer
                    </Button>
                    <Button onClick={() => saveConfig("general")} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Correos</CardTitle>
                    <CardDescription>Configura los parámetros para el envío de correos electrónicos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailSender">Remitente de correos</Label>
                        <Input
                          id="emailSender"
                          value={emailConfig.emailSender}
                          onChange={(e) => setEmailConfig({ ...emailConfig, emailSender: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dailyChallengeEmailTime">Hora de envío del reto diario</Label>
                        <Input
                          id="dailyChallengeEmailTime"
                          type="time"
                          value={emailConfig.dailyChallengeEmailTime}
                          onChange={(e) => setEmailConfig({ ...emailConfig, dailyChallengeEmailTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailFooter">Pie de página de correos</Label>
                      <Textarea
                        id="emailFooter"
                        value={emailConfig.emailFooter}
                        onChange={(e) => setEmailConfig({ ...emailConfig, emailFooter: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="welcomeEmailEnabled">Correo de bienvenida</Label>
                          <p className="text-sm text-muted-foreground">
                            Envía un correo de bienvenida a los nuevos usuarios
                          </p>
                        </div>
                        <Switch
                          id="welcomeEmailEnabled"
                          checked={emailConfig.welcomeEmailEnabled}
                          onCheckedChange={(checked) =>
                            setEmailConfig({ ...emailConfig, welcomeEmailEnabled: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dailyChallengeEmailEnabled">Correo de reto diario</Label>
                          <p className="text-sm text-muted-foreground">
                            Envía un correo con el reto diario a los usuarios suscritos
                          </p>
                        </div>
                        <Switch
                          id="dailyChallengeEmailEnabled"
                          checked={emailConfig.dailyChallengeEmailEnabled}
                          onCheckedChange={(checked) =>
                            setEmailConfig({ ...emailConfig, dailyChallengeEmailEnabled: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotificationsEnabled">Notificaciones por correo</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite el envío de notificaciones por correo electrónico
                          </p>
                        </div>
                        <Switch
                          id="emailNotificationsEnabled"
                          checked={emailConfig.emailNotificationsEnabled}
                          onCheckedChange={(checked) =>
                            setEmailConfig({ ...emailConfig, emailNotificationsEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => resetConfig("email")}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restablecer
                    </Button>
                    <Button onClick={() => saveConfig("email")} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="challenge">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Retos</CardTitle>
                    <CardDescription>Configura los parámetros para los retos de programación</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultTimeLimit">Tiempo límite predeterminado (minutos)</Label>
                        <Input
                          id="defaultTimeLimit"
                          type="number"
                          min="5"
                          max="120"
                          value={challengeConfig.defaultTimeLimit}
                          onChange={(e) =>
                            setChallengeConfig({
                              ...challengeConfig,
                              defaultTimeLimit: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defaultDifficulty">Dificultad predeterminada</Label>
                        <Select
                          value={challengeConfig.defaultDifficulty}
                          onValueChange={(value) =>
                            setChallengeConfig({ ...challengeConfig, defaultDifficulty: value })
                          }
                        >
                          <SelectTrigger id="defaultDifficulty">
                            <SelectValue placeholder="Selecciona una dificultad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fácil">Fácil</SelectItem>
                            <SelectItem value="Intermedio">Intermedio</SelectItem>
                            <SelectItem value="Difícil">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxHintsPerChallenge">Máximo de pistas por reto</Label>
                        <Input
                          id="maxHintsPerChallenge"
                          type="number"
                          min="0"
                          max="10"
                          value={challengeConfig.maxHintsPerChallenge}
                          onChange={(e) =>
                            setChallengeConfig({
                              ...challengeConfig,
                              maxHintsPerChallenge: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeChallengesPercentage">Porcentaje de retos gratuitos</Label>
                        <Input
                          id="freeChallengesPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={challengeConfig.freeChallengesPercentage}
                          onChange={(e) =>
                            setChallengeConfig({
                              ...challengeConfig,
                              freeChallengesPercentage: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="showSolutionsAfterCompletion">Mostrar soluciones</Label>
                          <p className="text-sm text-muted-foreground">
                            Muestra las soluciones después de completar un reto
                          </p>
                        </div>
                        <Switch
                          id="showSolutionsAfterCompletion"
                          checked={challengeConfig.showSolutionsAfterCompletion}
                          onCheckedChange={(checked) =>
                            setChallengeConfig({ ...challengeConfig, showSolutionsAfterCompletion: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="allowHints">Permitir pistas</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite que los usuarios vean pistas durante los retos
                          </p>
                        </div>
                        <Switch
                          id="allowHints"
                          checked={challengeConfig.allowHints}
                          onCheckedChange={(checked) => setChallengeConfig({ ...challengeConfig, allowHints: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="showLeaderboard">Mostrar clasificación</Label>
                          <p className="text-sm text-muted-foreground">
                            Muestra la clasificación de usuarios en los retos
                          </p>
                        </div>
                        <Switch
                          id="showLeaderboard"
                          checked={challengeConfig.showLeaderboard}
                          onCheckedChange={(checked) =>
                            setChallengeConfig({ ...challengeConfig, showLeaderboard: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dailyChallengeEnabled">Reto diario</Label>
                          <p className="text-sm text-muted-foreground">Habilita la funcionalidad de reto diario</p>
                        </div>
                        <Switch
                          id="dailyChallengeEnabled"
                          checked={challengeConfig.dailyChallengeEnabled}
                          onCheckedChange={(checked) =>
                            setChallengeConfig({ ...challengeConfig, dailyChallengeEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => resetConfig("challenge")}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restablecer
                    </Button>
                    <Button onClick={() => saveConfig("challenge")} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

