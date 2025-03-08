"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, Filter, Search, Trophy, ArrowRight, Calendar, Lock } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

// Categorías para filtrar
const CATEGORIES = [
  { value: "all", label: "Todas las categorías" },
  { value: "strings", label: "Cadenas de texto" },
  { value: "arrays", label: "Arrays" },
  { value: "algorithms", label: "Algoritmos" },
  { value: "dp", label: "Programación dinámica" },
  { value: "stacks", label: "Pilas y Colas" },
  { value: "matrices", label: "Matrices" },
]

// Dificultades para filtrar
const DIFFICULTIES = [
  { value: "all", label: "Todas las dificultades" },
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Intermedio" },
  { value: "hard", label: "Difícil" },
]

export default function RetosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [retos, setRetos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isPro, isLoading: authLoading } = useAuth()
  const router = useRouter()
  // Añadir un estado para filtrar por tipo de acceso (todos, gratuitos, premium)
  const [accessFilter, setAccessFilter] = useState("all")

  // Cargar retos desde Supabase
  useEffect(() => {
    async function fetchRetos() {
      setIsLoading(true)
      try {
        // Excluir el reto diario de esta consulta
        const { data, error } = await supabase
          .from("retos")
          .select("*")
          .eq("published", true)
          .is("daily_date", null) // Excluir retos diarios
          .order("createdat", { ascending: false })

        if (error) {
          throw error
        }

        // Formatear los datos para que coincidan con la estructura esperada
        const formattedRetos = data.map((reto) => {
          // Asegurarse de que los campos JSON se parsean correctamente
          let examples = []
          let hints = []
          let testCases = []

          try {
            examples = typeof reto.examples === "string" ? JSON.parse(reto.examples) : reto.examples || []
          } catch (e) {
            console.error("Error parsing examples:", e)
          }

          try {
            hints = typeof reto.hints === "string" ? JSON.parse(reto.hints) : reto.hints || []
          } catch (e) {
            console.error("Error parsing hints:", e)
          }

          try {
            testCases = typeof reto.testcases === "string" ? JSON.parse(reto.testcases) : reto.testcases || []
          } catch (e) {
            console.error("Error parsing testCases:", e)
          }

          // Determinar si el reto es de acceso gratuito basado en el campo free_access
          // Si free_access es explícitamente false, es premium
          // Si free_access es true o usamos la lógica de fallback (primeros 3 retos), es gratuito
          const isFreeAccess = reto.free_access !== false && (reto.free_access === true || data.indexOf(reto) < 3)

          return {
            id: reto.id,
            title: reto.title,
            description: reto.description,
            difficulty: reto.difficulty,
            category: reto.category,
            date: new Date(reto.createdat).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            completions: reto.completions || Math.floor(Math.random() * 1000),
            successRate: reto.success_rate || Math.floor(Math.random() * 30) + 70,
            examples: examples,
            hints: hints,
            testCases: testCases,
            isFreeAccess: isFreeAccess, // Añadir esta propiedad
            free_access: reto.free_access,
          }
        })

        setRetos(formattedRetos)
      } catch (error) {
        console.error("Error al cargar los retos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los retos. Intenta más tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRetos()
  }, [])

  // Filtrar retos
  const filteredRetos = retos.filter((reto) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      reto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reto.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por categoría
    const matchesCategory =
      selectedCategory === "all" ||
      reto.category
        .toLowerCase()
        .includes(
          selectedCategory === "strings"
            ? "cadena"
            : selectedCategory === "arrays"
              ? "array"
              : selectedCategory === "dp"
                ? "dinámica"
                : selectedCategory === "stacks"
                  ? "pila"
                  : selectedCategory === "matrices"
                    ? "matriz"
                    : selectedCategory,
        )

    // Filtrar por dificultad
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      (selectedDifficulty === "easy" && reto.difficulty === "Fácil") ||
      (selectedDifficulty === "medium" && reto.difficulty === "Intermedio") ||
      (selectedDifficulty === "hard" && reto.difficulty === "Difícil")

    // Filtrar por tipo de acceso
    const matchesAccess =
      accessFilter === "all" ||
      (accessFilter === "free" && reto.isFreeAccess) ||
      (accessFilter === "premium" && !reto.isFreeAccess)

    return matchesSearch && matchesCategory && matchesDifficulty && matchesAccess
  })

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-500/20 text-green-500"
      case "Intermedio":
        return "bg-yellow-500/20 text-yellow-500"
      case "Difícil":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-blue-500/20 text-blue-500"
    }
  }

  // Modificar para mostrar retos gratuitos y premium
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex flex-col">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 flex-grow">
          {/* Banner destacado para el reto diario */}
          <div className="mb-12">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-6">
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold mr-3">¿Ya resolviste el reto de hoy?</h2>
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                      ¡Nuevo!
                    </Badge>
                  </div>
                  <p className="text-lg mb-6">
                    Cada día publicamos un nuevo desafío de programación para poner a prueba tus habilidades. El reto de
                    hoy te está esperando.
                  </p>
                  <Link href="/reto-diario">
                    <Button size="lg" className="group">
                      Resolver el reto diario
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:flex items-center justify-center bg-primary/5 p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-4">
                      <Calendar className="h-12 w-12 text-primary/80" />
                    </div>
                    <div className="text-2xl font-bold">Reto Diario</div>
                    <div className="text-muted-foreground mt-1">Actualizado cada 24h</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Título y botones */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Biblioteca de retos</h2>
            <Button>
              <Trophy className="h-4 w-4 mr-2" />
              Mi progreso
            </Button>
          </div>

          {/* Mensaje informativo para usuarios no premium */}
          {!authLoading && !isPro && (
            <div className="mb-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-full">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Prueba nuestros retos gratuitos</h3>
                  <p className="text-sm text-muted-foreground">
                    Algunos retos anteriores están disponibles gratuitamente para que puedas probar la experiencia
                    premium. Actualiza tu plan para acceder a todos los retos y mejorar tus habilidades de programación.
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
          )}

          {/* Filtros y búsqueda */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar retos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <select
                className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
              {/* Añadir filtro por tipo de acceso */}
              <select
                className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={accessFilter}
                onChange={(e) => setAccessFilter(e.target.value)}
              >
                <option value="all">Todos los retos</option>
                <option value="free">Retos gratuitos</option>
                <option value="premium">Retos premium</option>
              </select>
            </div>
          </div>

          {/* Lista de retos */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredRetos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRetos.map((reto) => (
                <Link
                  href={`/retos/${reto.id}`}
                  key={reto.id}
                  className="group/card relative rounded-lg border border-muted/50 overflow-hidden transition-shadow hover:shadow-md"
                >
                  <Card className="relative z-10 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{reto.title}</h3>
                      <Badge className={getDifficultyColor(reto.difficulty)}>{reto.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{reto.description}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        {reto.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        {reto.completions}
                        <span className="ml-1">({reto.successRate}%)</span>
                      </div>
                    </div>
                  </Card>
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover/card:opacity-80 transition-opacity"></div>
                  {reto.isFreeAccess ? null : (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge variant="secondary" className="opacity-70">
                        <Lock className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No se encontraron retos que coincidan con los filtros seleccionados.
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedDifficulty("all")
                  setAccessFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

