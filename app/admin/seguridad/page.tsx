"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Shield, Lock, AlertTriangle, RefreshCw, Save } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"

export default function AdminSeguridadPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loadingSecurity, setLoadingSecurity] = useState(true)
  const [securityLogs, setSecurityLogs] = useState([])
  const [blockedIPs, setBlockedIPs] = useState([])
  const [newBlockedIP, setNewBlockedIP] = useState("")

  // Estados para las diferentes configuraciones de seguridad
  const [securityConfig, setSecurityConfig] = useState({
    twoFactorAuthRequired: false,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    ipBlockingEnabled: true,
    autoBlockAfterFailedAttempts: 10,
    blockDurationMinutes: 30,
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

  // Cargar configuración de seguridad y logs
  useEffect(() => {
    const fetchSecurityData = async () => {
      if (!isAdmin) return

      try {
        setLoadingSecurity(true)

        // Cargar configuración de seguridad
        const configResponse = await fetch("/api/admin/security-config")

        if (!configResponse.ok) {
          throw new Error("Error al cargar configuración de seguridad")
        }

        const configResult = await configResponse.json()

        if (configResult.success && configResult.data) {
          setSecurityConfig((prev) => ({ ...prev, ...configResult.data }))
        }

        // Cargar IPs bloqueadas
        const ipsResponse = await fetch("/api/admin/blocked-ips")

        if (!ipsResponse.ok) {
          throw new Error("Error al cargar IPs bloqueadas")
        }

        const ipsResult = await ipsResponse.json()

        if (ipsResult.success) {
          setBlockedIPs(ipsResult.data || [])
        }

        // Cargar logs de seguridad
        const logsResponse = await fetch("/api/admin/security-logs")

        if (!logsResponse.ok) {
          throw new Error("Error al cargar logs de seguridad")
        }

        const logsResult = await logsResponse.json()

        if (logsResult.success) {
          setSecurityLogs(logsResult.data || [])
        }
      } catch (error) {
        console.error("Error al cargar datos de seguridad:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de seguridad",
          variant: "destructive",
        })
      } finally {
        setLoadingSecurity(false)
      }
    }

    fetchSecurityData()
  }, [isAdmin])

  // Función para guardar la configuración de seguridad
  const saveSecurityConfig = async () => {
    try {
      setSaving(true)

      const response = await fetch("/api/admin/security-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(securityConfig),
      })

      if (!response.ok) {
        throw new Error("Error al guardar configuración de seguridad")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Configuración guardada",
          description: "La configuración de seguridad se ha guardado correctamente",
        })
      } else {
        throw new Error(result.error || "Error al guardar configuración de seguridad")
      }
    } catch (error) {
      console.error("Error al guardar la configuración de seguridad:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de seguridad",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Función para bloquear una IP
  const blockIP = async () => {
    if (!newBlockedIP.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar una dirección IP válida",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch("/api/admin/blocked-ips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ip_address: newBlockedIP,
          reason: "Bloqueo manual por administrador",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al bloquear IP")
      }

      const result = await response.json()

      if (result.success) {
        setBlockedIPs([result.data, ...blockedIPs])
        setNewBlockedIP("")

        toast({
          title: "IP bloqueada",
          description: "La dirección IP ha sido bloqueada correctamente",
        })
      } else {
        throw new Error(result.error || "Error al bloquear IP")
      }
    } catch (error) {
      console.error("Error al bloquear IP:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo bloquear la dirección IP",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Función para desbloquear una IP
  const unblockIP = async (ipId) => {
    try {
      setSaving(true)

      const response = await fetch(`/api/admin/blocked-ips?id=${ipId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al desbloquear IP")
      }

      const result = await response.json()

      if (result.success) {
        setBlockedIPs(blockedIPs.filter((ip) => ip.id !== ipId))

        toast({
          title: "IP desbloqueada",
          description: "La dirección IP ha sido desbloqueada correctamente",
        })
      } else {
        throw new Error(result.error || "Error al desbloquear IP")
      }
    } catch (error) {
      console.error("Error al desbloquear IP:", error)
      toast({
        title: "Error",
        description: "No se pudo desbloquear la dirección IP",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Función para restablecer la configuración de seguridad
  const resetSecurityConfig = () => {
    if (
      confirm("¿Estás seguro de que quieres restablecer la configuración de seguridad a los valores predeterminados?")
    ) {
      setSecurityConfig({
        twoFactorAuthRequired: false,
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecialChars: true,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        ipBlockingEnabled: true,
        autoBlockAfterFailedAttempts: 10,
        blockDurationMinutes: 30,
      })

      toast({
        title: "Configuración restablecida",
        description: "Se han restablecido los valores predeterminados de seguridad",
      })
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Función para obtener el color del badge según el tipo de evento
  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case "login_failed":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "login_success":
        return "bg-green-100 text-green-800 border-green-300"
      case "ip_blocked":
        return "bg-red-100 text-red-800 border-red-300"
      case "password_changed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
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
              <Shield className="mr-2 h-6 w-6" />
              Seguridad
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">Gestiona la seguridad y los accesos de la plataforma</p>
          </div>

          {loadingSecurity ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Cargando datos de seguridad...</p>
            </div>
          ) : (
            <Tabs defaultValue="config" className="space-y-4">
              <TabsList>
                <TabsTrigger value="config" className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>Configuración</span>
                </TabsTrigger>
                <TabsTrigger value="ips" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>IPs Bloqueadas</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Logs de Seguridad</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Seguridad</CardTitle>
                    <CardDescription>Configura los parámetros de seguridad de la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passwordMinLength">Longitud mínima de contraseña</Label>
                        <Input
                          id="passwordMinLength"
                          type="number"
                          min="6"
                          max="20"
                          value={securityConfig.passwordMinLength}
                          onChange={(e) =>
                            setSecurityConfig({ ...securityConfig, passwordMinLength: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passwordExpiryDays">Caducidad de contraseña (días)</Label>
                        <Input
                          id="passwordExpiryDays"
                          type="number"
                          min="0"
                          max="365"
                          value={securityConfig.passwordExpiryDays}
                          onChange={(e) =>
                            setSecurityConfig({
                              ...securityConfig,
                              passwordExpiryDays: Number.parseInt(e.target.value),
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">0 = sin caducidad</p>
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
                          value={securityConfig.maxLoginAttempts}
                          onChange={(e) =>
                            setSecurityConfig({ ...securityConfig, maxLoginAttempts: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeoutMinutes">Tiempo de sesión (minutos)</Label>
                        <Input
                          id="sessionTimeoutMinutes"
                          type="number"
                          min="5"
                          max="1440"
                          value={securityConfig.sessionTimeoutMinutes}
                          onChange={(e) =>
                            setSecurityConfig({
                              ...securityConfig,
                              sessionTimeoutMinutes: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="autoBlockAfterFailedAttempts">Bloqueo automático tras intentos fallidos</Label>
                        <Input
                          id="autoBlockAfterFailedAttempts"
                          type="number"
                          min="3"
                          max="20"
                          value={securityConfig.autoBlockAfterFailedAttempts}
                          onChange={(e) =>
                            setSecurityConfig({
                              ...securityConfig,
                              autoBlockAfterFailedAttempts: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blockDurationMinutes">Duración del bloqueo (minutos)</Label>
                        <Input
                          id="blockDurationMinutes"
                          type="number"
                          min="5"
                          max="1440"
                          value={securityConfig.blockDurationMinutes}
                          onChange={(e) =>
                            setSecurityConfig({
                              ...securityConfig,
                              blockDurationMinutes: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="twoFactorAuthRequired">Autenticación de dos factores</Label>
                          <p className="text-sm text-muted-foreground">
                            Requiere autenticación de dos factores para todos los usuarios
                          </p>
                        </div>
                        <Switch
                          id="twoFactorAuthRequired"
                          checked={securityConfig.twoFactorAuthRequired}
                          onCheckedChange={(checked) =>
                            setSecurityConfig({ ...securityConfig, twoFactorAuthRequired: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="passwordRequireUppercase">Requerir mayúsculas</Label>
                          <p className="text-sm text-muted-foreground">
                            Las contraseñas deben contener al menos una letra mayúscula
                          </p>
                        </div>
                        <Switch
                          id="passwordRequireUppercase"
                          checked={securityConfig.passwordRequireUppercase}
                          onCheckedChange={(checked) =>
                            setSecurityConfig({ ...securityConfig, passwordRequireUppercase: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="passwordRequireNumbers">Requerir números</Label>
                          <p className="text-sm text-muted-foreground">
                            Las contraseñas deben contener al menos un número
                          </p>
                        </div>
                        <Switch
                          id="passwordRequireNumbers"
                          checked={securityConfig.passwordRequireNumbers}
                          onCheckedChange={(checked) =>
                            setSecurityConfig({ ...securityConfig, passwordRequireNumbers: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="passwordRequireSpecialChars">Requerir caracteres especiales</Label>
                          <p className="text-sm text-muted-foreground">
                            Las contraseñas deben contener al menos un carácter especial
                          </p>
                        </div>
                        <Switch
                          id="passwordRequireSpecialChars"
                          checked={securityConfig.passwordRequireSpecialChars}
                          onCheckedChange={(checked) =>
                            setSecurityConfig({ ...securityConfig, passwordRequireSpecialChars: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="ipBlockingEnabled">Bloqueo de IPs</Label>
                          <p className="text-sm text-muted-foreground">
                            Habilita el bloqueo automático de IPs sospechosas
                          </p>
                        </div>
                        <Switch
                          id="ipBlockingEnabled"
                          checked={securityConfig.ipBlockingEnabled}
                          onCheckedChange={(checked) =>
                            setSecurityConfig({ ...securityConfig, ipBlockingEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={resetSecurityConfig}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restablecer
                    </Button>
                    <Button onClick={saveSecurityConfig} disabled={saving}>
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

              <TabsContent value="ips">
                <Card>
                  <CardHeader>
                    <CardTitle>IPs Bloqueadas</CardTitle>
                    <CardDescription>Gestiona las direcciones IP bloqueadas en la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Dirección IP"
                        value={newBlockedIP}
                        onChange={(e) => setNewBlockedIP(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={blockIP} disabled={saving} className="w-full sm:w-auto">
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Bloquear IP
                      </Button>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Dirección IP</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead className="hidden md:table-cell">Fecha de bloqueo</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {blockedIPs.length > 0 ? (
                            blockedIPs.map((ip) => (
                              <TableRow key={ip.id}>
                                <TableCell className="font-medium">{ip.ip_address}</TableCell>
                                <TableCell>{ip.reason}</TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(ip.blocked_at)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => unblockIP(ip.id)} disabled={saving}>
                                    Desbloquear
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No hay direcciones IP bloqueadas
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs de Seguridad</CardTitle>
                    <CardDescription>Revisa los eventos de seguridad recientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead className="hidden md:table-cell">Usuario</TableHead>
                            <TableHead className="hidden md:table-cell">IP</TableHead>
                            <TableHead>Detalles</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {securityLogs.length > 0 ? (
                            securityLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getEventTypeColor(log.event_type)}>
                                    {log.event_type.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{log.user_email || "-"}</TableCell>
                                <TableCell className="hidden md:table-cell">{log.ip_address}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{log.details}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                No hay logs de seguridad disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

