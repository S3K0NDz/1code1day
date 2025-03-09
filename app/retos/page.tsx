"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  Filter,
  Lock,
  Search,
  Trophy,
  X,
  Tag,
  BarChart3,
  Sparkles,
  CalendarDays,
  UserRound,
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function RetosPage() {
  const [retos, setRetos] = useState([])
  const [filteredRetos, setFilteredRetos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficulty, setDifficulty] = useState("all")
  const [category, setCategory] = useState("all")
  const [retoType, setRetoType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [difficulties, setDifficulties] = useState([])
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [premiumModalVisible, setPremiumModalVisible] = useState(false)
  const [selectedPremiumReto, setSelectedPremiumReto] = useState(null)
  const [loginModalVisible, setLoginModalVisible] = useState(false)
  const [selectedReto, setSelectedReto] = useState(null)
  const [activeTab, setActiveTab] = useState("free")
  const { user, isPro, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchRetos = async () => {
      setIsLoading(true)
      try {
        // Obtener todos los retos desde Supabase, incluyendo los retos diarios pasados
        const { data: retosData, error: retosError } = await supabase
          .from("retos")
          .select("*")
          .eq("published", true)
          .order("createdat", { ascending: false })

        if (retosError) {
          throw retosError
        }

        // Obtener retos completados por el usuario
        let completedIds = []
        if (user) {
          const { data: completedData, error: completedError } = await supabase
            .from("user_challenges")
            .select("challenge_id")
            .eq("user_id", user.id)
            .not("completed_at", "is", null)

          if (!completedError && completedData) {
            completedIds = completedData.map((item) => item.challenge_id)
            setCompletedChallenges(completedIds)
          }
        }

        if (retosData) {
          // Extraer categorías y dificultades únicas
          const uniqueCategories = Array.from(new Set(retosData.map((reto) => reto.category))).filter(Boolean)

          const uniqueDifficulties = Array.from(new Set(retosData.map((reto) => reto.difficulty))).filter(Boolean)

          setCategories(uniqueCategories)
          setDifficulties(uniqueDifficulties)

          // Procesar los datos de los retos
          const processedRetos = retosData.map((reto) => {
            // Determinar si el reto es de acceso gratuito
            const isFreeAccess =
              reto.free_access !== false && (reto.free_access === true || retosData.indexOf(reto) < 3)

            // Determinar si es un reto diario
            const isDailyChallenge = reto.daily_date !== null

            return {
              ...reto,
              completed: completedIds.includes(reto.id),
              isFreeAccess: isFreeAccess,
              isDailyChallenge: isDailyChallenge,
              title: String(reto.title || "Sin título"),
              description: String(reto.description || "Sin descripción"),
              difficulty: String(reto.difficulty || "Sin dificultad"),
              category: String(reto.category || "Sin categoría"),
              // Formatear la fecha del reto diario si existe
              formattedDailyDate: reto.daily_date
                ? new Date(reto.daily_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null,
            }
          })

          setRetos(processedRetos)
          setFilteredRetos(processedRetos)
        }
      } catch (error) {
        console.error("Error al cargar los retos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los retos. Intenta más tarde.",
          variant: "destructive",
        })
        // En caso de error, establecer arrays vacíos
        setRetos([])
        setFilteredRetos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRetos()
  }, [user])

  useEffect(() => {
    // Filtrar retos basados en búsqueda, dificultad, categoría, tipo y pestaña
    let filtered = [...retos]

    if (searchTerm) {
      filtered = filtered.filter(
        (reto) =>
          reto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reto.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (difficulty !== "all") {
      filtered = filtered.filter((reto) => reto.difficulty === difficulty)
    }

    if (category !== "all") {
      filtered = filtered.filter((reto) => reto.category === category)
    }

    // Filtrar por tipo de reto (normal o diario)
    if (retoType !== "all") {
      filtered = filtered.filter((reto) => (retoType === "daily" ? reto.isDailyChallenge : !reto.isDailyChallenge))
    }

    // Aplicar filtro según la pestaña activa
    filtered = filtered.filter((reto) => (activeTab === "free" ? reto.isFreeAccess : !reto.isFreeAccess))

    setFilteredRetos(filtered)
  }, [searchTerm, difficulty, category, retoType, activeTab, retos])

  const clearFilters = () => {
    setSearchTerm("")
    setDifficulty("all")
    setCategory("all")
    setRetoType("all")
  }

  const getDifficultyColor = (difficulty) => {
    const lowerDifficulty = typeof difficulty === "string" ? difficulty.toLowerCase() : ""

    if (lowerDifficulty.includes("fácil") || lowerDifficulty.includes("facil")) {
      return "bg-green-500/20 text-green-500"
    } else if (lowerDifficulty.includes("intermedio") || lowerDifficulty.includes("medio")) {
      return "bg-yellow-500/20 text-yellow-500"
    } else if (lowerDifficulty.includes("difícil") || lowerDifficulty.includes("dificil")) {
      return "bg-red-500/20 text-red-500"
    } else {
      return "bg-blue-500/20 text-blue-500"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Fecha inválida"
    }
  }

  const handleRetoClick = (reto) => {
    // Primero verificar si el usuario está autenticado
    if (!user) {
      setSelectedReto(reto)
      setLoginModalVisible(true)
      return
    }

    // Si el usuario está autenticado pero no es premium y el reto no es de acceso gratuito
    if (!isPro && !reto.isFreeAccess) {
      setSelectedPremiumReto(reto)
      setPremiumModalVisible(true)
      return
    }

    // Si el usuario está autenticado y tiene los permisos necesarios, navegar al reto
    router.push(`/retos/${reto.id}`)
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  const handleGoToPricingPage = () => {
    router.push("/planes")
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Biblioteca de retos</h1>
              <p className="text-muted-foreground">
                Explora y practica con todos nuestros retos anteriores para mejorar tus habilidades
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {(searchTerm || difficulty !== "all" || category !== "all" || retoType !== "all") && (
                  <Badge variant="secondary" className="ml-2">
                    {(searchTerm ? 1 : 0) +
                      (difficulty !== "all" ? 1 : 0) +
                      (category !== "all" ? 1 : 0) +
                      (retoType !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              <Link href="/reto-diario">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Reto diario
                </Button>
              </Link>
            </div>
          </div>

          {/* Mensaje para usuarios no autenticados */}
          {!authLoading && !user && (
            <div className="mb-6 p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <UserRound className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Inicia sesión para acceder a los retos</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Puedes explorar todos los retos disponibles, pero necesitas iniciar sesión para poder acceder a
                    ellos.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Iniciar sesión
                      </Button>
                    </Link>
                    <Link href="/registro">
                      <Button size="sm">Crear cuenta</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros con explicaciones integradas */}
          {showFilters && (
            <div className="bg-card/50 border border-border rounded-lg p-4 mb-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro de búsqueda */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-4 w-4 text-primary" />
                    <label htmlFor="search-input" className="text-sm font-medium">
                      Búsqueda
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Busca retos por título o descripción para encontrar exactamente lo que necesitas.
                  </p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-input"
                      type="text"
                      placeholder="Buscar retos..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtro de dificultad */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <label htmlFor="difficulty-select" className="text-sm font-medium">
                      Dificultad
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Filtra por nivel de dificultad para encontrar retos adaptados a tu nivel de habilidad.
                  </p>
                  <Select id="difficulty-select" value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de categoría */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-4 w-4 text-primary" />
                    <label htmlFor="category-select" className="text-sm font-medium">
                      Categoría
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecciona una categoría específica para practicar habilidades concretas.
                  </p>
                  <Select id="category-select" value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de tipo de reto (nuevo) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <label htmlFor="type-select" className="text-sm font-medium">
                      Tipo de reto
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Filtra entre retos normales o retos diarios de fechas anteriores.
                  </p>
                  <Select id="type-select" value={retoType} onValueChange={setRetoType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipo de reto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="normal">Retos normales</SelectItem>
                      <SelectItem value="daily">Retos diarios pasados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}

          {/* Pestañas para separar retos gratuitos y premium */}
          <Tabs defaultValue="free" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="free" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Retos gratuitos
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Retos premium
                {!isPro && (
                  <Badge variant="outline" className="ml-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                    Actualiza
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Contenido de las pestañas */}
            <TabsContent value="free" className="mt-0">
              {!isPro && (
                <div className="mb-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500/20 p-2 rounded-full">
                      <Sparkles className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Retos gratuitos disponibles</h3>
                      <p className="text-sm text-muted-foreground">
                        Estos retos están disponibles para todos los usuarios. Practica con ellos y mejora tus
                        habilidades.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="premium" className="mt-0">
              {!isPro ? (
                <div className="mb-6 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Contenido Premium</h3>
                      <p className="text-sm text-muted-foreground">
                        Actualiza a Premium para acceder a todos estos retos y desbloquear funcionalidades exclusivas.
                      </p>
                      <div className="mt-2">
                        <Link href="/planes">
                          <Button variant="outline" size="sm">
                            Ver planes Premium
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 border border-primary/30 bg-primary/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 p-2 rounded-full">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Tu acceso Premium</h3>
                      <p className="text-sm text-muted-foreground">
                        Disfruta de acceso completo a todos nuestros retos premium. ¡Gracias por tu apoyo!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Lista de retos (común para ambas pestañas) */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-[220px] border border-border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-6 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredRetos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No se encontraron retos</h2>
                    <p className="text-muted-foreground mb-4">
                      No hay retos que coincidan con tus criterios de búsqueda.
                    </p>
                    <Button onClick={clearFilters}>Limpiar filtros</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRetos.map((reto) => (
                      <div
                        key={reto.id}
                        className="h-[220px] cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                        onClick={() => handleRetoClick(reto)}
                      >
                        <Card
                          className={`flex flex-col justify-between w-full h-full border ${
                            !user
                              ? "hover:border-blue-500"
                              : !isPro && !reto.isFreeAccess
                                ? "hover:border-yellow-500"
                                : "hover:border-primary"
                          }`}
                        >
                          <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold line-clamp-2">{reto.title}</h3>
                              <Badge
                                variant="outline"
                                className={`${getDifficultyColor(reto.difficulty)} ml-2 shrink-0`}
                              >
                                {reto.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{reto.description}</p>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center text-xs text-muted-foreground">
                                {reto.isDailyChallenge ? (
                                  <div className="flex items-center">
                                    <CalendarDays className="h-3 w-3 mr-1" />
                                    <span>Reto del {reto.formattedDailyDate}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(reto.createdat)}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {reto.isDailyChallenge && (
                                  <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 flex items-center gap-1 text-xs">
                                    <Calendar className="h-3 w-3" />
                                    Diario
                                  </Badge>
                                )}
                                {user && reto.completed && (
                                  <Badge className="bg-primary/20 text-primary border-primary/20 flex items-center gap-1 text-xs">
                                    <Trophy className="h-3 w-3" />
                                    Completado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Tabs>
        </main>
      </div>

      {/* Modal para usuario no autenticado */}
      {loginModalVisible && selectedReto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card border border-border rounded-lg max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-blue-500" />
                  Iniciar sesión requerido
                </h3>
                <button
                  onClick={() => setLoginModalVisible(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-500">{selectedReto.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Para acceder a este reto, primero debes iniciar sesión o crear una cuenta.
                </p>
                <Badge variant="outline" className={`${getDifficultyColor(selectedReto.difficulty)}`}>
                  {selectedReto.difficulty}
                </Badge>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Únete a nuestra comunidad para resolver retos y mejorar tus habilidades de programación.
              </p>
            </div>
            <div className="p-4 border-t border-border flex justify-between">
              <Button variant="outline" onClick={() => setLoginModalVisible(false)}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Link href="/registro">
                  <Button variant="outline">Crear cuenta</Button>
                </Link>
                <Button onClick={handleGoToLogin}>
                  <UserRound className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para contenido premium */}
      {premiumModalVisible && selectedPremiumReto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card border border-border rounded-lg max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-yellow-500" />
                  Contenido Premium
                </h3>
                <button
                  onClick={() => setPremiumModalVisible(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-500">{selectedPremiumReto.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Este reto solo está disponible para usuarios Premium.
                </p>
                <Badge variant="outline" className={`${getDifficultyColor(selectedPremiumReto.difficulty)}`}>
                  {selectedPremiumReto.difficulty}
                </Badge>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Actualiza a Premium para acceder a todos los retos anteriores y desbloquear todas las funcionalidades.
              </p>
            </div>
            <div className="p-4 border-t border-border flex justify-between">
              <Button variant="outline" onClick={() => setPremiumModalVisible(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGoToPricingPage}>
                <Trophy className="h-4 w-4 mr-2" />
                Ver planes Premium
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </InteractiveGridBackground>
  )
}

