"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GenerarRetoIAProps {
  onRetoGenerated: (reto: any) => void
}

export default function GenerarRetoIA({ onRetoGenerated }: GenerarRetoIAProps) {
  const [prompt, setPrompt] = useState("")
  const [difficulty, setDifficulty] = useState("Intermedio")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedReto, setGeneratedReto] = useState<any | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setError(null)
      setGeneratedReto(null)

      console.log("Enviando solicitud a la API Edge...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos de timeout

      const response = await fetch("/api/generate-reto-edge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          difficulty,
          category: category || undefined,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      console.log("Respuesta recibida, status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        let errorMessage = "Error al generar el reto"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch (e) {
          if (errorText) errorMessage = errorText
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let result = ""

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            result += decoder.decode(value, { stream: true })
          }
          result += decoder.decode()

          console.log("Stream completado, resultado:", result.substring(0, 100) + "...")

          // Intentar parsear el resultado como JSON
          let data
          try {
            data = JSON.parse(result)
          } catch (e) {
            // Si no se puede parsear como JSON, intentar extraer el JSON del texto
            const jsonMatch = result.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              data = JSON.parse(jsonMatch[0])
            } else {
              throw new Error("No se pudo parsear la respuesta como JSON")
            }
          }

          if (!data.title || !data.description) {
            console.warn("La respuesta no tiene la estructura esperada:", data)
            throw new Error("La respuesta no tiene el formato esperado")
          }

          setGeneratedReto(data)
          toast({
            title: "Reto generado",
            description: "Se ha generado un nuevo reto con IA",
          })
        } finally {
          reader.releaseLock()
        }
      } else {
        throw new Error("No se pudo leer la respuesta del servidor")
      }
    } catch (err) {
      console.error("Error generating reto:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al generar el reto")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (generatedReto) {
      onRetoGenerated(generatedReto)
      toast({
        title: "Reto aplicado",
        description: "El reto generado se ha aplicado al formulario",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Reto con IA</CardTitle>
        <CardDescription>
          Utiliza la IA para generar un reto de programación basado en tus especificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt">Descripción o tema del reto</Label>
          <Input
            id="prompt"
            placeholder="Ej: Crear una función que calcule el factorial de un número"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Categoría (opcional)</Label>
          <Input
            id="category"
            placeholder="Ej: Algoritmos, Estructuras de datos, JavaScript"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="difficulty">Dificultad</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Selecciona la dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Intermedio">Intermedio</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Reto
            </>
          )}
        </Button>

        {generatedReto && (
          <Button variant="outline" onClick={handleApply}>
            Aplicar Reto Generado
          </Button>
        )}
      </CardFooter>

      {error && (
        <div className="px-6 pb-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {generatedReto && (
        <div className="px-6 pb-4">
          <div className="p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">{generatedReto.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{generatedReto.description}</p>
            <div className="flex gap-2">
              <Badge variant="outline">Dificultad: {generatedReto.difficulty}</Badge>
              {generatedReto.category && <Badge>{generatedReto.category}</Badge>}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

