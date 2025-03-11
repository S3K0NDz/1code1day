"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Clock, Calendar, ArrowLeft, Medal, Users, Star } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export default function RankingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [rankings, setRankings] = useState<any[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [timeFrame, setTimeFrame] = useState("daily")
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchDailyChallenge()
  }, [])

  useEffect(() => {
    if (dailyChallenge) {
      fetchRankings()
    }
  }, [dailyChallenge, timeFrame])

  // Obtener el reto diario más reciente
  const fetchDailyChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from("retos")
        .select("*")
        .eq("published", true)
        .lte("daily_date", new Date().toISOString())
        .order("daily_date", { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        console.log("Reto diario encontrado:", data[0])
        setDailyChallenge(data[0])
      } else {
        console.log("No se encontró ningún reto diario")
      }
    } catch (error) {
      console.error("Error al cargar el reto diario:", error)
    }
  }

  // Obtener el ranking de usuarios que han completado el reto
  const fetchRankings = async () => {
    setIsLoading(true)
    try {
      // Paso 1: Obtener el ID del reto diario más reciente
      const { data: retoData, error: retoError } = await supabase
        .from("retos")
        .select("id")
        .eq("published", true)
        .lte("daily_date", new Date().toISOString())
        .order("daily_date", { ascending: false })
        .limit(1)

      if (retoError) {
        console.error("Error al obtener el reto diario:", retoError)
        throw retoError
      }

      if (!retoData || retoData.length === 0) {
        console.log("No se encontró ningún reto diario")
        setRankings([])
        setIsLoading(false)
        return
      }

      const retoId = retoData[0].id
      console.log("ID del reto encontrado:", retoId)

      // Paso 2: Obtener todos los usuarios que han completado el reto
      const { data: rankingData, error: rankingError } = await supabase
        .from("user_challenges")
        .select(`
          user_id,
          execution_time,
          completed_at
        `)
        .eq("challenge_id", retoId)
        .not("execution_time", "is", null)
        .order("execution_time", { ascending: false }) // Ordenar por tiempo de ejecución (tiempo restante)

      if (rankingError) {
        console.error("Error al obtener user_challenges:", rankingError)
        throw rankingError
      }

      console.log("Usuarios encontrados:", rankingData?.length || 0)

      if (rankingData && rankingData.length > 0) {
        // Obtener los perfiles de los usuarios
        await fetchUserProfiles(rankingData)
      } else {
        console.log("No hay usuarios que hayan completado el reto.")
        setRankings([])
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error al cargar el ranking:", error)
      setRankings([])
      setIsLoading(false)
    }
  }

  // Obtener los perfiles de los usuarios
  const fetchUserProfiles = async (rankingData: any[]) => {
    try {
      if (!rankingData || rankingData.length === 0) {
        console.log("No hay datos de ranking para procesar perfiles.")
        setRankings([])
        setIsLoading(false)
        return
      }

      const userIds = [...new Set(rankingData.map((item) => item.user_id))] // Eliminar duplicados
      console.log("Obteniendo perfiles para los usuarios únicos:", userIds)

      // Obtener perfiles de la tabla profiles con todos los campos
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds)

      if (profilesError) {
        console.error("Error al obtener perfiles:", profilesError)
        setRankings(rankingData) // Continuar con los datos sin perfiles
      } else {
        console.log("Perfiles obtenidos:", profilesData?.length)

        // Combinar datos asegurándonos de no perder registros
        const combinedData = rankingData.map((rankingItem) => {
          const profile = profilesData?.find((p) => p.id === rankingItem.user_id) || {}

          // Calcular tiempo usado (tiempo total - tiempo restante)
          const timeLimit = dailyChallenge?.timelimit || 45
          const timeUsed = timeLimit * 60 - rankingItem.execution_time

          return {
            ...rankingItem,
            profile,
            timeUsed, // Añadir el tiempo usado para ordenar correctamente
          }
        })

        // Ordenar por tiempo usado (menor a mayor)
        combinedData.sort((a, b) => a.timeUsed - b.timeUsed)

        console.log("Datos combinados finales:", combinedData.length, "registros")
        setRankings(combinedData)
      }
    } catch (error) {
      console.error("Error al obtener perfiles:", error)
      setRankings(rankingData) // Usar datos sin perfiles en caso de error
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (executionTime: number, totalTime?: number) => {
    if (!executionTime) return "N/A"

    // Si tenemos el tiempo total, calculamos el tiempo usado
    if (totalTime) {
      // Convertir totalTime de minutos a segundos
      const totalTimeInSeconds = totalTime * 60
      // Calcular tiempo usado (total - restante)
      const timeUsed = totalTimeInSeconds - executionTime

      // Formatear el tiempo usado
      const mins = Math.floor(timeUsed / 60)
      const secs = Math.floor(timeUsed % 60)
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Si no tenemos tiempo total, mostramos el tiempo de ejecución directamente
    const mins = Math.floor(executionTime / 60)
    const secs = Math.floor(executionTime % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es })
    } catch (e) {
      return dateString
    }
  }

  const getPositionStyle = (position: number) => {
    if (position === 0) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
    if (position === 1) return "bg-gray-300/20 text-gray-300 border-gray-300/20"
    if (position === 2) return "bg-amber-600/20 text-amber-600 border-amber-600/20"
    return "bg-blue-500/20 text-blue-500 border-blue-500/20"
  }

  const getPositionIcon = (position: number) => {
    if (position === 0) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (position === 1) return <Trophy className="h-4 w-4 text-gray-300" />
    if (position === 2) return <Trophy className="h-4 w-4 text-amber-600" />
    return <Medal className="h-4 w-4" />
  }

  const getUserRank = () => {
    if (!user) return -1
    return rankings.findIndex((item) => item.user_id === user.id)
  }

  const userRank = getUserRank()

  // Función para obtener el nombre de usuario, priorizando el campo username
  const getDisplayName = (item: any) => {
    const profile = item.profile || {}

    // Priorizar username si existe
    if (profile.username) return profile.username

    // Luego intentar con nombre completo
    if (profile.full_name) return profile.full_name

    // Luego intentar con email (solo la parte antes de @)
    if (profile.email) return profile.email.split("@")[0]

    // Si hay user_id, mostrar una parte
    if (item.user_id) {
      // Formatear el ID para que sea más legible
      const shortId = item.user_id.substring(0, 8)
      return `Usuario ${shortId}`
    }

    // Último recurso
    return "Usuario"
  }

  const getAvatarUrl = (item: any) => {
    const profile = item.profile || {}
    return profile.avatar_url || "/placeholder-user.jpg"
  }

  const getEmail = (item: any) => {
    const profile = item.profile || {}
    return profile.email || ""
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex flex-col">
        <NavbarWithUser />
        <main className="container mx-auto px-4 py-6 flex-1">
          <div className="flex flex-col gap-6">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push("/reto-diario")} className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Ranking del Reto Diario
                </h1>
              </div>

              <Tabs defaultValue="daily" className="w-full md:w-auto" value={timeFrame} onValueChange={setTimeFrame}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">Hoy</TabsTrigger>
                  <TabsTrigger value="weekly">Semanal</TabsTrigger>
                  <TabsTrigger value="monthly">Mensual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Información del reto */}
            {dailyChallenge ? (
              <div className="bg-black/20 border border-border/40 rounded-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{dailyChallenge.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>{format(new Date(dailyChallenge.daily_date), "dd MMMM yyyy", { locale: es })}</span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>{dailyChallenge.timelimit || 45} minutos</span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5" />
                        <span>{rankings.length} participantes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className={getDifficultyColor(dailyChallenge.difficulty)}>{dailyChallenge.difficulty}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 border border-border/40 rounded-lg p-4 md:p-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            )}

            {/* Tabla de ranking */}
            <div className="bg-black/20 border border-border/40 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40 bg-black/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                        Pos.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tiempo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Completado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={`loading-${index}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Skeleton className="h-6 w-6" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </td>
                          </tr>
                        ))
                    ) : rankings.length > 0 ? (
                      rankings.map((item, index) => {
                        const displayName = getDisplayName(item)
                        const isCurrentUser = user && item.user_id === user.id

                        return (
                          <tr
                            key={`${item.user_id}-${index}`}
                            className={`${isCurrentUser ? "bg-primary/10" : index % 2 === 0 ? "bg-black/10" : ""}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <Badge
                                  className={`${getPositionStyle(index)} flex items-center justify-center w-8 h-8 rounded-full p-0`}
                                >
                                  {getPositionIcon(index)}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarImage src={getAvatarUrl(item)} alt={displayName} />
                                  <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {displayName}
                                    {isCurrentUser && <span className="ml-2 text-xs text-primary">(Tú)</span>}
                                  </span>
                                  <span className="text-xs text-muted-foreground hidden sm:inline">
                                    {getEmail(item)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                <span className="font-mono">
                                  {formatTime(item.execution_time, dailyChallenge?.timelimit)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground hidden md:table-cell">
                              {formatDate(item.completed_at)}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Trophy className="h-8 w-8 text-muted-foreground/50" />
                            <p>Aún no hay participantes en el ranking</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push("/reto-diario")}
                              className="mt-2"
                            >
                              Participar en el reto
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tu posición */}
            {!isLoading && rankings.length > 0 && userRank !== -1 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-medium">Tu posición en el ranking:</span>
                    <Badge className="bg-primary/20 text-primary border-primary/20 text-sm px-3">
                      #{userRank + 1} de {rankings.length}
                    </Badge>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tiempo:</span>
                    <span className="font-mono font-medium">
                      {formatTime(rankings[userRank]?.execution_time, dailyChallenge?.timelimit)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

function getDifficultyColor(difficulty: string) {
  const lowerDifficulty = typeof difficulty === "string" ? difficulty.toLowerCase() : ""
  if (lowerDifficulty.includes("fácil") || lowerDifficulty.includes("facil")) {
    return "bg-green-500 text-white"
  } else if (lowerDifficulty.includes("intermedio") || lowerDifficulty.includes("medio")) {
    return "bg-orange-500 text-white"
  } else if (lowerDifficulty.includes("difícil") || lowerDifficulty.includes("dificil")) {
    return "bg-red-500 text-white"
  } else {
    return "bg-blue-500 text-white"
  }
}

