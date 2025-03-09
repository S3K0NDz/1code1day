"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Mail, Send } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"

export default function AdminCorreosPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [recipientType, setRecipientType] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [userList, setUserList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    includeUnsubscribed: false,
  })
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

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
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRecipientTypeChange = async (value) => {
    setRecipientType(value)

    if (value === "specific" && userList.length === 0) {
      await loadUsers()
    }
  }

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      // Obtener usuarios
      const {
        data: { users },
        error,
      } = await fetch("/api/admin/list-users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Error al cargar usuarios")
        return res.json()
      })

      if (error) throw error

      setUserList(users || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const filteredUsers = userList.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.user_metadata?.username || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.subject.trim()) {
      toast({
        title: "Error",
        description: "El asunto del correo es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "El contenido del correo es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (recipientType === "specific" && selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un usuario",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/admin/send-custom-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.subject,
          content: formData.content,
          recipientType,
          selectedUsers: recipientType === "specific" ? selectedUsers : [],
          includeUnsubscribed: formData.includeUnsubscribed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar los correos")
      }

      toast({
        title: "Correos enviados",
        description: `Se han enviado ${data.sentCount} correos correctamente.`,
      })

      // Resetear el formulario
      setFormData({
        subject: "",
        content: "",
        includeUnsubscribed: false,
      })
      setSelectedUsers([])
    } catch (error) {
      console.error("Error sending emails:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron enviar los correos. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al panel
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center">
              <Mail className="mr-2 h-6 w-6" />
              Envío de Correos
            </h1>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enviar correo personalizado</CardTitle>
              <CardDescription>Envía correos personalizados a los usuarios de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipientType">Destinatarios</Label>
                    <Select value={recipientType} onValueChange={handleRecipientTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona los destinatarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los usuarios</SelectItem>
                        <SelectItem value="premium">Solo usuarios premium</SelectItem>
                        <SelectItem value="free">Solo usuarios gratuitos</SelectItem>
                        <SelectItem value="specific">Usuarios específicos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recipientType === "specific" && (
                    <div className="space-y-2">
                      <Label>Seleccionar usuarios</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Buscar por email o nombre de usuario"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={loadUsers} disabled={isLoadingUsers}>
                          {isLoadingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recargar"}
                        </Button>
                      </div>

                      <div className="border rounded-md h-60 overflow-y-auto p-2">
                        {isLoadingUsers ? (
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : filteredUsers.length > 0 ? (
                          <div className="space-y-2">
                            {filteredUsers.map((user) => (
                              <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                <Checkbox
                                  id={`user-${user.id}`}
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={() => toggleUserSelection(user.id)}
                                />
                                <Label
                                  htmlFor={`user-${user.id}`}
                                  className="flex-1 cursor-pointer flex justify-between"
                                >
                                  <span>{user.email}</span>
                                  <span className="text-muted-foreground text-sm">
                                    {user.user_metadata?.username || ""}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            {userList.length === 0
                              ? "Haz clic en 'Recargar' para cargar los usuarios"
                              : "No se encontraron usuarios"}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">{selectedUsers.length} usuarios seleccionados</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Asunto del correo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Escribe el contenido del correo. Puedes usar HTML básico para dar formato."
                      rows={10}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Puedes usar HTML básico para dar formato al correo. Por ejemplo, &lt;b&gt;texto en
                      negrita&lt;/b&gt;.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeUnsubscribed"
                      checked={formData.includeUnsubscribed}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, includeUnsubscribed: checked }))}
                    />
                    <Label htmlFor="includeUnsubscribed">Incluir usuarios que han desactivado las notificaciones</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar correos
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/50 flex flex-col items-start px-6 py-4">
              <h3 className="text-sm font-medium mb-2">Consejos para el envío de correos:</h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Utiliza un asunto claro y conciso para aumentar la tasa de apertura.</li>
                <li>Evita palabras que puedan activar filtros de spam.</li>
                <li>Incluye siempre una llamada a la acción clara.</li>
                <li>Prueba el correo antes de enviarlo a todos los usuarios.</li>
                <li>Respeta las preferencias de los usuarios que han desactivado las notificaciones.</li>
              </ul>
            </CardFooter>
          </Card>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

