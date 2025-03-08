"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  CalendarPlus2Icon as CalendarIcon2,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  SearchIcon,
  FilterIcon,
} from "lucide-react"
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns"
import { es } from "date-fns/locale"
import { supabase } from "@/utils/supabaseClient"
import { useToast } from "@/components/ui/use-toast"
import GenerarRetoIA from "@/components/generar-reto-ia"

// Actualizar la interfaz Reto para incluir el campo free_access
interface Reto {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  initialcode: string
  examples: any[]
  hints: string[]
  testcases: any[]
  published: boolean
  publishdate?: string
  createdat?: string
  updatedat?: string
  daily_date?: string
  free_access?: boolean
}

export default function AdminRetos() {
  const [retos, setRetos] = useState<Reto[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingReto, setEditingReto] = useState<Reto | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null)
  const [openDailyDialog, setOpenDailyDialog] = useState(false)
  const [selectedRetoForDay, setSelectedRetoForDay] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [selectedRetoDetails, setSelectedRetoDetails] = useState<Reto | null>(null)

  // Actualizar el estado formData para incluir free_access
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Fácil",
    category: "",
    initialcode: "",
    examples: [],
    hints: [],
    testcases: [],
    published: false,
    daily_date: null as Date | null,
    free_access: false,
  })
  const { toast } = useToast()

  const difficultyOptions = ["Fácil", "Intermedio", "Difícil"]

  useEffect(() => {
    fetchRetos()
  }, [])

  // Obtener los días del mes actual para el calendario
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Obtener los retos diarios programados para el mes actual
  const dailyRetosInMonth = useMemo(() => {
    return retos.filter((reto) => {
      if (!reto.daily_date) return false
      const retoDate = new Date(reto.daily_date)
      return isSameMonth(retoDate, currentMonth)
    })
  }, [retos, currentMonth])

  // Obtener categorías únicas para el filtro
  const uniqueCategories = useMemo(() => {
    const categories = retos.map((reto) => reto.category).filter(Boolean)
    return [...new Set(categories)]
  }, [retos])

  // Filtrar retos para el selector
  const filteredRetos = useMemo(() => {
    return retos.filter((reto) => {
      // Filtrar por término de búsqueda
      const matchesSearch =
        searchTerm === "" ||
        reto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reto.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtrar por dificultad
      const matchesDifficulty = filterDifficulty === "all" || reto.difficulty === filterDifficulty

      // Filtrar por categoría
      const matchesCategory = filterCategory === "all" || reto.category === filterCategory

      return matchesSearch && matchesDifficulty && matchesCategory
    })
  }, [retos, searchTerm, filterDifficulty, filterCategory])

  const fetchRetos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("retos").select("*").order("createdat", { ascending: false })
      if (error) throw error
      setRetos(data || [])
    } catch (error) {
      console.error("Error fetching retos:", error)
      toast({ title: "Error", description: "No se pudieron cargar los retos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: "examples" | "hints" | "testcases") => {
    try {
      const value = e.target.value
      if (!value.trim()) {
        setFormData((prev) => ({ ...prev, [field]: [] }))
        return
      }
      const parsedValue = JSON.parse(value)
      setFormData((prev) => ({ ...prev, [field]: parsedValue }))
    } catch (error) {
      console.warn(`Error parsing ${field} JSON:`, error)
    }
  }

  const handleDifficultyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, difficulty: value }))
  }

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, published: e.target.checked }))
  }

  // Añadir el manejador para el cambio de free_access
  const handleFreeAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, free_access: e.target.checked }))
  }

  const openEditDialog = (reto: Reto) => {
    setEditingReto(reto)
    // En la función openEditDialog, añadir free_access
    setFormData({
      title: reto.title,
      description: reto.description,
      difficulty: reto.difficulty,
      category: reto.category,
      initialcode: reto.initialcode,
      examples: reto.examples,
      hints: reto.hints,
      testcases: reto.testcases,
      published: reto.published,
      daily_date: reto.daily_date ? new Date(reto.daily_date) : null,
      free_access: reto.free_access || false,
    })
    setOpenDialog(true)
  }

  const openCreateDialog = () => {
    setEditingReto(null)
    // En la función openCreateDialog, añadir free_access
    setFormData({
      title: "",
      description: "",
      difficulty: "Fácil",
      category: "",
      initialcode: "",
      examples: [],
      hints: [],
      testcases: [],
      published: false,
      daily_date: null,
      free_access: false,
    })
    setOpenDialog(true)
  }

  const saveReto = async () => {
    try {
      const now = new Date().toISOString()
      const retoData = {
        ...formData,
        daily_date: formData.daily_date ? formData.daily_date.toISOString() : null,
      }

      if (editingReto) {
        const { error } = await supabase
          .from("retos")
          .update({ ...retoData, updatedat: now })
          .eq("id", editingReto.id)
        if (error) throw error
        toast({ title: "Reto actualizado", description: "El reto se ha actualizado correctamente" })
      } else {
        const { error } = await supabase.from("retos").insert({
          ...retoData,
          createdat: now,
          updatedat: now,
          publishdate: formData.published ? now : null,
        })
        if (error) throw error
        toast({ title: "Reto creado", description: "El reto se ha creado correctamente" })
      }
      setOpenDialog(false)
      fetchRetos()
    } catch (error) {
      console.error("Error saving reto:", error)
      toast({ title: "Error", description: "No se pudo guardar el reto", variant: "destructive" })
    }
  }

  const deleteReto = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este reto?")) {
      try {
        const { error } = await supabase.from("retos").delete().eq("id", id)
        if (error) throw error
        toast({ title: "Reto eliminado", description: "El reto se ha eliminado correctamente" })
        fetchRetos()
      } catch (error) {
        console.error("Error deleting reto:", error)
        toast({ title: "Error", description: "No se pudo eliminar el reto", variant: "destructive" })
      }
    }
  }

  const togglePublished = async (reto: Reto) => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from("retos")
        .update({
          published: !reto.published,
          updatedat: now,
          publishdate: !reto.published ? now : null,
        })
        .eq("id", reto.id)
      if (error) throw error
      toast({
        title: reto.published ? "Reto despublicado" : "Reto publicado",
        description: `El reto se ha ${reto.published ? "despublicado" : "publicado"} correctamente`,
      })
      fetchRetos()
    } catch (error) {
      console.error("Error toggling published status:", error)
      toast({ title: "Error", description: "No se pudo cambiar el estado de publicación", variant: "destructive" })
    }
  }

  const scheduleAsDaily = async (reto: Reto, date: Date) => {
    try {
      // Asegurarse de que la fecha se guarda en formato ISO
      const formattedDate = date.toISOString()

      const { error } = await supabase
        .from("retos")
        .update({
          daily_date: formattedDate,
          updatedat: new Date().toISOString(),
        })
        .eq("id", reto.id)

      if (error) throw error

      toast({
        title: "Reto programado",
        description: `El reto "${reto.title}" ha sido programado como reto diario para el ${format(date, "dd/MM/yyyy")}`,
      })

      fetchRetos()
    } catch (error) {
      console.error("Error scheduling daily challenge:", error)
      toast({ title: "Error", description: "No se pudo programar el reto diario", variant: "destructive" })
    }
  }

  // En la función applyGeneratedReto, añadir free_access
  const applyGeneratedReto = (generatedReto: any) => {
    setFormData({
      title: generatedReto.title || "",
      description: generatedReto.description || "",
      difficulty: generatedReto.difficulty || "Fácil",
      category: generatedReto.category || "",
      initialcode: generatedReto.initialCode || "",
      examples: generatedReto.examples || [],
      hints: generatedReto.hints || [],
      testcases: generatedReto.testCases || [],
      published: false,
      daily_date: null,
      free_access: false,
    })
  }

  // Función para manejar el clic en un día del calendario
  const handleDayClick = (day: Date) => {
    setSelectedCalendarDay(day)
    setOpenDailyDialog(true)
    setSelectedRetoForDay("")
    setSearchTerm("")
    setFilterDifficulty("all")
    setFilterCategory("all")
    setSelectedRetoDetails(null)
  }

  // Función para programar un reto en el día seleccionado
  const scheduleDailyReto = async () => {
    if (!selectedCalendarDay || !selectedRetoForDay) {
      toast({
        title: "Error",
        description: "Debes seleccionar un reto para programar",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedReto = retos.find((r) => r.id === selectedRetoForDay)
      if (!selectedReto) {
        throw new Error("Reto no encontrado")
      }

      // Configurar la fecha a medianoche
      const dateAtMidnight = new Date(selectedCalendarDay)
      dateAtMidnight.setHours(0, 0, 0, 0)

      await scheduleAsDaily(selectedReto, dateAtMidnight)
      setOpenDailyDialog(false)
    } catch (error) {
      console.error("Error scheduling daily challenge:", error)
      toast({
        title: "Error",
        description: "No se pudo programar el reto diario",
        variant: "destructive",
      })
    }
  }

  // Función para verificar si un día tiene un reto programado
  const getDailyRetoForDay = (day: Date) => {
    return dailyRetosInMonth.find((reto) => {
      if (!reto.daily_date) return false
      return isSameDay(new Date(reto.daily_date), day)
    })
  }

  // Función para renderizar un día en el calendario
  const renderCalendarDay = (day: Date) => {
    const dailyReto = getDailyRetoForDay(day)

    return (
      <div
        key={day.toString()}
        className={`
          relative p-2 h-24 border border-gray-200 dark:border-gray-700 cursor-pointer 
          hover:bg-gray-50 dark:hover:bg-gray-700
          ${isSameMonth(day, currentMonth) ? "" : "opacity-50"}
          bg-white dark:bg-gray-800 dark:text-gray-300
        `}
        onClick={() => handleDayClick(day)}
      >
        <div className="text-sm font-medium">{format(day, "d")}</div>
        {dailyReto && (
          <div
            className="mt-1 p-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded truncate"
            title={dailyReto.title}
          >
            {dailyReto.title}
          </div>
        )}
      </div>
    )
  }

  // Función para manejar la selección de un reto
  const handleRetoSelection = (retoId: string) => {
    setSelectedRetoForDay(retoId)
    const retoDetails = retos.find((r) => r.id === retoId) || null
    setSelectedRetoDetails(retoDetails)
  }

  // Función para limpiar los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setFilterDifficulty("all")
    setFilterCategory("all")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Gestión de Retos</h1>
        <div className="w-full sm:w-auto">
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            Crear Reto
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>{editingReto ? "Editar Reto" : "Crear Nuevo Reto"}</DialogTitle>
            <DialogDescription>
              {editingReto
                ? "Modifica los detalles del reto y guarda los cambios."
                : "Completa el formulario para crear un nuevo reto o utiliza la IA para generarlo."}
            </DialogDescription>
          </DialogHeader>

          {!editingReto && (
            <div className="mb-6">
              <GenerarRetoIA onRetoGenerated={applyGeneratedReto} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Título del reto"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Categoría del reto"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select value={formData.difficulty} onValueChange={handleDifficultyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="daily_date">Programar como reto diario</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" id="daily_date">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.daily_date ? (
                          format(formData.daily_date, "dd/MM/yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" side="bottom">
                      <Calendar
                        mode="single"
                        selected={formData.daily_date || undefined}
                        onSelect={(date) => {
                          setFormData((prev) => ({ ...prev, daily_date: date || null }))
                          setIsCalendarOpen(false)
                        }}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  {formData.daily_date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => setFormData((prev) => ({ ...prev, daily_date: null }))}
                    >
                      Limpiar fecha
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={handlePublishedChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="published">Publicado</Label>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="free_access"
                    checked={formData.free_access}
                    onChange={handleFreeAccessChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="free_access">Acceso gratuito (prueba premium)</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción del reto"
                  className="h-32"
                />
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="initialcode">Código Inicial</Label>
                <Textarea
                  id="initialcode"
                  name="initialcode"
                  value={formData.initialcode}
                  onChange={handleChange}
                  placeholder="Código inicial para el reto"
                  className="font-mono h-32"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examples">Ejemplos (JSON)</Label>
                  <Textarea
                    id="examples"
                    name="examples"
                    value={JSON.stringify(formData.examples, null, 2)}
                    onChange={(e) => handleJsonChange(e, "examples")}
                    placeholder={`[{"input": "ejemplo", "output": "resultado"}]`}
                    className="font-mono h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="hints">Pistas (JSON)</Label>
                  <Textarea
                    id="hints"
                    name="hints"
                    value={JSON.stringify(formData.hints, null, 2)}
                    onChange={(e) => handleJsonChange(e, "hints")}
                    placeholder={`["Primera pista", "Segunda pista"]`}
                    className="font-mono h-32"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="testcases">Casos de Prueba (JSON)</Label>
                <Textarea
                  id="testcases"
                  name="testcases"
                  value={JSON.stringify(formData.testcases, null, 2)}
                  onChange={(e) => handleJsonChange(e, "testcases")}
                  placeholder={`[{"input": "test1", "expected": "resultado1"}]`}
                  className="font-mono h-32"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveReto}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo mejorado para programar reto diario desde el calendario */}
      <Dialog open={openDailyDialog} onOpenChange={setOpenDailyDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Programar Reto Diario</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedCalendarDay && (
                <>
                  Selecciona un reto para programar el día {format(selectedCalendarDay, "dd/MM/yyyy", { locale: es })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar retos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-[130px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800">
                    <SelectItem value="all" className="dark:text-white">
                      Todas
                    </SelectItem>
                    {difficultyOptions.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty} className="dark:text-white">
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[130px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800">
                    <SelectItem value="all" className="dark:text-white">
                      Todas
                    </SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category} className="dark:text-white">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  className="dark:border-gray-600 dark:text-gray-300"
                  title="Limpiar filtros"
                >
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de retos con vista previa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {filteredRetos.length > 0 ? (
                filteredRetos.map((reto) => (
                  <div
                    key={reto.id}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-colors
                      ${
                        selectedRetoForDay === reto.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }
                    `}
                    onClick={() => handleRetoSelection(reto.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium dark:text-white">{reto.title}</h3>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {reto.difficulty}
                        </Badge>
                        {!reto.free_access && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{reto.description}</p>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{reto.category}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron retos con los filtros seleccionados
                </div>
              )}
            </div>

            {/* Vista previa del reto seleccionado */}
            {selectedRetoDetails && (
              <div className="mt-4 p-4 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-medium text-lg dark:text-white">{selectedRetoDetails.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{selectedRetoDetails.difficulty}</Badge>
                  <Badge variant="outline">{selectedRetoDetails.category}</Badge>
                  {selectedRetoDetails.free_access ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Acceso gratuito
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{selectedRetoDetails.description}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDailyDialog(false)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button onClick={scheduleDailyReto} disabled={!selectedRetoForDay}>
              Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
          <TabsTrigger value="draft">Borradores</TabsTrigger>
          <TabsTrigger value="daily">Retos Diarios</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {retos.map((reto) => (
            <RetoCard
              key={reto.id}
              reto={reto}
              onEdit={openEditDialog}
              onDelete={deleteReto}
              onTogglePublished={togglePublished}
              onScheduleDaily={scheduleAsDaily}
            />
          ))}
          {retos.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">No hay retos disponibles</p>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          {retos
            .filter((r) => r.published)
            .map((reto) => (
              <RetoCard
                key={reto.id}
                reto={reto}
                onEdit={openEditDialog}
                onDelete={deleteReto}
                onTogglePublished={togglePublished}
                onScheduleDaily={scheduleAsDaily}
              />
            ))}
          {retos.filter((r) => r.published).length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">No hay retos publicados</p>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {retos
            .filter((r) => !r.published)
            .map((reto) => (
              <RetoCard
                key={reto.id}
                reto={reto}
                onEdit={openEditDialog}
                onDelete={deleteReto}
                onTogglePublished={togglePublished}
                onScheduleDaily={scheduleAsDaily}
              />
            ))}
          {retos.filter((r) => !r.published).length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">No hay retos en borrador</p>
          )}
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          {retos
            .filter((r) => r.daily_date)
            .sort((a, b) => new Date(a.daily_date!).getTime() - new Date(b.daily_date!).getTime())
            .map((reto) => (
              <RetoCard
                key={reto.id}
                reto={reto}
                onEdit={openEditDialog}
                onDelete={deleteReto}
                onTogglePublished={togglePublished}
                onScheduleDaily={scheduleAsDaily}
              />
            ))}
          {retos.filter((r) => r.daily_date).length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">No hay retos diarios programados</p>
          )}
        </TabsContent>

        {/* Nueva pestaña de Calendario */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-sm font-medium dark:text-gray-300"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {Array(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() === 0
                  ? 6
                  : new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() - 1,
              )
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white dark:bg-gray-800 p-2 h-24"></div>
                ))}

              {daysInMonth.map((day) => renderCalendarDay(day))}
            </div>

            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <InfoIcon className="h-4 w-4 mr-2" />
                <span>Haz clic en un día para programar un reto diario</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RetoCard({
  reto,
  onEdit,
  onDelete,
  onTogglePublished,
  onScheduleDaily,
}: {
  reto: Reto
  onEdit: (reto: Reto) => void
  onDelete: (id: string) => void
  onTogglePublished: (reto: Reto) => void
  onScheduleDaily: (reto: Reto, date: Date) => void
}) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    reto.daily_date ? new Date(reto.daily_date) : undefined,
  )

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-2">
          <div>
            <CardTitle className="text-lg md:text-xl">{reto.title}</CardTitle>
            <CardDescription className="text-sm">{reto.category}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
            <Badge variant={reto.published ? "default" : "outline"}>{reto.published ? "Publicado" : "Borrador"}</Badge>
            <Badge variant="secondary">{reto.difficulty}</Badge>
            {reto.daily_date && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs md:text-sm">
                Reto diario: {format(new Date(reto.daily_date), "dd/MM/yyyy")}
              </Badge>
            )}
            {reto.free_access ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Acceso gratuito
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Premium
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">{reto.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row justify-between gap-4 p-4 md:p-6">
        <div className="text-xs text-muted-foreground w-full md:w-auto">
          {reto.createdat ? format(new Date(reto.createdat), "dd/MM/yyyy") : "Fecha no disponible"}
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <CalendarIcon2 className="h-4 w-4 mr-1" />
                Programar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" side="bottom">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    const dateAtMidnight = new Date(date)
                    dateAtMidnight.setHours(0, 0, 0, 0)
                    onScheduleDaily(reto, dateAtMidnight)
                    setShowDatePicker(false)
                  }
                }}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onTogglePublished(reto)}>
            {reto.published ? "Despublicar" : "Publicar"}
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onEdit(reto)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" className="text-xs" onClick={() => onDelete(reto.id)}>
            Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

