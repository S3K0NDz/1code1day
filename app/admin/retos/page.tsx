"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"
import { useState, useEffect } from "react"
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
import { CalendarIcon, CalendarPlus2Icon as CalendarIcon2 } from "lucide-react"
import { format } from "date-fns"
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Retos</h1>
        <div className="flex gap-4">
          <Button onClick={openCreateDialog}>Crear Reto</Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="daily_date"
                        >
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

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveReto}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="published">Publicados</TabsTrigger>
          <TabsTrigger value="draft">Borradores</TabsTrigger>
          <TabsTrigger value="daily">Retos Diarios</TabsTrigger>
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
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{reto.title}</CardTitle>
            <CardDescription>{reto.category}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={reto.published ? "default" : "outline"}>{reto.published ? "Publicado" : "Borrador"}</Badge>
            <Badge variant="secondary">{reto.difficulty}</Badge>
            {reto.daily_date && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
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
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{reto.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {reto.createdat ? format(new Date(reto.createdat), "dd/MM/yyyy") : "Fecha no disponible"}
        </div>
        <div className="flex gap-2">
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
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
                    // Asegúrate de que la fecha tiene la hora establecida a medianoche
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
          <Button variant="outline" size="sm" onClick={() => onTogglePublished(reto)}>
            {reto.published ? "Despublicar" : "Publicar"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(reto)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(reto.id)}>
            Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

