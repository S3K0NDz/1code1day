"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, Filter, Search, Trophy, ArrowRight, Calendar } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

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
            completions: reto.completions || Math.floor(Math.random() * 1000), // Usar datos reales si existen
            successRate: reto.success_rate || Math.floor(Math.random() * 30) + 70, // Usar datos reales si existen
            examples: examples,
            hints: hints,
            testCases: testCases,
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

    return matchesSearch && matchesCategory && matchesDifficulty
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
            <div className="flex gap-2">
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
                <Link href={`/retos/${reto.id}`} key={reto.id}>
                  <div className="border border-border bg-card/50 rounded-lg p-6 hover:border-primary transition-colors duration-300 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{reto.date}</span>
                      <Badge className={`${getDifficultyColor(reto.difficulty)} ml-auto`}>{reto.difficulty}</Badge>
                    </div>
                    <h2 className="text-xl font-bold mb-2">{reto.title}</h2>
                    <p className="text-muted-foreground mb-4 flex-grow">{reto.description}</p>
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Categoría</span>
                        <span className="font-medium">{reto.category}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Éxito</span>
                        <span className="font-medium">{reto.successRate}%</span>
                      </div>
                    </div>
                  </div>
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

