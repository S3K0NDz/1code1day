"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  Edit,
  Flame,
  Github,
  Linkedin,
  Loader2,
  Trophy,
  Twitter,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { addDays, eachDayOfInterval, format, isSameDay, isWithinInterval, startOfWeek, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { getUserCompletedChallenges } from "@/lib/db-functions"
import { supabase } from "@/lib/supabase"
import NavbarWithUser from "@/components/navbar-with-user"

// Reemplazar la definición de la función PerfilPage para incluir la obtención de datos reales
export default function PerfilPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [userStats, setUserStats] = useState({
    completedChallenges: 0,
    streak: 0,
    level: 0,
    weeklyActivity: [] as { date: Date; day: string; count: number }[],
    monthlyActivity: [] as { date: Date; day: string; count: number }[],
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Obtener estadísticas reales del usuario
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return

      try {
        setLoadingStats(true)

        // Obtener retos completados
        const completedResult = await getUserCompletedChallenges(user.id)
        const completedChallenges = completedResult.success ? completedResult.data : []
        const completedCount = completedChallenges.length

        // Calcular la actividad mensual (últimos 14 días)
        const today = new Date()
        const twoWeeksAgo = subDays(today, 13) // Para tener 14 días en total (hoy incluido)

        // Crear array con los días del intervalo
        const daysInterval = eachDayOfInterval({ start: twoWeeksAgo, end: today })

        // Preparar array para la actividad mensual
        const monthlyActivity = daysInterval.map((date) => ({
          date,
          day: format(date, "dd MMM", { locale: es }),
          count: 0,
        }))

        // Contar retos completados por día
        completedChallenges.forEach((challenge) => {
          if (!challenge.completed_at) return

          const completedDate = new Date(challenge.completed_at)
          const dayIndex = monthlyActivity.findIndex((day) => isSameDay(day.date, completedDate))

          if (dayIndex !== -1) {
            monthlyActivity[dayIndex].count++
          }
        })

        // Calcular la actividad semanal
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Lunes como inicio de semana

        // Crear array con los 7 días de la semana
        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const day = addDays(startOfCurrentWeek, i)
          return {
            date: day,
            day: format(day, "EEE", { locale: es }).substring(0, 3), // Abreviatura de 3 letras
            count: 0,
          }
        })

        // Contar retos completados por día
        completedChallenges.forEach((challenge) => {
          if (!challenge.completed_at) return

          const completedDate = new Date(challenge.completed_at)
          // Verificar si la fecha está en la semana actual
          if (
            isWithinInterval(completedDate, {
              start: startOfCurrentWeek,
              end: addDays(startOfCurrentWeek, 6),
            })
          ) {
            // Calcular el índice del día en la semana (0 = lunes, 6 = domingo)
            const dayIndex = Math.floor(
              (completedDate.getTime() - startOfCurrentWeek.getTime()) / (1000 * 60 * 60 * 24),
            )
            if (dayIndex >= 0 && dayIndex < 7) {
              weekDays[dayIndex].count++
            }
          }
        })

        // Calcular la racha actual (streak)
        let streak = 0
        let currentStreak = 0

        // Ordenar los retos completados por fecha (más reciente primero)
        const sortedChallenges = [...completedChallenges].sort(
          (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
        )

        if (sortedChallenges.length > 0) {
          // Verificar si el usuario completó un reto hoy
          const lastCompletionDate = new Date(sortedChallenges[0].completed_at)
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const yesterdayStart = new Date(todayStart)
          yesterdayStart.setDate(yesterdayStart.getDate() - 1)

          // Comprobar si el último reto fue completado hoy o ayer
          const completedToday = lastCompletionDate >= todayStart
          const completedYesterday =
            !completedToday && lastCompletionDate >= yesterdayStart && lastCompletionDate < todayStart

          if (completedToday) {
            currentStreak = 1 // Empezar la racha con el día de hoy

            // Crear un mapa de fechas en las que se completaron retos
            const completionDates = new Map()
            sortedChallenges.forEach((challenge) => {
              const date = new Date(challenge.completed_at)
              const dateString = format(date, "yyyy-MM-dd")
              completionDates.set(dateString, true)
            })

            // Verificar días consecutivos hacia atrás
            let checkDate = subDays(todayStart, 1) // Empezar desde ayer

            while (true) {
              const dateString = format(checkDate, "yyyy-MM-dd")
              if (completionDates.has(dateString)) {
                currentStreak++
                checkDate = subDays(checkDate, 1)
              } else {
                break // Romper la racha si no hay actividad en un día
              }
            }
          } else if (completedYesterday) {
            // Si el último reto fue ayer, verificar días consecutivos hacia atrás
            currentStreak = 1 // Empezar la racha con ayer

            // Crear un mapa de fechas en las que se completaron retos
            const completionDates = new Map()
            sortedChallenges.forEach((challenge) => {
              const date = new Date(challenge.completed_at)
              const dateString = format(date, "yyyy-MM-dd")
              completionDates.set(dateString, true)
            })

            // Verificar días consecutivos hacia atrás
            let checkDate = subDays(yesterdayStart, 1) // Empezar desde anteayer

            while (true) {
              const dateString = format(checkDate, "yyyy-MM-dd")
              if (completionDates.has(dateString)) {
                currentStreak++
                checkDate = subDays(checkDate, 1)
              } else {
                break // Romper la racha si no hay actividad en un día
              }
            }
          }
          // Si no completó un reto hoy ni ayer, la racha es 0
        }

        streak = currentStreak

        // Actualizar la racha en la base de datos si es necesario
        try {
          const { data: existingStats } = await supabase
            .from("user_stats")
            .select("id, streak")
            .eq("user_id", user.id)
            .maybeSingle()

          if (existingStats) {
            // Actualizar solo si la racha ha cambiado
            if (existingStats.streak !== streak) {
              await supabase.from("user_stats").update({ streak }).eq("id", existingStats.id)
            }
          } else {
            // Crear un nuevo registro de estadísticas
            await supabase.from("user_stats").insert({
              user_id: user.id,
              streak,
              level: Math.floor(completedCount / 5) + 1,
            })
          }
        } catch (error) {
          console.error("Error updating streak:", error)
        }

        // Calcular nivel basado en retos completados
        const level = Math.floor(completedCount / 5) + 1

        setUserStats({
          completedChallenges: completedCount,
          streak,
          level,
          weeklyActivity: weekDays,
          monthlyActivity,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
        // Establecer datos predeterminados en caso de error
        const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
        const defaultWeekDays = Array.from({ length: 7 }, (_, i) => ({
          date: addDays(startOfCurrentWeek, i),
          day: format(addDays(startOfCurrentWeek, i), "EEE", { locale: es }).substring(0, 3),
          count: 0,
        }))

        setUserStats({
          completedChallenges: 0,
          streak: 0,
          level: 0,
          weeklyActivity: defaultWeekDays,
          monthlyActivity: [],
        })
      } finally {
        setLoadingStats(false)
      }
    }

    fetchUserStats()
  }, [user])

  if (isLoading || loadingStats) {
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

  // Obtener datos del perfil de los metadatos de usuario
  const avatarUrl = user.user_metadata?.avatar_url || "/placeholder-user.jpg"
  const username =
    user.user_metadata?.user_name || user.user_metadata?.username || user.email?.split("@")[0] || "usuario"
  const fullName =
    user.user_metadata?.full_name ||
    `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
    username
  const email = user.email || ""
  const createdAt = user.created_at ? new Date(user.created_at) : new Date()
  const memberSince = createdAt.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  const userProfile = {
    username,
    fullName,
    email,
    memberSince,
    isPro: user.user_metadata?.is_pro || false,
    completedChallenges: userStats.completedChallenges,
    streak: userStats.streak,
    level: userStats.level,
    github: user.user_metadata?.user_name || user.user_metadata?.github || "",
    twitter: user.user_metadata?.twitter || "",
    linkedin: user.user_metadata?.linkedin || "",
    bio: user.user_metadata?.bio || "Desarrollador apasionado por mejorar mis habilidades de programación día a día.",
  }

  // Calcular el total de retos completados en los últimos 14 días
  const totalRecentChallenges = userStats.monthlyActivity.reduce((sum, day) => sum + day.count, 0)

  // Encontrar el valor máximo para escalar el gráfico
  const maxCount = Math.max(...userStats.monthlyActivity.map((day) => day.count), 1)

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Cabecera de estilo editor de código */}
          <div className="bg-[#1e1e1e] border border-[#333] rounded-t-lg mb-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
              <div className="flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-sm text-gray-400 font-mono">perfil.tsx</span>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/perfil/editar">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar perfil
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6 bg-[#1e1e1e]">
              <div className="bg-[#252526] border border-[#333] rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar className="h-24 w-24 border-4 border-[#1e1e1e] mb-4">
                      <AvatarImage src={avatarUrl} alt={`@${userProfile.username}`} />
                      <AvatarFallback className="text-3xl bg-[#333]">
                        {userProfile.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex gap-2 mt-2">
                      {userProfile.github && (
                        <a
                          href={`https://github.com/${userProfile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {userProfile.twitter && (
                        <a
                          href={`https://twitter.com/${userProfile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {userProfile.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${userProfile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-white">{userProfile.fullName}</h1>
                      {userProfile.isPro && (
                        <Badge className="w-fit bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          Pro
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-400 mb-2">
                      @{userProfile.username} • {userProfile.email}
                    </p>

                    <p className="text-gray-400 mb-4 flex items-center justify-center md:justify-start gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Miembro desde {userProfile.memberSince}</span>
                    </p>

                    <p className="text-sm mb-4 text-gray-300">{userProfile.bio}</p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <Link href="/perfil/retos">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 hover:bg-[#333] cursor-pointer border-[#444] text-gray-300"
                        >
                          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                          <span>{loadingStats ? "..." : userProfile.completedChallenges} retos completados</span>
                        </Badge>
                      </Link>
                      <Link href="/perfil/estadisticas">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 hover:bg-[#333] cursor-pointer border-[#444] text-gray-300"
                        >
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          <span>Racha: {loadingStats ? "..." : userProfile.streak} días</span>
                        </Badge>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/perfil/retos" className="block">
                  <Card className="bg-[#252526] border-[#333] hover:border-primary transition-colors duration-200">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Retos completados</p>
                        <p className="text-2xl font-bold text-white">
                          {loadingStats ? "..." : userProfile.completedChallenges}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/perfil/estadisticas" className="block">
                  <Card className="bg-[#252526] border-[#333] hover:border-primary transition-colors duration-200">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Flame className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Racha actual</p>
                        <p className="text-2xl font-bold text-white">
                          {loadingStats ? "..." : userProfile.streak} días
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              <div className="mb-8">
                <Card className="bg-[#252526] border-[#333]">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-lg font-medium flex items-center gap-2 text-white">
                        <BarChart2 className="h-5 w-5 text-blue-400" />
                        Retos completados (últimos 14 días)
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 md:mt-0">
                        Total: <span className="font-medium text-white">{totalRecentChallenges} retos</span>
                      </p>
                    </div>

                    {userStats.monthlyActivity.length > 0 ? (
                      <div className="mt-8 h-72 relative">
                        {/* Líneas de cuadrícula horizontales */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {Array.from({ length: 5 }, (_, i) => {
                            const value = Math.ceil((maxCount / 4) * (4 - i))
                            return (
                              <div key={i} className="w-full border-t border-[#333] flex items-center h-0">
                                <span className="text-xs text-gray-500 mr-2 -mt-2">{value}</span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Gráfico de barras mejorado */}
                        <div className="absolute inset-0 pt-6 pl-8 flex items-end">
                          <div className="w-full h-[calc(100%-40px)] flex items-end">
                            {userStats.monthlyActivity.map((day, index) => {
                              const isToday = isSameDay(day.date, new Date())
                              const barHeight = day.count > 0 ? (day.count / maxCount) * 100 : 0
                              const dayName = format(day.date, "EEE", { locale: es })
                              const dayNumber = format(day.date, "d")

                              return (
                                <div
                                  key={index}
                                  className="flex flex-col items-center group"
                                  style={{ width: `${100 / userStats.monthlyActivity.length}%` }}
                                >
                                  {/* Tooltip al pasar el cursor */}
                                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    <div className="bg-[#333] text-white text-xs rounded-md shadow-md p-2 transform -translate-x-1/2">
                                      <p className="font-medium">{format(day.date, "d 'de' MMMM", { locale: es })}</p>
                                      <p>
                                        {day.count} {day.count === 1 ? "reto" : "retos"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Barra con animación y estilo mejorado */}
                                  <div
                                    className={`w-[60%] rounded-t-md transition-all duration-500 ease-out ${
                                      isToday
                                        ? "bg-gradient-to-t from-blue-600 to-blue-400"
                                        : "bg-gradient-to-t from-primary to-primary/80"
                                    } relative group-hover:w-[80%]`}
                                    style={{
                                      height: `${barHeight}%`,
                                      minHeight: day.count ? "4px" : "0",
                                      boxShadow: day.count ? "0 3px 10px rgba(0,0,0,0.3)" : "none",
                                    }}
                                  >
                                    {/* Número de retos encima de la barra */}
                                    {day.count > 0 && (
                                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-300">
                                        {day.count}
                                      </div>
                                    )}
                                  </div>

                                  {/* Fecha debajo de la barra */}
                                  <div
                                    className={`text-xs mt-2 flex flex-col items-center ${
                                      isToday ? "font-medium text-blue-400" : "text-gray-500"
                                    }`}
                                  >
                                    <span className="uppercase">{dayName}</span>
                                    <span>{dayNumber}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No hay actividad reciente</p>
                        <Link href="/retos">
                          <Button variant="outline" className="mt-4 border-[#444] text-gray-300 hover:bg-[#333]">
                            Explorar retos
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

