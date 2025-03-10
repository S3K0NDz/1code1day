"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Lock, User, Bell, Shield } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export default function EditarPerfilPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    github: "",
    twitter: "",
    linkedin: "",
    email: "",
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  })
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Cargar datos del perfil
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.user_metadata?.username || user.email?.split("@")[0] || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        bio: user.user_metadata?.bio || "",
        github: user.user_metadata?.github || "",
        twitter: user.user_metadata?.twitter || "",
        linkedin: user.user_metadata?.linkedin || "",
        email: user.email || "",
        emailNotifications: user.user_metadata?.email_notifications !== false,
        pushNotifications: user.user_metadata?.push_notifications !== false,
        marketingEmails: user.user_metadata?.marketing_emails === true,
      })

      // Fetch profile data
      const fetchProfile = async () => {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching profile:", error)
        } else {
          setProfile(data)
        }
      }

      fetchProfile()
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) return

    setIsSaving(true)

    try {
      // Actualizar metadatos del usuario
      const { error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          bio: formData.bio,
          github: formData.github,
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          email_notifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          marketingEmails: formData.marketingEmails,
        },
      })

      if (error) throw error

      // Actualizar el perfil en la tabla profiles si existe
      try {
        // Crear un objeto con solo los campos básicos que probablemente existan
        const profileData = {
          id: user.id,
          username: formData.username,
        }

        // Intentar actualizar solo con los campos básicos
        const { error: profileError } = await supabase.from("profiles").upsert(profileData, { onConflict: "id" })

        if (profileError) {
          console.error("Error updating profile:", profileError)
          // Si hay error, podemos intentar un enfoque más minimalista
          if (profileError.message.includes("column")) {
            // Si el error es sobre columnas, intentar solo con el ID
            const { error: fallbackError } = await supabase
              .from("profiles")
              .upsert({ id: user.id }, { onConflict: "id" })

            if (fallbackError) {
              console.error("Error in fallback profile update:", fallbackError)
            }
          }
        }
      } catch (profileUpdateError) {
        console.error("Error in profile update:", profileUpdateError)
        // No lanzamos el error para que no afecte la actualización de los metadatos
      }

      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados correctamente.",
      })

      // Redirigir al perfil después de guardar
      router.push("/perfil")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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

  const avatarUrl = user.user_metadata?.avatar_url || "/placeholder-user.jpg"
  const displayName =
    formData.firstName && formData.lastName
      ? `${formData.firstName} ${formData.lastName}`
      : formData.username || user.email?.split("@")[0] || "usuario"

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
          {/* Cabecera de estilo editor de código */}
          <div className="bg-[#1e1e1e] border border-[#333] rounded-t-lg mb-0 overflow-hidden">
            <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-[#252526] border-b border-[#333]">
              <div className="flex items-center">
                <div className="flex space-x-2 mr-2 sm:mr-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-400 font-mono truncate max-w-[120px] sm:max-w-none">
                  editar-perfil.tsx
                </span>
              </div>
              <div className="flex items-center">
                <Link href="/perfil">
                  <Button variant="ghost" size="sm" className="h-8 px-1 sm:px-2 text-xs text-gray-400 hover:text-white">
                    <ArrowLeft className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Volver al perfil</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-3 sm:p-6 bg-[#1e1e1e]">
              <h1 className="text-2xl font-bold text-white mb-6">Editar perfil</h1>

              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full bg-[#252526] border border-[#333]">
                  <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Información personal</span>
                    <span className="sm:hidden">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-white"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Notificaciones</span>
                    <span className="sm:hidden">Notif.</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Seguridad</span>
                    <span className="sm:hidden">Seguridad</span>
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <TabsContent value="personal" className="space-y-6">
                    <Card className="bg-[#252526] border-[#333] shadow-md">
                      <CardHeader className="border-b border-[#333]">
                        <CardTitle className="text-white">Información personal</CardTitle>
                        <CardDescription className="text-gray-400">
                          Actualiza tu información personal y cómo te mostramos en la plataforma.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                          <Avatar className="h-16 sm:h-24 w-16 sm:w-24 border-4 border-[#1e1e1e]">
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback className="text-xl sm:text-3xl bg-[#333]">
                              {displayName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1 sm:gap-2 text-center sm:text-left">
                            <h3 className="text-base sm:text-lg font-medium text-white">{displayName}</h3>
                            <p className="text-xs sm:text-sm text-gray-400 break-all">{formData.email}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1 sm:mt-2 border-[#444] text-gray-300 hover:bg-[#333] text-xs"
                              disabled
                            >
                              Cambiar foto
                            </Button>
                          </div>
                        </div>

                        <Separator className="bg-[#333]" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-300">
                              Nombre de usuario
                            </Label>
                            <Input
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              placeholder="usuario123"
                              className="bg-[#1e1e1e] border-[#444] text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                              Correo electrónico
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="tu@ejemplo.com"
                              disabled
                              className="bg-[#1e1e1e] border-[#444] text-gray-400"
                            />
                            <p className="text-xs text-gray-500">Para cambiar tu correo, contacta con soporte.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-gray-300">
                              Nombre
                            </Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Juan"
                              className="bg-[#1e1e1e] border-[#444] text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-gray-300">
                              Apellido
                            </Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Pérez"
                              className="bg-[#1e1e1e] border-[#444] text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-gray-300">
                            Biografía
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Cuéntanos sobre ti..."
                            rows={4}
                            className="bg-[#1e1e1e] border-[#444] text-white focus:border-blue-500 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500">Breve descripción que aparecerá en tu perfil público.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-6">
                    <Card className="bg-[#252526] border-[#333] shadow-md">
                      <CardHeader className="border-b border-[#333]">
                        <CardTitle className="text-white">Preferencias de notificaciones</CardTitle>
                        <CardDescription className="text-gray-400">
                          Configura cómo y cuándo quieres recibir notificaciones.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 pr-2">
                              <h4 className="font-medium text-white text-sm sm:text-base">Notificaciones por correo</h4>
                              <p className="text-xs sm:text-sm text-gray-400">
                                Esta funcionalidad ha sido desactivada. Los administradores enviarán correos importantes
                                cuando sea necesario.
                              </p>
                            </div>
                            <Switch disabled checked={false} />
                          </div>

                          <Separator className="bg-[#333]" />

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Notificaciones push</h4>
                              <p className="text-sm text-gray-400">
                                Recibe notificaciones en tiempo real en tu navegador.
                              </p>
                            </div>
                            <Switch
                              checked={formData.pushNotifications}
                              onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                            />
                          </div>

                          <Separator className="bg-[#333]" />

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Correos de marketing</h4>
                              <p className="text-sm text-gray-400">
                                Recibe información sobre nuevas funcionalidades y ofertas.
                              </p>
                            </div>
                            <Switch
                              checked={formData.marketingEmails}
                              onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <Card className="bg-[#252526] border-[#333] shadow-md">
                      <CardHeader className="border-b border-[#333]">
                        <CardTitle className="text-white">Seguridad de la cuenta</CardTitle>
                        <CardDescription className="text-gray-400">
                          Gestiona la seguridad de tu cuenta y actualiza tu contraseña.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Contraseña</h4>
                              <p className="text-sm text-gray-400">
                                Actualiza tu contraseña para mantener tu cuenta segura.
                              </p>
                            </div>
                            <Link href="/actualizar-password">
                              <Button
                                variant="outline"
                                className="flex items-center gap-2 border-[#444] text-gray-300 hover:bg-[#333]"
                              >
                                <Lock className="h-4 w-4" />
                                Cambiar contraseña
                              </Button>
                            </Link>
                          </div>

                          <Separator className="bg-[#333]" />

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Sesiones activas</h4>
                              <p className="text-sm text-gray-400">
                                Gestiona los dispositivos donde has iniciado sesión.
                              </p>
                            </div>
                            <Button variant="outline" disabled className="border-[#444] text-gray-400">
                              Ver sesiones
                            </Button>
                          </div>

                          <Separator className="bg-[#333]" />

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">Autenticación de dos factores</h4>
                              <p className="text-sm text-gray-400">Añade una capa extra de seguridad a tu cuenta.</p>
                            </div>
                            <Button variant="outline" disabled className="border-[#444] text-gray-400">
                              Configurar 2FA
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <div className="flex justify-end gap-2 sm:gap-4 mt-6">
                    <Link href="/perfil">
                      <Button
                        variant="outline"
                        type="button"
                        className="border-[#444] text-gray-300 hover:bg-[#333] text-xs sm:text-sm px-2 sm:px-4"
                      >
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar cambios"
                      )}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

