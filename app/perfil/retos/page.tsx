"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Trophy, Search, Filter, Code, Calendar, ArrowLeft, Lock } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
// Importar las funciones de la base de datos
import { getUserCompletedChallenges, getUserSavedChallenges } from "@/lib/db-functions"
import { supabase } from "@/lib/supabase"

export default function MisRetosPage() {
  const { user, isLoading, isPro } = useAuth()
  const router = useRouter()
  const [challenges, setChallenges] = useState<any[]>([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTab, setSelectedTab] = useState("saved")
  // Añadir estado para almacenar los retos gratuitos
  const [freeAccessChallenges, setFreeAccessChallenges] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Cargar los IDs de retos gratuitos
  useEffect(() => {
    const fetchFreeAccessChallenges = async () => {
      try {
        // En producción, esto vendría de un campo en la base de datos
        // Por ahora, usaremos una lógica simple: los retos con ID divisible por 5 son gratuitos
        const { data, error } = await supabase.from("retos").select("id, free_access")

        if (error) throw error

        // Filtrar los retos que tienen free_access = true o ID divisible por 5
        const freeIds = data
          .filter((reto) => reto.free_access === true || Number.parseInt(reto.id) % 5 === 0)
          .map((reto) => reto.id)

        setFreeAccessChallenges(freeIds)
      } catch (error) {
        console.error("Error al cargar retos gratuitos:", error)
      }
    }

    fetchFreeAccessChallenges()
  }, [])

  // Añadir verificación para usuarios premium cuando se intenta ver todos los retos completados
  useEffect(() => {
    if (!isLoading && selectedTab === "all" && !isPro) {
      toast({
        title: "Contenido Premium",
        description: "El historial completo de retos está disponible solo para usuarios Premium.",
        action: (
          <Button variant="default" size="sm" onClick={() => router.push("/planes")}>
            Ver planes
          </Button>
        ),
      })
      setSelectedTab("saved")
    }
  }, [selectedTab, isPro, isLoading, router])

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return

      try {
        setLoadingChallenges(true)

        let result
        if (selectedTab === "saved") {
          result = await getUserSavedChallenges(user.id)
        } else {
          result = await getUserCompletedChallenges(user.id)
        }

        if (!result.success) {
          throw new Error("Error al cargar los retos")
        }

        // Añadir la propiedad isFreeAccess a cada reto
        const challengesWithAccessInfo = result.data.map((challenge) => ({
          ...challenge,
          isFreeAccess: freeAccessChallenges.includes(challenge.challenge_id),
        }))

        setChallenges(challengesWithAccessInfo || [])
      } catch (error) {
        console.error("Error al cargar retos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar tus retos. Intenta más tarde.",
          variant: "destructive",
        })
      } finally {
        setLoadingChallenges(false)
      }
    }

    fetchChallenges()
  }, [user, selectedTab, freeAccessChallenges])

  const filteredChallenges = challenges.filter((challenge) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      challenge.retos?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.retos?.description?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por dificultad
    const matchesDifficulty =
      selectedDifficulty === "all" || challenge.retos?.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()

    // Filtrar por categoría
    const matchesCategory =
      selectedCategory === "all" || challenge.retos?.category?.toLowerCase().includes(selectedCategory.toLowerCase())

    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "fácil":
      case "facil":
        return "bg-green-500/20 text-green-500"
      case "intermedio":
        return "bg-yellow-500/20 text-yellow-500"
      case "difícil":
      case "dificil":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-blue-500/20 text-blue-500"
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
    return null // Redirección manejada en el useEffect
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link href="/perfil">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al perfil
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Mis Retos</h1>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="saved">Guardados</TabsTrigger>
              <TabsTrigger value="all" disabled={!isPro}>
                {!isPro ? (
                  <div className="flex items-center">
                    Todos los completados
                    <Badge variant="outline" className="ml-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                      Premium
                    </Badge>
                  </div>
                ) : (
                  "Todos los completados"
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar retos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loadingChallenges ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge, index) => (
                <Link
                  href={isPro || challenge.isFreeAccess ? `/retos/${challenge.retos?.id}` : "/planes"}
                  key={index}
                  onClick={(e) => {
                    if (!isPro && !challenge.isFreeAccess) {
                      e.preventDefault()
                      toast({
                        title: "Contenido Premium",
                        description: "Este reto solo está disponible para usuarios Premium.",
                        action: (
                          <Button variant="default" size="sm" onClick={() => router.push("/planes")}>
                            Ver planes
                          </Button>
                        ),
                      })
                    }
                  }}
                >
                  <Card className="h-full hover:border-primary transition-colors duration-300 relative">
                    <CardContent className="p-6">
                      {/* Indicador de Premium */}
                      {!isPro && !challenge.isFreeAccess && (
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant="outline"
                            className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 flex items-center gap-1"
                          >
                            <Lock className="h-3 w-3" />
                            Premium
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(challenge.completed_at).toLocaleDateString()}
                        </span>
                        {challenge.retos?.difficulty && (
                          <Badge className={`${getDifficultyColor(challenge.retos.difficulty)} ml-auto`}>
                            {challenge.retos.difficulty}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-xl font-bold mb-2">{challenge.retos?.title || "Reto sin título"}</h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {challenge.retos?.description || "Sin descripción"}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm">Completado</span>
                        </div>
                        <Badge variant="outline">{challenge.retos?.category || "General"}</Badge>
                      </div>

                      {/* Overlay para retos premium si el usuario no es premium */}
                      {!isPro && !challenge.isFreeAccess && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="text-center p-4">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                            <p className="text-white font-medium mb-2">Contenido Premium</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/30"
                            >
                              Desbloquear
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card/30 border border-border rounded-lg">
              <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">
                {selectedTab === "saved" ? "No tienes retos guardados" : "No has completado ningún reto"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {selectedTab === "saved"
                  ? "Guarda tus retos favoritos para acceder a ellos fácilmente."
                  : "Completa retos para verlos aquí."}
              </p>
              <Link href="/reto-diario">
                <Button>Ir al reto diario</Button>
              </Link>
            </div>
          )}

          {/* Mensaje promocional para usuarios no premium */}
          {!isPro && (
            <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-full">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Desbloquea todos los retos</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Con una suscripción Premium, podrás acceder a todos los retos anteriores, ver tu historial completo
                    y disfrutar de muchas más funcionalidades.
                  </p>
                  <Link href="/planes">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/30"
                    >
                      Ver planes Premium
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

