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
import { Loader2, ArrowLeft, Mail, Send, AlertCircle, Calendar, Code } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

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
  const [error, setError] = useState(null)
  const [accessToken, setAccessToken] = useState("")
  const [emailType, setEmailType] = useState("custom")
  const [showPreview, setShowPreview] = useState(false)
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false)

  // Obtener el token de acceso cuando el usuario inicia sesión
  useEffect(() => {
    const getAccessToken = async () => {
      if (user) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setAccessToken(data.session.access_token)
        }
      }
    }

    getAccessToken()
  }, [user])

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

  // Cargar el reto diario cuando se selecciona ese tipo de correo
  useEffect(() => {
    if (emailType === "daily_challenge") {
      loadDailyChallenge()
    }
  }, [emailType])

  // Actualizar la función loadDailyChallenge para usar la misma lógica que la página de reto diario
  const loadDailyChallenge = async () => {
    setIsLoadingChallenge(true)
    try {
      // Obtener la fecha actual
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Formatear la fecha para la consulta
      const formattedDate = today.toISOString().split("T")[0]

      console.log("Buscando reto para la fecha:", formattedDate)

      // Consultar el reto programado para hoy
      const { data, error } = await supabase
        .from("retos")
        .select("*")
        .eq("published", true)
        .filter("daily_date", "gte", formattedDate + "T00:00:00")
        .filter("daily_date", "lt", formattedDate + "T23:59:59")
        .order("daily_date", { ascending: true })
        .limit(1)

      console.log("Resultado de la consulta:", data)

      if (error) {
        console.error("Error al obtener el reto diario:", error)
        toast({
          title: "Error",
          description: "No se pudo obtener la información del reto diario",
          variant: "destructive",
        })
        return
      }

      if (data && data.length > 0) {
        const dailyReto = data[0]

        // Parsear los campos JSON si es necesario
        let examples = []
        let hints = []
        let testCases = []

        try {
          examples = typeof dailyReto.examples === "string" ? JSON.parse(dailyReto.examples) : dailyReto.examples || []
        } catch (e) {
          console.error("Error parsing examples:", e)
          examples = []
        }

        try {
          hints = typeof dailyReto.hints === "string" ? JSON.parse(dailyReto.hints) : dailyReto.hints || []
        } catch (e) {
          console.error("Error parsing hints:", e)
          hints = []
        }

        try {
          testCases =
            typeof dailyReto.testcases === "string" ? JSON.parse(dailyReto.testcases) : dailyReto.testcases || []
        } catch (e) {
          console.error("Error parsing testCases:", e)
          testCases = []
        }

        // Guardar todos los datos del reto en el estado
        const challengeData = {
          id: dailyReto.id,
          title: dailyReto.title,
          description: dailyReto.description,
          difficulty: dailyReto.difficulty,
          category: dailyReto.category,
          timeLimit: dailyReto.timelimit || 45,
          date: new Date(dailyReto.daily_date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          completions: dailyReto.completions || 0,
          successRate: dailyReto.success_rate || 0,
          initialCode: dailyReto.initialcode,
          examples: examples,
          hints: hints,
          testCases: testCases,
        }

        setDailyChallenge(challengeData)
        updateDailyChallengeTemplate(challengeData)
      } else {
        // Si no hay reto diario programado, mostrar un mensaje
        console.log("No se encontró ningún reto para hoy")
        toast({
          title: "No hay reto diario",
          description: "No hay un reto programado para hoy. Se usará una plantilla genérica.",
          variant: "destructive",
        })

        // Usar una plantilla genérica
        setFormData((prev) => ({
          ...prev,
          subject: "¡No te pierdas el reto diario de hoy en 1code1day!",
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #000000; background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; color: white; padding: 20px; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: white; padding: 10px 15px; border-radius: 8px;">
        <span style="font-weight: bold; font-size: 24px;">
          <span style="color: black;">1code</span><span style="color: #333;">1day</span>
        </span>
      </div>
    </div>
    
    <h1 style="text-align: center; font-size: 28px; margin-bottom: 20px;">¡Te esperamos en el reto diario!</h1>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hola,
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      No te pierdas el reto de programación de hoy en 1code1day. Cada día publicamos un nuevo desafío para que puedas mejorar tus habilidades de programación de forma divertida y constante.
    </p>
    
    <div style="background-color: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="font-size: 22px; margin-top: 0; margin-bottom: 15px;">¿Por qué participar?</h2>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li style="margin-bottom: 10px;">Mejora tus habilidades de programación</li>
        <li style="margin-bottom: 10px;">Resuelve problemas interesantes</li>
        <li style="margin-bottom: 10px;">Compite con otros desarrolladores</li>
        <li style="margin-bottom: 0;">Construye un hábito de programación diaria</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="https://1code1day.app/reto-diario" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">ACCEDER AL RETO DIARIO</a>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
      ¡Te esperamos!
    </p>
    
    <div style="text-align: center; font-size: 14px; color: #9ca3af; margin-top: 30px;">
      <p>© 2023 1code1day. Todos los derechos reservados.</p>
      <p>Si no deseas recibir más correos, puedes <a href="#" style="color: #60a5fa;">darte de baja</a>.</p>
    </div>
  </div>
</div>
          `,
        }))
      }
    } catch (error) {
      console.error("Error al cargar el reto diario:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del reto diario",
        variant: "destructive",
      })
    } finally {
      setIsLoadingChallenge(false)
    }
  }

  // Actualizar la función updateDailyChallengeTemplate para usar la nueva estructura de datos
  const updateDailyChallengeTemplate = (challenge) => {
    if (!challenge) return

    // Plantilla para el reto diario con la información real
    setFormData((prev) => ({
      ...prev,
      subject: `¡No te pierdas el reto de hoy: ${challenge.title}!`,
      content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #000000; background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; color: white; padding: 20px; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: white; padding: 10px 15px; border-radius: 8px;">
        <span style="font-weight: bold; font-size: 24px;">
          <span style="color: black;">1code</span><span style="color: #333;">1day</span>
        </span>
      </div>
    </div>
    
    <h1 style="text-align: center; font-size: 28px; margin-bottom: 20px;">¡Reto diario de programación!</h1>
    
    <div style="background-color: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 14px; color: #9ca3af;">${challenge.date}</span>
        <span style="font-size: 14px; background-color: ${getDifficultyColor(challenge.difficulty)}; padding: 4px 8px; border-radius: 4px;">${challenge.difficulty}</span>
      </div>
      
      <h2 style="font-size: 22px; margin-top: 0; margin-bottom: 15px;">${challenge.title}</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
        ${challenge.description}
      </p>
      
      <div style="display: inline-block; background-color: rgba(0, 0, 0, 0.2); padding: 5px 10px; border-radius: 4px; margin-bottom: 10px;">
        <span style="font-size: 14px; color: #9ca3af;">Categoría: ${challenge.category}</span>
      </div>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      ¡No te pierdas la oportunidad de resolver este interesante desafío! Cada día publicamos un nuevo reto para que puedas mejorar tus habilidades de programación de forma divertida y constante.
    </p>
    
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="https://1code1day.app/reto-diario" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">RESOLVER EL RETO</a>
    </div>
    
    <div style="background-color: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="font-size: 22px; margin-top: 0; margin-bottom: 15px;">¿Por qué participar?</h2>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li style="margin-bottom: 10px;">Mejora tus habilidades de programación</li>
        <li style="margin-bottom: 10px;">Resuelve problemas interesantes</li>
        <li style="margin-bottom: 10px;">Compite con otros desarrolladores</li>
        <li style="margin-bottom: 0;">Construye un hábito de programación diaria</li>
      </ul>
    </div>
    
    <div style="text-align: center; font-size: 14px; color: #9ca3af; margin-top: 30px;">
      <p>© 2023 1code1day. Todos los derechos reservados.</p>
      <p>Si no deseas recibir más correos, puedes <a href="#" style="color: #60a5fa;">darte de baja</a>.</p>
    </div>
  </div>
</div>
      `,
    }))
  }

  // Función para obtener el color según la dificultad
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "fácil":
      case "facil":
      case "easy":
        return "#10b981" // verde
      case "intermedio":
      case "medium":
        return "#f59e0b" // amarillo
      case "difícil":
      case "dificil":
      case "hard":
        return "#ef4444" // rojo
      default:
        return "#6366f1" // indigo (por defecto)
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
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailTypeChange = (value) => {
    setEmailType(value)

    if (value === "daily_challenge") {
      // La plantilla se actualizará cuando se cargue el reto diario
      if (!dailyChallenge) {
        // Si aún no se ha cargado el reto diario, mostrar una plantilla genérica
        setFormData((prev) => ({
          ...prev,
          subject: "¡No te pierdas el reto diario de hoy en 1code1day!",
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #000000; background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; color: white; padding: 20px; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; background-color: white; padding: 10px 15px; border-radius: 8px;">
        <span style="font-weight: bold; font-size: 24px;">
          <span style="color: black;">1code</span><span style="color: #333;">1day</span>
        </span>
      </div>
    </div>
    
    <h1 style="text-align: center; font-size: 28px; margin-bottom: 20px;">¡Te esperamos en el reto diario!</h1>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hola,
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      No te pierdas el reto de programación de hoy en 1code1day. Cada día publicamos un nuevo desafío para que puedas mejorar tus habilidades de programación de forma divertida y constante.
    </p>
    
    <div style="background-color: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="font-size: 22px; margin-top: 0; margin-bottom: 15px;">¿Por qué participar?</h2>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li style="margin-bottom: 10px;">Mejora tus habilidades de programación</li>
        <li style="margin-bottom: 10px;">Resuelve problemas interesantes</li>
        <li style="margin-bottom: 10px;">Compite con otros desarrolladores</li>
        <li style="margin-bottom: 0;">Construye un hábito de programación diaria</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="https://1code1day.app/reto-diario" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">ACCEDER AL RETO DIARIO</a>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
      ¡Te esperamos!
    </p>
    
    <div style="text-align: center; font-size: 14px; color: #9ca3af; margin-top: 30px;">
      <p>© 2023 1code1day. Todos los derechos reservados.</p>
      <p>Si no deseas recibir más correos, puedes <a href="#" style="color: #60a5fa;">darte de baja</a>.</p>
    </div>
  </div>
</div>
          `,
        }))
      }
    } else if (value === "custom") {
      // Resetear a valores vacíos para correo personalizado
      setFormData((prev) => ({
        ...prev,
        subject: "",
        content: "",
      }))
    }
  }

  const handleRecipientTypeChange = async (value) => {
    setRecipientType(value)

    if (value === "specific" && userList.length === 0) {
      await loadUsers()
    }
  }

  const loadUsers = async () => {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "No se pudo obtener el token de acceso. Intenta recargar la página.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingUsers(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/list-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: accessToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar usuarios")
      }

      setUserList(data.data?.users || [])
    } catch (error) {
      console.error("Error loading users:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los usuarios. Intenta de nuevo.",
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

    if (!accessToken) {
      toast({
        title: "Error",
        description: "No se pudo obtener el token de acceso. Intenta recargar la página.",
        variant: "destructive",
      })
      return
    }

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
    setError(null)

    try {
      const response = await fetch("/api/admin/send-custom-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: accessToken,
          subject: formData.subject,
          content: formData.content,
          recipientType,
          selectedUsers: recipientType === "specific" ? selectedUsers : [],
          includeUnsubscribed: formData.includeUnsubscribed,
          includeDailyChallenge: emailType === "daily_challenge",
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
      setEmailType("custom")
    } catch (error) {
      console.error("Error sending emails:", error)
      setError(error.message)
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

          {error && (
            <Card className="mb-4 border-red-300 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-300">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    <p className="text-xs mt-2 text-red-600 dark:text-red-400">
                      Si el error persiste, intenta ir a la página de{" "}
                      <Link href="/admin/debug" className="underline">
                        depuración
                      </Link>{" "}
                      para verificar tu estado de administrador.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enviar correo personalizado</CardTitle>
              <CardDescription>Envía correos personalizados a los usuarios de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emailType">Tipo de correo</Label>
                    <Select value={emailType} onValueChange={handleEmailTypeChange}>
                      <SelectTrigger id="emailType">
                        <SelectValue placeholder="Selecciona el tipo de correo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Personalizado</SelectItem>
                        <SelectItem value="daily_challenge">Invitación al reto diario</SelectItem>
                      </SelectContent>
                    </Select>
                    {emailType === "daily_challenge" && isLoadingChallenge && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        Cargando información del reto diario...
                      </div>
                    )}
                    {emailType === "daily_challenge" && dailyChallenge && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <div className="flex items-center text-sm">
                          <Code className="h-3 w-3 mr-2" />
                          <span className="font-medium">Reto cargado:</span>
                          <span className="ml-2">{dailyChallenge.title}</span>
                        </div>
                      </div>
                    )}
                  </div>

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
                      className="font-mono text-sm"
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

                <div className="flex flex-col space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full"
                  >
                    {showPreview ? "Ocultar vista previa" : "Ver vista previa del correo"}
                  </Button>

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
                </div>
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

          {showPreview && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Vista previa del correo
                </CardTitle>
                <CardDescription>Así es como se verá el correo para los destinatarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4">
                  <h3 className="font-bold mb-4">{formData.subject || "Sin asunto"}</h3>
                  <div className="border-t pt-4">
                    {formData.content ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                    ) : (
                      <p className="text-muted-foreground italic">Sin contenido</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

