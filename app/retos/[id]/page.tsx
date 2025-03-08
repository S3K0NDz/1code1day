"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Editor from "@monaco-editor/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
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
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeOutput } from "@/components/code-output"
import KeyboardHandler from "./keyboard-handler"
import ClipboardHelper from "./clipboard-helper"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabaseClient"
import { useAuth } from "@/components/auth-provider"
import { saveCompletedChallenge, toggleSavedChallenge } from "@/lib/db-functions"
import PremiumContentLock from "@/components/premium-content-lock"

export default function RetoPage() {
  const params = useParams()
  const id = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [reto, setReto] = useState<any>(null)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [success, setSuccess] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(45 * 60)
  const editorRef = useRef<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [username, setUsername] = useState("usuario")
  const [testResults, setTestResults] = useState<any[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const { user, isPro, isLoading: authLoading } = useAuth()
  const router = useRouter()
  // Añadir estado para controlar si el reto es de acceso gratuito
  const [isFreeAccess, setIsFreeAccess] = useState(false)

  useEffect(() => {
    const fetchReto = async () => {
      setIsLoading(true)
      try {
        // Buscar donde se obtiene el reto y añadir el campo free_access
        const { data, error } = await supabase
          .from("retos")
          .select("*, user_challenges(*)")
          .eq("id", params.id)
          .single()

        if (error) throw error

        if (data) {
          let examples = []
          let hints = []
          let testCases = []

          try {
            examples = typeof data.examples === "string" ? JSON.parse(data.examples) : data.examples || []
          } catch (e) {
            console.error("Error parsing examples:", e)
            examples = []
          }

          try {
            hints = typeof data.hints === "string" ? JSON.parse(data.hints) : data.hints || []
          } catch (e) {
            console.error("Error parsing hints:", e)
            hints = []
          }

          try {
            testCases = typeof data.testcases === "string" ? JSON.parse(data.testcases) : data.testcases || []
          } catch (e) {
            console.error("Error parsing testCases:", e)
            testCases = []
          }

          // Determinar si el reto es de acceso gratuito
          // En producción, esto vendría de un campo en la base de datos
          // Por ahora, usaremos una lógica simple basada en el ID
          const freeAccess = data.free_access === true || Number.parseInt(data.id) % 5 === 0
          setIsFreeAccess(freeAccess)

          setReto({
            id: data.id,
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            category: data.category,
            timeLimit: data.timelimit || 45,
            initialCode: data.initialcode,
            examples,
            hints,
            testCases,
            isFreeAccess: freeAccess,
          })
          setCode(data.initialcode)
          setRemainingTime((data.timelimit || 45) * 60)

          // Fetch user data if needed
          if (user) {
            try {
              const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

              if (profile?.username) {
                setUsername(profile.username)
              } else {
                setUsername(user.email?.split("@")[0] || "usuario")
              }
            } catch (error) {
              console.error("Error fetching user data:", error)
              setUsername(user.email?.split("@")[0] || "usuario")
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar el reto:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el reto. Intenta más tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchReto()
  }, [id, user])

  // Verificar si el usuario puede acceder al reto
  useEffect(() => {
    if (!authLoading && !isLoading && !isPro && !isFreeAccess) {
      toast({
        title: "Contenido Premium",
        description: "Este reto solo está disponible para usuarios Premium.",
        action: (
          <Button variant="default" size="sm" onClick={() => router.push("/planes")}>
            Ver planes
          </Button>
        ),
      })
      router.push("/planes")
    }
  }, [authLoading, isPro, isLoading, isFreeAccess, router])

  // Verificar si el reto está guardado
  useEffect(() => {
    const checkIfSaved = async () => {
      if (user && reto) {
        try {
          const { data } = await supabase
            .from("user_challenges")
            .select("is_saved")
            .eq("user_id", user.id)
            .eq("challenge_id", reto.id)
            .maybeSingle()

          setIsSaved(!!data?.is_saved)
        } catch (error) {
          console.error("Error al verificar si el reto está guardado:", error)
        }
      }
    }

    checkIfSaved()
  }, [user, reto])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (!reto) return
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev <= 0 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [reto])

  const runCode = async () => {
    if (!reto) return

    setIsRunning(true)
    setOutput("")

    try {
      let consoleOutput = ""
      const originalConsoleLog = console.log

      // Capturar la salida de console.log
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "\n"
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

  const handleCheckCode = async () => {
    if (!reto) return

    setIsRunning(true)
    setOutput("")
    setTestResults([])

    try {
      let consoleOutput = ""
      const originalConsoleLog = console.log

      // Capturar la salida de console.log
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "\n"
        originalConsoleLog(...args)
      }

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

      console.log = originalConsoleLog

      // Procesar casos de prueba
      const testResults = []
      let allTestsPassed = true
      let testOutput = ""

      if (reto.testCases && reto.testCases.length > 0) {
        for (let i = 0; i < reto.testCases.length; i++) {
          const test = reto.testCases[i]
          let result
          let passed = false
          let error = null

          try {
            // Parsear los argumentos si vienen como string con comas
            let args = test.input

            if (typeof args === "string" && args.includes(",")) {
              args = args.split(",").map((arg) => {
                // Intentar convertir a número si es posible
                const trimmed = arg.trim()
                const num = Number(trimmed)
                return isNaN(num) ? trimmed : num
              })
              result = window[functionName](...args)
            } else {
              // Si no es una string con comas, pasar directamente
              result = window[functionName](args)
            }

            // Convertir el resultado a string para comparar con el expected
            const resultStr = String(result)

            // Comparar resultado con el esperado
            passed = resultStr === test.expected
          } catch (e) {
            error = e.message
            passed = false
          }

          testResults.push({
            id: i + 1,
            passed,
            input: test.input,
            expected: test.expected,
            result: result,
            error,
          })

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

          allTestsPassed = allTestsPassed && passed
        }
      } else {
        testOutput = "No hay tests definidos para este reto.\n"
      }

      setTestResults(testResults)
      setOutput(consoleOutput + "\n" + testOutput)

      if (allTestsPassed) {
        // Guardar el estado de completado si todos los tests pasaron
        try {
          if (user) {
            const challengeData = {
              user_id: user.id,
              challenge_id: id,
              completed_at: new Date().toISOString(),
              code: code,
              is_saved: isSaved, // Mantener el estado de guardado actual
            }

            const result = await saveCompletedChallenge(challengeData)

            if (!result.success) {
              console.error("Error saving completion status:", result.error)
            }

            toast({
              title: "¡Éxito!",
              description: "Has completado todos los tests correctamente.",
            })
          }
        } catch (error) {
          console.error("Error saving completion status:", error)
        }

        setSuccess(true)
        setTimeout(() => setShowSuccessModal(true), 1000)
      } else {
        setSuccess(false)
        toast({
          title: "Tests incompletos",
          description: "Algunos tests no han pasado. Revisa tu código.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setOutput(`Error en la ejecución: ${error.message}`)
      setSuccess(false)

      toast({
        title: "Error",
        description: error.message || "Error al ejecutar el código",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    // First check if all tests pass
    await handleCheckCode()

    // Si la solución es correcta, guardarla en la base de datos
    if (success) {
      try {
        if (user) {
          const challengeData = {
            user_id: user.id,
            challenge_id: id,
            completed_at: new Date().toISOString(),
            code: code,
            is_saved: isSaved, // Mantener el estado de guardado actual
          }

          const result = await saveCompletedChallenge(challengeData)

          if (!result.success) {
            throw new Error("No se pudo guardar la solución")
          }

          toast({
            title: "Solución guardada",
            description: "Tu solución ha sido guardada correctamente.",
          })

          // Show success modal
          setShowSuccessModal(true)
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
    if (reto) setCode(reto.initialCode)
  }

  const handleToggleSave = async () => {
    if (!user || !reto) return

    try {
      const result = await toggleSavedChallenge(user.id, reto.id, !isSaved)

      if (result.success) {
        setIsSaved(!isSaved)
        toast({
          title: isSaved ? "Reto eliminado de guardados" : "Reto guardado",
          description: isSaved
            ? "El reto ha sido eliminado de tus guardados"
            : "El reto ha sido añadido a tus guardados",
        })
      } else {
        throw new Error("No se pudo actualizar el estado del reto")
      }
    } catch (error) {
      console.error("Error al guardar/quitar el reto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reto. Intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleShare = (platform: string) => {
    if (!reto) return

    const text = `¡He completado el reto "${reto.title}" en 1code1day! 🚀 #1code1day #ProgrammingChallenge`
    const url = window.location.href

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
        break
      default:
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const generateImage = () => {
    // Implementation for generating and downloading an image
    const shareCard = document.getElementById("share-card")
    if (!shareCard) return

    // This is a placeholder - in a real implementation, you would use a library like html2canvas
    toast({
      title: "Función no implementada",
      description: "La descarga de imágenes estará disponible próximamente.",
    })

    // Example with html2canvas (would need to be imported)
    /*
    html2canvas(shareCard).then(canvas => {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${reto.title}-completion.png`;
      link.click();
    });
    */
  }

  const getDifficultyColor = (difficulty: string) => {
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

  // Mostrar un mensaje de carga mientras se verifica si el usuario es premium
  if (authLoading || isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InteractiveGridBackground>
    )
  }

  // Si el usuario no es premium y el reto no es de acceso gratuito, mostrar mensaje de contenido premium
  if (!isPro && !isFreeAccess) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen">
          <NavbarWithUser />
          <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
            <div className="flex items-center mb-6">
              <Link href="/retos">
                <Button variant="ghost" size="sm" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Retos anteriores</h1>
            </div>

            {/* Buscar donde se usa el componente PremiumContentLock y añadir la prop freeAccess */}
            <PremiumContentLock
              freeAccess={reto?.free_access || false}
              title="Reto Premium"
              description="Este reto solo está disponible para usuarios Premium. Actualiza tu plan para acceder a todos los retos y mejorar tus habilidades de programación."
            />
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  if (!reto) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-card/50 border border-border p-6 rounded-lg max-w-md">
            <h1 className="text-2xl font-bold mb-4">Reto no encontrado</h1>
            <p className="text-muted-foreground mb-6">Lo sentimos, el reto que buscas no existe o ha sido eliminado.</p>
            <Link href="/retos">
              <Button>Volver a todos los retos</Button>
            </Link>
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex flex-col">
        <NavbarWithUser />
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Link href="/retos">
                <Button variant="ghost" size="sm" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{reto.title}</h1>
              <Badge variant="outline" className={`ml-3 ${getDifficultyColor(reto.difficulty)}`}>
                {reto.difficulty}
              </Badge>

              {/* Indicador de reto gratuito */}
              {!isPro && isFreeAccess && (
                <Badge className="ml-2 bg-green-500/20 text-green-500 border-green-500/20">Gratuito</Badge>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-4 bg-secondary px-3 py-1 rounded-md">
                <Clock className="h-4 w-4 mr-1.5 text-yellow-500" />
                <span className="font-medium">{formatTime(remainingTime)}</span>
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
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      onMount={(editor) => {
                        editorRef.current = editor
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        folding: true,
                        automaticLayout: true,
                        wordWrap: "on",
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "smart",
                      }}
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" size="sm" onClick={resetCode}>
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Reiniciar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleSave}
                      className={isSaved ? "bg-primary/10" : ""}
                    >
                      {isSaved ? "Quitar de guardados" : "Guardar reto"}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={runCode} disabled={isRunning}>
                        <Play className="h-4 w-4 mr-1.5" />
                        Ejecutar
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCheckCode} disabled={isRunning}>
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Comprobar
                      </Button>
                      <Button size="sm" onClick={handleSubmit} disabled={isRunning}>
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
                        <CodeOutput value={output || "Ejecuta tu código para ver los resultados"} height="400px" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="descripcion" className="flex-1">
              <div className="border border-border bg-card/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">{reto.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getDifficultyColor(reto.difficulty)}>{reto.difficulty}</Badge>
                  <Badge variant="outline">{reto.category}</Badge>

                  {/* Indicador de reto gratuito */}
                  {!isPro && isFreeAccess && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/20">Reto Gratuito</Badge>
                  )}
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{reto.description}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Ejemplos</h3>
                  <div className="space-y-3">
                    {reto.examples.map((example: any, index: number) => (
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
                  {reto.hints.map((hint: string, index: number) => (
                    <div key={index} className="bg-secondary/30 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Pista {index + 1}</h3>
                      <p className="text-muted-foreground">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-black border border-border rounded-lg max-w-lg w-full overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    ¡Reto completado!
                  </h3>
                  <button onClick={() => setShowSuccessModal(false)} className="text-muted-foreground hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="mb-4 text-lg">
                      ¡Felicidades, <span className="font-bold">{username}</span>!
                    </div>
                    <p className="text-muted-foreground">
                      Has completado exitosamente el reto <span className="font-bold">{reto.title}</span>.
                    </p>
                  </div>
                  <div className="relative border border-border rounded-lg overflow-hidden" id="share-card">
                    <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-8 w-8 text-yellow-400" />
                        <span className="text-lg font-semibold flex items-center gap-1">
                          <span className="bg-white text-black px-2">1code</span>
                          <span className="text-white">1day</span>
                        </span>
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-xl font-bold mb-1">{username}</div>
                        <div className="text-muted-foreground">ha completado el reto</div>
                        <div className="text-xl font-bold mt-1">{reto.title}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(reto.difficulty)}`}>
                        {reto.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">¡Comparte tu logro con el mundo!</p>
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("twitter")}
                        title="Compartir en Twitter"
                      >
                        <Twitter className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("facebook")}
                        title="Compartir en Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("linkedin")}
                        title="Compartir en LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={generateImage} title="Descargar imagen">
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex justify-between">
                  <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSuccessModal(false)
                      window.location.href = "/retos"
                    }}
                  >
                    Siguiente reto
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar banner promocional para usuarios no premium en retos gratuitos */}
          {!isPro && isFreeAccess && (
            <div className="mt-6 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-full">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">¿Te gusta este reto?</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Este es uno de nuestros retos gratuitos. Actualiza a Premium para acceder a todos los retos
                    anteriores y desbloquear todas las funcionalidades.
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

          <KeyboardHandler editorRef={editorRef} />
          <ClipboardHelper editorRef={editorRef} />
          <Toaster />
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

