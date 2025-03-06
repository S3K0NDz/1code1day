"use client"

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
  Download,
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

// TypeScript declaration for window.invertirPalabras
declare global {
  interface Window {
    invertirPalabras?: (cadena: string) => string
  }
}

const DAILY_CHALLENGE = {
  id: "1",
  title: "Invertir palabras en una cadena",
  description:
    "Dada una cadena de texto, debes invertir cada palabra individualmente, manteniendo el orden original de las palabras. Los espacios entre palabras deben conservarse.",
  difficulty: "Intermedio",
  category: "Cadenas de texto",
  timeLimit: 45,
  date: "6 Marzo, 2025",
  completions: 742,
  successRate: 82,
  initialCode: `// Escribe tu solución aquí
function invertirPalabras(cadena) {
  // Tu código aquí
  return "";
}

// Ejemplos de prueba
console.log(invertirPalabras("Hola mundo")); // Debería mostrar: "aloH odnum"
console.log(invertirPalabras("El gato con botas")); // Debería mostrar: "lE otag noc satob"
`,
  examples: [
    { input: "Hola mundo", output: "aloH odnum" },
    { input: "El gato con botas", output: "lE otag noc satob" },
  ],
  hints: [
    "Puedes dividir la cadena en palabras usando el método split() con un espacio como separador.",
    "Para invertir cada palabra, puedes convertirla en un array de caracteres, invertir el array y luego unirlo de nuevo.",
    "También puedes invertir una palabra recorriéndola de atrás hacia adelante y construyendo una nueva cadena.",
  ],
  testCases: [
    { input: "Hola mundo", expected: "aloH odnum" },
    { input: "El gato con botas", expected: "lE otag noc satob" },
    { input: "JavaScript es genial", expected: "tpircSavaJ se laineg" },
  ],
}

export default function RetoDiarioPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [success, setSuccess] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(45 * 60)
  const editorRef = useRef<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [username] = useState("usuario")
  const [timeUntilNextChallenge, setTimeUntilNextChallenge] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const { user, isLoading: authLoading } = useAuth()
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

        // Consultar el reto programado para hoy
        const { data, error } = await supabase
          .from("retos")
          .select("*")
          .eq("published", true)
          .gte("daily_date", formattedDate)
          .lt("daily_date", new Date(today.getTime() + 86400000).toISOString()) // Añadir un día
          .order("daily_date", { ascending: true })
          .limit(1)

        if (error) throw error

        if (data && data.length > 0) {
          const dailyReto = data[0]

          // Parsear los campos JSON si es necesario
          let examples = []
          let hints = []
          let testCases = []

          try {
            if (typeof dailyReto.examples === "string") {
              // Verificar si parece un JSON válido
              if (dailyReto.examples.trim().startsWith("[") || dailyReto.examples.trim().startsWith("{")) {
                examples = JSON.parse(dailyReto.examples)
              } else {
                console.warn("examples no es un JSON válido:", dailyReto.examples)
                examples = []
              }
            } else if (Array.isArray(dailyReto.examples)) {
              examples = dailyReto.examples
            }
          } catch (e) {
            console.error("Error parsing examples:", e)
            examples = []
          }

          try {
            if (typeof dailyReto.hints === "string") {
              if (dailyReto.hints.trim().startsWith("[") || dailyReto.hints.trim().startsWith("{")) {
                hints = JSON.parse(dailyReto.hints)
              } else {
                console.warn("hints no es un JSON válido:", dailyReto.hints)
                hints = []
              }
            } else if (Array.isArray(dailyReto.hints)) {
              hints = dailyReto.hints
            }
          } catch (e) {
            console.error("Error parsing hints:", e)
            hints = []
          }

          try {
            if (typeof dailyReto.testcases === "string") {
              if (dailyReto.testcases.trim().startsWith("[") || dailyReto.testcases.trim().startsWith("{")) {
                testCases = JSON.parse(dailyReto.testcases)
              } else {
                console.warn("testcases no es un JSON válido:", dailyReto.testcases)
                testCases = []
              }
            } else if (Array.isArray(dailyReto.testcases)) {
              testCases = dailyReto.testcases
            }
          } catch (e) {
            console.error("Error parsing testCases:", e)
            testCases = []
          }

          // Si hay un reto diario, actualizar el estado
          setCode(dailyReto.initialcode || DAILY_CHALLENGE.initialCode)
          setRemainingTime((dailyReto.timelimit || DAILY_CHALLENGE.timeLimit) * 60)

          // También podríamos actualizar el DAILY_CHALLENGE con los datos reales
          Object.assign(DAILY_CHALLENGE, {
            id: dailyReto.id,
            title: dailyReto.title,
            description: dailyReto.description,
            difficulty: dailyReto.difficulty,
            category: dailyReto.category,
            timeLimit: dailyReto.timelimit || DAILY_CHALLENGE.timeLimit,
            examples: examples,
            hints: hints,
            testCases: testCases,
          })
        } else {
          // Si no hay reto diario programado, usar el predeterminado
          setCode(DAILY_CHALLENGE.initialCode)
          setRemainingTime(DAILY_CHALLENGE.timeLimit * 60)
        }
      } catch (error) {
        console.error("Error al cargar el reto diario:", error)
        // En caso de error, usar el reto predeterminado
        setCode(DAILY_CHALLENGE.initialCode)
        setRemainingTime(DAILY_CHALLENGE.timeLimit * 60)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyChallenge()
  }, [])

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

  // Ejecutar: Simply run the code like in the HTML example
  const runCode = () => {
    setIsRunning(true)
    setOutput("")

    try {
      const originalConsoleLog = console.log
      let consoleOutput = ""
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "<br>"
        originalConsoleLog(...args)
      }

      eval(code) // Direct execution like the HTML example
      setOutput(consoleOutput)
      console.log = originalConsoleLog
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Comprobar: Run test cases to verify the solution
  const handleCheckCode = () => {
    setIsRunning(true)
    setOutput("")

    try {
      const userFunction = new Function(`
        ${code}
        return invertirPalabras;
      `)()

      let consoleOutput = ""
      const originalConsoleLog = console.log
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "<br>"
        originalConsoleLog(...args)
      }

      let allTestsPassed = true
      DAILY_CHALLENGE.testCases.forEach((test, index) => {
        const result = userFunction(test.input)
        const passed = result === test.expected
        consoleOutput += `Test ${index + 1}: Input: "${test.input}" -> Output: "${result}" (Expected: "${test.expected}") - ${passed ? "✅ Passed" : "❌ Failed"}<br>`
        if (!passed) allTestsPassed = false
      })

      console.log = originalConsoleLog
      setOutput(consoleOutput)

      if (allTestsPassed) {
        setSuccess(true)
        setOutput((prev) => prev + "<br>✅ ¡Felicidades! Todos los tests pasaron.")
        setTimeout(() => setShowSuccessModal(true), 1000)
      } else {
        setSuccess(false)
        setOutput((prev) => prev + "<br>❌ Algunos tests fallaron.")
      }
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Enviar: Simulate submitting the solution
  const handleSubmit = () => {
    setIsRunning(true)
    setOutput("")

    try {
      const userFunction = new Function(`
        ${code}
        return invertirPalabras;
      `)()

      const isCorrect = DAILY_CHALLENGE.testCases.every((test) => userFunction(test.input) === test.expected)

      if (isCorrect) {
        setOutput("✅ Solución enviada correctamente. ¡Éxito!")
        setSuccess(true)
        setTimeout(() => setShowSuccessModal(true), 1000)
      } else {
        setOutput("❌ La solución no pasa todos los tests. Por favor, verifica tu código.")
      }
      // Here you could add an API call to submit the code, e.g.:
      // await fetch('/api/submit', { method: 'POST', body: JSON.stringify({ code }) });
    } catch (error) {
      setOutput(`Error al enviar: ${(error as Error).message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => setCode(DAILY_CHALLENGE.initialCode)

  const handleShare = (platform: string) => {
    const text = `¡He completado el reto "${DAILY_CHALLENGE.title}" en 1code1day! 🚀 #1code1day`
    const url = window.location.href

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
        break
    }

    if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400")
  }

  const generateImage = () => {
    alert("Imagen generada y descargada")
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
    setRemainingTime(DAILY_CHALLENGE.timeLimit * 60)
  }

  if (isLoading || authLoading) {
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
                      <Badge className={`${getDifficultyColor(DAILY_CHALLENGE.difficulty)} text-sm px-3 py-1`}>
                        {DAILY_CHALLENGE.difficulty}
                      </Badge>
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
                  <h2 className="text-4xl font-bold mb-4">{DAILY_CHALLENGE.title}</h2>
                  <div className="flex flex-wrap items-center text-muted-foreground mb-6 text-xs sm:text-sm gap-y-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                    <span>{DAILY_CHALLENGE.date}</span>
                    <span className="mx-2">•</span>
                    <span>{DAILY_CHALLENGE.category}</span>
                    <span className="mx-2">•</span>
                    <span>{DAILY_CHALLENGE.completions} soluciones</span>
                    <span className="mx-2">•</span>
                    <span>Éxito: {DAILY_CHALLENGE.successRate}%</span>
                  </div>
                  <div className="bg-black/20 p-6 rounded-lg">
                    <p className="text-xl leading-relaxed">{DAILY_CHALLENGE.description}</p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {DAILY_CHALLENGE.examples.map((example, index) => (
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
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
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
                    <h2 className="text-lg font-bold mr-2">{DAILY_CHALLENGE.title}</h2>
                    <Badge className={`${getDifficultyColor(DAILY_CHALLENGE.difficulty)}`}>
                      {DAILY_CHALLENGE.difficulty}
                    </Badge>
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
                    <div className="border border-border bg-card/50 p-6 rounded-lg">
                      <h2 className="text-xl font-semibold mb-4">{DAILY_CHALLENGE.title}</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getDifficultyColor(DAILY_CHALLENGE.difficulty)}>
                          {DAILY_CHALLENGE.difficulty}
                        </Badge>
                        <Badge variant="outline">{DAILY_CHALLENGE.category}</Badge>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                        <p className="text-muted-foreground">{DAILY_CHALLENGE.description}</p>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Ejemplos</h3>
                        <div className="space-y-3">
                          {DAILY_CHALLENGE.examples.map((example, index) => (
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
                  </TabsContent>
                  <TabsContent value="pistas" className="flex-1">
                    <div className="border border-border bg-card/50 p-6 rounded-lg">
                      <h2 className="text-xl font-semibold mb-4">Pistas</h2>
                      <p className="text-muted-foreground mb-6">Usa estas pistas si te quedas atascado</p>
                      <div className="space-y-6">
                        {DAILY_CHALLENGE.hints.map((hint, index) => (
                          <div key={index} className="bg-secondary/30 p-4 rounded-md">
                            <h3 className="font-medium mb-2">Pista {index + 1}</h3>
                            <p className="text-muted-foreground">{hint}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                  <button onClick={() => setShowSuccessModal(false)} className="text-muted-foreground hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="mb-4 text-base sm:text-lg">
                      ¡Felicidades, <span className="font-bold">{username}</span>!
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Has completado exitosamente el reto <span className="font-bold">{DAILY_CHALLENGE.title}</span>.
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
                        <div className="text-lg sm:text-xl font-bold mb-1">{username}</div>
                        <div className="text-muted-foreground text-sm">ha completado el reto</div>
                        <div className="text-lg sm:text-xl font-bold mt-1">{DAILY_CHALLENGE.title}</div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(DAILY_CHALLENGE.difficulty)}`}
                      >
                        {DAILY_CHALLENGE.difficulty}
                      </div>
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
                      <Button variant="outline" size="icon" onClick={generateImage} title="Descargar imagen">
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
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

