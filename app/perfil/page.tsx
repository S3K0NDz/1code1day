"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Loader2,
  Github,
  Twitter,
  Linkedin,
  Edit,
  Code,
  Trophy,
  Calendar,
  Flame,
  BarChart,
  CheckCircle2,
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

export default function PerfilPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando perfil...</p>
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  if (!user) {
    return null
  }

  const username = user.user_metadata?.username || user.email?.split("@")[0] || "usuario"
  const fullName = `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() || username
  const email = user.email || ""
  const createdAt = user.created_at ? new Date(user.created_at) : new Date()
  const memberSince = createdAt.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  const userProfile = {
    username,
    fullName,
    email,
    memberSince,
    isPro: user.user_metadata?.is_pro || false,
    completedChallenges: user.user_metadata?.completed_challenges || 0,
    streak: user.user_metadata?.streak || 7, // Añadir racha
    level: user.user_metadata?.level || 12, // Añadir nivel
    github: user.user_metadata?.github || "",
    twitter: user.user_metadata?.twitter || "",
    linkedin: user.user_metadata?.linkedin || "",
    bio: user.user_metadata?.bio || "Desarrollador apasionado por mejorar mis habilidades de programación día a día.",
  }

  // Datos simplificados para la actividad reciente
  const recentActivity = [
    {
      title: "Invertir palabras en una cadena",
      date: "Hace 2 días",
      type: "challenge",
    },
    {
      title: "Encontrar el número ausente",
      date: "Hace 5 días",
      type: "challenge",
    },
    {
      title: "Detectar palíndromos",
      date: "Hace 1 semana",
      type: "challenge",
    },
  ]

  // Añadir datos para la gráfica de actividad
  const activityData = [
    { day: "Lun", count: 2 },
    { day: "Mar", count: 1 },
    { day: "Mié", count: 3 },
    { day: "Jue", count: 0 },
    { day: "Vie", count: 2 },
    { day: "Sáb", count: 1 },
    { day: "Dom", count: 2 },
  ]

  // Añadir datos de retos por dificultad
  const challengesByDifficulty = [
    { name: "Fácil", completed: 18, total: 25, color: "bg-green-500" },
    { name: "Intermedio", completed: 12, total: 25, color: "bg-yellow-500" },
    { name: "Difícil", completed: 5, total: 25, color: "bg-red-500" },
  ]

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-card/30 border border-border rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 border-4 border-background mb-4">
                  <AvatarImage src="/placeholder-user.jpg" alt={`@${userProfile.username}`} />
                  <AvatarFallback className="text-3xl">
                    {userProfile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex gap-2 mt-2">
                  {userProfile.github && (
                    <a
                      href={`https://github.com/${userProfile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {userProfile.twitter && (
                    <a
                      href={`https://twitter.com/${userProfile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {userProfile.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${userProfile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{userProfile.fullName}</h1>
                  {userProfile.isPro && <Badge className="w-fit">Pro</Badge>}
                </div>

                <p className="text-muted-foreground mb-2">
                  @{userProfile.username} • {userProfile.email}
                </p>

                <p className="text-muted-foreground mb-4 flex items-center justify-center md:justify-start gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde {userProfile.memberSince}</span>
                </p>

                <p className="text-sm mb-4">{userProfile.bio}</p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{userProfile.completedChallenges} retos completados</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Racha: {userProfile.streak} días</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Nivel: {userProfile.level}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Editar perfil
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/30 border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Racha actual</p>
                  <p className="text-2xl font-bold">{userProfile.streak} días</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nivel actual</p>
                  <p className="text-2xl font-bold">{userProfile.level}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retos completados</p>
                  <p className="text-2xl font-bold">{userProfile.completedChallenges}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card/30 border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Actividad semanal
                </h3>
                <div className="flex items-end h-40 gap-2 mt-6">
                  {activityData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-primary/80 rounded-t-sm"
                        style={{
                          height: `${(item.count / 3) * 100}%`,
                          minHeight: item.count ? "10%" : "0",
                        }}
                      ></div>
                      <span className="text-xs mt-2 text-muted-foreground">{item.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Retos por dificultad
                </h3>
                <div className="space-y-4">
                  {challengesByDifficulty.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm">
                          {item.completed}/{item.total}
                        </span>
                      </div>
                      <Progress value={(item.completed / item.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Actividad reciente</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <Card key={index} className="bg-card/30">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Code className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="text-center mt-4">
                  <Button variant="outline">Ver más actividad</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-card/30 border border-border rounded-lg">
                <p className="text-muted-foreground">Aún no has completado ningún reto</p>
                <Link href="/reto-diario">
                  <Button className="mt-4">Comenzar primer reto</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

