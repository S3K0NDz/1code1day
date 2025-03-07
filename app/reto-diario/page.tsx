"use client"

import Link from "next/link"

import { useState, useEffect, useRef } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Play,
  Save,
  RefreshCw,
  CheckCircle,
  Trophy,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Calendar,
  ArrowDown,
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeOutput } from "@/components/code-output"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import KeyboardHandler from "@/app/retos/[id]/keyboard-handler"
import ClipboardHelper from "@/app/retos/[id]/clipboard-helper"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabaseClient"

// Eliminar la declaración global de invertirPalabras
declare global {
  interface Window {
    [key: string]: any
  }
}

export default function RetoDiarioPage() {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [code, setCode] = useState("")
  const [remainingTime, setRemainingTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [timeUntilNextChallenge, setTimeUntilNextChallenge] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const editorRef = useRef<any>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchDailyChallenge = async () => {
      setIsLoading(true)
      try {
        // Obtener la fecha actual
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Formatear la fecha para la consulta
        const formattedDate = today.toISOString().split("T")[0]

        console.log("Buscando reto para la fecha:", formattedDate)

        // Consultar el reto programado para hoy
        const { data, error } = await supabase
          .from("retos")
          .select("*")
          .eq("published", true)
          .filter("daily_date", "gte", formattedDate + "T00:00:00")
          .filter("daily_date", "lt", formattedDate + "T23:59:59")
          .order("daily_date", { ascending: true })
          .limit(1)

        console.log("Resultado de la consulta:", data)

        if (error) throw error

        if (data && data.length > 0) {
          const dailyReto = data[0]

          // Parsear los campos JSON si es necesario
          let examples = []
          let hints = []
          let testCases = []

          try {
            examples =
              typeof dailyReto.examples === "string" ? JSON.parse(dailyReto.examples) : dailyReto.examples || []
          } catch (e) {
            console.error("Error parsing examples:", e)
            examples = []
          }

          try {
            hints = typeof dailyReto.hints === "string" ? JSON.parse(dailyReto.hints) : dailyReto.hints || []
          } catch (e) {
            console.error("Error parsing hints:", e)
            hints = []
          }

          try {
            testCases =
              typeof dailyReto.testcases === "string" ? JSON.parse(dailyReto.testcases) : dailyReto.testcases || []
          } catch (e) {
            console.error("Error parsing testCases:", e)
            testCases = []
          }

          // Actualizar el estado con los datos del reto
          setCode(dailyReto.initialcode || "")
          setRemainingTime((dailyReto.timelimit || 45) * 60)

          // Guardar todos los datos del reto en el estado
          setDailyChallenge({
            id: dailyReto.id,
            title: dailyReto.title,
            description: dailyReto.description,
            difficulty: dailyReto.difficulty,
            category: dailyReto.category,
            timeLimit: dailyReto.timelimit || 45,
            date: new Date(dailyReto.daily_date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            completions: dailyReto.completions || 0,
            successRate: dailyReto.success_rate || 0,
            initialCode: dailyReto.initialcode,
            examples: examples,
            hints: hints,
            testCases: testCases,
          })
        } else {
          // Si no hay reto diario programado, mostrar un mensaje
          console.log("No se encontró ningún reto para hoy")
          toast({
            title: "No hay reto diario",
            description: "No hay un reto programado para hoy. Intenta más tarde.",
            variant: "destructive",
          })
          router.push("/retos")
        }
      } catch (error) {
        console.error("Error al cargar el reto diario:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el reto diario. Intenta más tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyChallenge()
  }, [router])

  useEffect(() => {
    const calculateTimeUntilNextChallenge = () => {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilNextChallenge({ hours, minutes, seconds })
    }

    calculateTimeUntilNextChallenge()
    const timer = setInterval(calculateTimeUntilNextChallenge, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isLoading || !hasStarted) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev <= 0 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isLoading, hasStarted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const runCode = () => {
    if (!dailyChallenge) return

    setIsRunning(true)
    setOutput("")

    try {
      let consoleOutput = ""
      const originalConsoleLog = console.log

      // Capturar la salida de console.log
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "<br>"
        originalConsoleLog(...args)
      }

      // Simplemente ejecutar el código del usuario sin verificar tests
      try {
        // Crear un entorno seguro para ejecutar el código
        const userCode = code

        // Ejecutar el código directamente
        eval(userCode)
      } catch (e) {
        throw new Error(`Error al ejecutar el código: ${e.message}`)
      }

      // Restaurar console.log original
      console.log = originalConsoleLog

      // Mostrar la salida capturada
      setOutput(consoleOutput || "sin salida")
    } catch (error) {
      setOutput(`Error en la ejecución: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCheckCode = () => {
    if (!dailyChallenge) return

    setIsRunning(true)
    setOutput("")

    try {
      // Extraer el nombre de la función del código
      const functionNameMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/)
      if (!functionNameMatch) {
        throw new Error("No se encontró ninguna función en tu código. Asegúrate de definir una función.")
      }

      const functionName = functionNameMatch[1]

      // Ejecutar el código del usuario asegurándose de que se defina en el ámbito global
      try {
        // Envolver el código en una IIFE que asigna explícitamente la función al objeto window
        const wrappedCode = `
          (function() {
            ${code}
            // Asignar explícitamente la función al objeto window
            window["${functionName}"] = ${functionName};
          })();
        `

        // Evaluar el código envuelto
        eval(wrappedCode)

        // Verificar si la función existe en el ámbito global
        if (typeof window[functionName] !== "function") {
          throw new Error(`La función ${functionName} no está definida correctamente.`)
        }
      } catch (e) {
        throw new Error(`Error al ejecutar el código: ${e.message}`)
      }

      let consoleOutput = ""
      const originalConsoleLog = console.log
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "<br>"
        originalConsoleLog(...args)
      }

      let allTestsPassed = true
      let testOutput = ""

      if (!dailyChallenge.testCases || dailyChallenge.testCases.length === 0) {
        setOutput("No hay casos de prueba definidos para este reto.")
        setIsRunning(false)
        return
      }

      // Procesar casos de prueba
      if (dailyChallenge.testCases && dailyChallenge.testCases.length > 0) {
        for (let i = 0; i < dailyChallenge.testCases.length; i++) {
          const test = dailyChallenge.testCases[i]
          let result
          let passed = false
          let error = null

          try {
            // Preparar el input según su tipo
            let input = test.input
            if (typeof input === "string" && (input.startsWith("[") || input.startsWith("{"))) {
              try {
                input = JSON.parse(input)
              } catch (e) {
                // Si no se puede parsear, usar como string
              }
            }

            // Ejecutar la función con el input
            if (typeof input === "string" && input.includes(",")) {
              const args = input.split(",").map((arg) => {
                // Intentar convertir a número si es posible
                const trimmed = arg.trim()
                const num = Number(trimmed)
                return isNaN(num) ? trimmed : num
              })
              result = window[functionName](...args)
            } else {
              result = window[functionName](input)
            }

            // Preparar el valor esperado
            let expected = test.expected
            if (typeof expected === "string" && (expected.startsWith("[") || expected.startsWith("{"))) {
              try {
                expected = JSON.parse(expected)
              } catch (e) {
                // Si no se puede parsear, usar como string
              }
            }

            // Comparar resultado con el esperado
            if (typeof result === "number" && typeof expected === "string") {
              // Si el resultado es un número y el esperado es string, convertir para comparar
              passed = result.toString() === expected
            } else if (typeof expected === "number" && typeof result === "string") {
              // Si el esperado es un número y el resultado es string, convertir para comparar
              passed = expected.toString() === result
            } else if (typeof expected === "number" && typeof result === "number") {
              // Comparación directa de números
              passed = result === expected
            } else {
              // Para otros tipos, usar la comparación de cadenas JSON
              passed = JSON.stringify(result) === JSON.stringify(expected)
            }
          } catch (e) {
            error = e.message
            passed = false
          }

          testOutput += `━━\n`
          testOutput += `▶ Test ${i + 1}: ${passed ? "✅ PASÓ" : "❌ FALLÓ"}\n`
          testOutput += `━━\n\n`
          testOutput += `📥 Entrada: ${test.input}\n\n`
          testOutput += `🎯 Esperado: ${test.expected}\n\n`
          testOutput += `🔍 Obtenido: ${result !== undefined ? result : "undefined"}\n\n`

          if (error) {
            testOutput += `⚠️ Error: ${error}\n\n`
          }

          testOutput += `\n\n`

          if (!passed) allTestsPassed = false
        }
      }

      console.log = originalConsoleLog
      setOutput(consoleOutput + testOutput)

      if (allTestsPassed) {
        setSuccess(true)
        setOutput((prev) => prev + "<br>✅ ¡Felicidades! Todos los tests pasaron.")
        setTimeout(() => setShowSuccessModal(true), 1000)

        // Guardar la solución en la base de datos
        if (user) {
          try {
            supabase.from("user_challenges").upsert({
              user_id: user.id,
              challenge_id: dailyChallenge.id,
              completed_at: new Date().toISOString(),
              code: code,
            })
          } catch (error) {
            console.error("Error al guardar la solución:", error)
          }
        }
      } else {
        setSuccess(false)
        setOutput((prev) => prev + "<br>❌ Algunos tests fallaron.")
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!dailyChallenge) return

    // Primero verificar si todos los tests pasan
    await handleCheckCode()

    // Si la solución es correcta, guardarla en la base de datos
    if (success) {
      try {
        if (user) {
          const { error } = await supabase.from("user_challenges").upsert({
            user_id: user.id,
            challenge_id: dailyChallenge.id,
            completed_at: new Date().toISOString(),
            code: code,
          })

          if (error) throw error

          toast({
            title: "Solución guardada",
            description: "Tu solución ha sido guardada correctamente.",
          })
        }
      } catch (error) {
        console.error("Error al guardar la solución:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar tu solución. Intenta de nuevo.",
          variant: "destructive",
        })
      }
    }
  }

  const resetCode = () => {
    if (dailyChallenge) {
      setCode(dailyChallenge.initialCode)
    }
  }

  const handleShare = (platform: string) => {
    const text = `¡He completado el reto "${dailyChallenge?.title}" en 1code1day! 🚀 #1code1day`
    const url = `https://1code1day.vercel.app/reto-diario`

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        "_blank",
      )
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank",
      )
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    }
  }

  const handleStart = () => {
    if (!user) {
      // Si no hay usuario autenticado, mostrar modal o redirigir a login
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para comenzar el reto diario.",
        action: (
          <Button variant="default" size="sm" onClick={() => router.push("/login")}>
            Iniciar sesión
          </Button>
        ),
      })
      return
    }

    setHasStarted(true)
    setRemainingTime(dailyChallenge?.timeLimit * 60 || 45 * 60)
  }

  const getDifficultyColor = (difficulty: string) => {
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

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InteractiveGridBackground>
    )
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex flex-col">
        <NavbarWithUser />
        <main className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="description"
                className="flex-1 flex flex-col"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -50, transition: { duration: 0.5, ease: "easeInOut" } }}
              >
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-lg p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                      <h1 className="text-2xl sm:text-3xl font-bold mr-3">Reto Diario</h1>
                      {dailyChallenge && (
                        <Badge className={`${getDifficultyColor(dailyChallenge.difficulty)} text-sm px-3 py-1`}>
                          {dailyChallenge.difficulty}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center bg-black/30 px-4 py-2 rounded-md text-sm sm:text-base">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                      <span className="font-medium">
                        Próximo reto: {timeUntilNextChallenge.hours.toString().padStart(2, "0")}:
                        {timeUntilNextChallenge.minutes.toString().padStart(2, "0")}:
                        {timeUntilNextChallenge.seconds.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  {dailyChallenge ? (
                    <>
                      <h2 className="text-4xl font-bold mb-4">{dailyChallenge.title}</h2>
                      <div className="flex flex-wrap items-center text-muted-foreground mb-6 text-xs sm:text-sm gap-y-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                        <span>{dailyChallenge.date}</span>
                        <span className="mx-2">•</span>
                        <span>{dailyChallenge.category}</span>
                        <span className="mx-2">•</span>
                        <span>{dailyChallenge.completions} soluciones</span>
                        <span className="mx-2">•</span>
                        <span>Éxito: {dailyChallenge.successRate}%</span>
                      </div>
                      <div className="bg-black/20 p-6 rounded-lg">
                        <p className="text-xl leading-relaxed">{dailyChallenge.description}</p>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {dailyChallenge.examples.map((example, index) => (
                          <div key={index} className="bg-black/30 p-4 rounded-md">
                            <p className="text-sm font-mono mb-2 text-muted-foreground">Ejemplo {index + 1}:</p>
                            <p className="text-sm font-mono mb-1">
                              Entrada: <span className="text-green-400">{example.input}</span>
                            </p>
                            <p className="text-sm font-mono">
                              Salida: <span className="text-blue-400">{example.output}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex flex-col items-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto"
                        >
                          <Button size="lg" className="px-8 py-6 text-lg group w-full sm:w-auto" onClick={handleStart}>
                            <motion.span
                              initial={{ y: 0 }}
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                              className="flex items-center"
                            >
                              Comenzar
                              <ArrowDown className="ml-2 h-5 w-5 transition" />
                            </motion.span>
                          </Button>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xl mb-4">No hay reto diario disponible</p>
                      <Link href="/retos">
                        <Button>Ver otros retos</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center">
                    <h2 className="text-lg font-bold mr-2">{dailyChallenge?.title}</h2>
                    {dailyChallenge && (
                      <Badge className={`${getDifficultyColor(dailyChallenge.difficulty)}`}>
                        {dailyChallenge.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start sm:gap-4">
                    <div className="flex items-center bg-black/50 px-3 py-1 rounded-md">
                      <Clock className="h-4 w-4 mr-1.5 text-yellow-500" />
                      <span className="font-medium">Tiempo: {formatTime(remainingTime)}</span>
                    </div>
                    <div className="flex items-center bg-black/50 px-3 py-1 rounded-md">
                      <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
                      <span className="font-medium text-xs sm:text-sm">
                        Próximo: {timeUntilNextChallenge.hours.toString().padStart(2, "0")}:
                        {timeUntilNextChallenge.minutes.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
                <Tabs defaultValue="editor" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                    <TabsTrigger value="pistas">Pistas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor" className="flex-1 flex flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">
                      <div className="lg:col-span-3 flex flex-col">
                        <div className="editor-wrapper flex-1 rounded-md overflow-hidden border border-border">
                          <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            onMount={(editor) => (editorRef.current = editor)}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: "on",
                              scrollBeyondLastLine: false,
                              folding: true,
                              automaticLayout: true,
                            }}
                          />
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetCode}
                            className="w-full sm:w-auto mb-2 sm:mb-0"
                          >
                            <RefreshCw className="h-4 w-4 mr-1.5" />
                            Reiniciar
                          </Button>
                          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={runCode}
                              disabled={isRunning}
                              className="flex-1 sm:flex-none"
                            >
                              <Play className="h-4 w-4 mr-1.5" />
                              Ejecutar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCheckCode}
                              disabled={isRunning}
                              className="flex-1 sm:flex-none"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Comprobar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSubmit}
                              disabled={isRunning}
                              className="w-full sm:w-auto mt-2 sm:mt-0"
                            >
                              <Save className="h-4 w-4 mr-1.5" />
                              Enviar
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-2 flex flex-col">
                        <div className="flex-1 border border-border rounded-md overflow-hidden bg-card/70">
                          <div className="bg-muted px-4 py-2 text-sm font-medium border-b border-border">Consola</div>
                          <div className="h-full">
                            {isRunning ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
                              </div>
                            ) : (
                              <CodeOutput
                                value={output || "Ejecuta tu código para ver los resultados"}
                                height="400px"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="descripcion" className="flex-1">
                    {dailyChallenge && (
                      <div className="border border-border bg-card/50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">{dailyChallenge.title}</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={getDifficultyColor(dailyChallenge.difficulty)}>
                            {dailyChallenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{dailyChallenge.category}</Badge>
                        </div>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                          <p className="text-muted-foreground">{dailyChallenge.description}</p>
                        </div>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Ejemplos</h3>
                          <div className="space-y-3">
                            {dailyChallenge.examples.map((example, index) => (
                              <div key={index} className="bg-secondary p-4 rounded-md">
                                <p className="text-sm font-mono mb-2">Ejemplo {index + 1}:</p>
                                <p className="text-sm font-mono mb-1">
                                  Entrada: <span className="text-green-400">{example.input}</span>
                                </p>
                                <p className="text-sm font-mono">
                                  Salida: <span className="text-blue-400">{example.output}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="pistas" className="flex-1">
                    {dailyChallenge && (
                      <div className="border border-border bg-card/50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Pistas</h2>
                        <p className="text-muted-foreground mb-6">Usa estas pistas si te quedas atascado</p>
                        <div className="space-y-6">
                          {dailyChallenge.hints.map((hint, index) => (
                            <div key={index} className="bg-secondary/30 p-4 rounded-md">
                              <h3 className="font-medium mb-2">Pista {index + 1}</h3>
                              <p className="text-muted-foreground">{hint}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-black border border-border rounded-lg max-w-lg w-full overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                    ¡Reto completado!
                  </h3>
                  <button onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="mb-4 text-base sm:text-lg">
                      ¡Felicidades, <span className="font-bold">{user?.email?.split("@")[0] || "usuario"}</span>!
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Has completado exitosamente el reto <span className="font-bold">{dailyChallenge?.title}</span>.
                    </p>
                  </div>
                  <div className="relative border border-border rounded-lg overflow-hidden" id="share-card">
                    <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                        <span className="text-base sm:text-lg font-semibold flex items-center gap-1">
                          <span className="bg-white text-black px-2">1code</span>
                          <span className="text-white">1day</span>
                        </span>
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-lg sm:text-xl font-bold mb-1">
                          {user?.email?.split("@")[0] || "usuario"}
                        </div>
                        <div className="text-muted-foreground text-sm">ha completado el reto</div>
                        <div className="text-lg sm:text-xl font-bold mt-1">{dailyChallenge?.title}</div>
                      </div>
                      {dailyChallenge && (
                        <div
                          className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(dailyChallenge.difficulty)}`}
                        >
                          {dailyChallenge.difficulty}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4 text-sm">¡Comparte tu logro con el mundo!</p>
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("twitter")}
                        title="Compartir en Twitter"
                      >
                        <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("facebook")}
                        title="Compartir en Facebook"
                      >
                        <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("linkedin")}
                        title="Compartir en LinkedIn"
                      >
                        <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex justify-between">
                  <Button variant="outline" onClick={() => setShowSuccessModal(false)} className="w-full">
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <KeyboardHandler editorRef={editorRef} />
          <ClipboardHelper editorRef={editorRef} />
          <Toaster />
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

