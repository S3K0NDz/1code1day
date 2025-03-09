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
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
// Eliminar la importación del componente EmailNotificationToggle
// Eliminar la línea: import { EmailNotificationToggle } from "@/components/email-notification-toggle"

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

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <Link href="/perfil">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al perfil
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Editar perfil</h1>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Información personal</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notificaciones</span>
                <span className="sm:hidden">Notif.</span>
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Seguridad</span>
                <span className="sm:hidden">Seguridad</span>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información personal</CardTitle>
                    <CardDescription>
                      Actualiza tu información personal y cómo te mostramos en la plataforma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="text-3xl">
                          {displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-medium">{displayName}</h3>
                        <p className="text-sm text-muted-foreground">{formData.email}</p>
                        <Button variant="outline" size="sm" className="mt-2" disabled>
                          Cambiar foto
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="usuario123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tu@ejemplo.com"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Para cambiar tu correo, contacta con soporte.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Juan"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Pérez"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Cuéntanos sobre ti..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Breve descripción que aparecerá en tu perfil público.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferencias de notificaciones</CardTitle>
                    <CardDescription>Configura cómo y cuándo quieres recibir notificaciones.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificaciones por correo</h4>
                          <p className="text-sm text-muted-foreground">
                            Esta funcionalidad ha sido desactivada. Los administradores enviarán correos importantes
                            cuando sea necesario.
                          </p>
                        </div>
                        <Switch disabled checked={false} />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificaciones push</h4>
                          <p className="text-sm text-muted-foreground">
                            Recibe notificaciones en tiempo real en tu navegador.
                          </p>
                        </div>
                        <Switch
                          checked={formData.pushNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("pushNotifications", checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Correos de marketing</h4>
                          <p className="text-sm text-muted-foreground">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad de la cuenta</CardTitle>
                    <CardDescription>Gestiona la seguridad de tu cuenta y actualiza tu contraseña.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Contraseña</h4>
                          <p className="text-sm text-muted-foreground">
                            Actualiza tu contraseña para mantener tu cuenta segura.
                          </p>
                        </div>
                        <Link href="/actualizar-password">
                          <Button variant="outline" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Cambiar contraseña
                          </Button>
                        </Link>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Sesiones activas</h4>
                          <p className="text-sm text-muted-foreground">
                            Gestiona los dispositivos donde has iniciado sesión.
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          Ver sesiones
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Autenticación de dos factores</h4>
                          <p className="text-sm text-muted-foreground">
                            Añade una capa extra de seguridad a tu cuenta.
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          Configurar 2FA
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Eliminar el componente EmailNotificationToggle del formulario */}
              {/* Eliminar el bloque:
              <div className="mt-6 mb-4">
                <EmailNotificationToggle userId={user.id} initialValue={profile?.email_notifications || false} />
              </div> */}

              <div className="flex justify-end gap-4 mt-6">
                <Link href="/perfil">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

