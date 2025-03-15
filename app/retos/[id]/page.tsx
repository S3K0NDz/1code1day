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
  Lock,
  Terminal,
  Code,
  BookOpen,
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { CodeOutput } from "@/components/code-output"
import KeyboardHandler from "./keyboard-handler"
import ClipboardHelper from "./clipboard-helper"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabaseClient"
import { useAuth } from "@/components/auth-provider"
import { saveCompletedChallenge, toggleSavedChallenge } from "@/lib/db-functions"
import PremiumContentLock from "@/components/premium-content-lock"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RetoPage() {
  // State and hooks remain the same
  const params = useParams()
  const id = params?.id as string
  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth <= 768 || (window.innerWidth >= 768 && window.innerWidth <= 1024))

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
  const [isFreeAccess, setIsFreeAccess] = useState(false)
  const [functionName, setFunctionName] = useState("")
  const [fileName, setFileName] = useState("")
  const [showHints, setShowHints] = useState(false)
  const [activeTab, setActiveTab] = useState("description")

  // All useEffect hooks and functions remain the same
  useEffect(() => {
    const fetchReto = async () => {
      setIsLoading(true)
      try {
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

          const freeAccess = data.free_access === true || Number.parseInt(data.id) % 5 === 0
          setIsFreeAccess(freeAccess)

          let extractedFunctionName = ""
          try {
            const functionMatch = data.initialcode?.match(/function\s+([a-zA-Z0-9_]+)\s*\(/i)
            if (functionMatch && functionMatch[1]) {
              extractedFunctionName = functionMatch[1]
            }
          } catch (e) {
            console.error("Error extracting function name:", e)
          }

          const generatedFileName = extractedFunctionName
            ? `${extractedFunctionName}.js`
            : `${data.title?.toLowerCase().replace(/\s+/g, "-")}.js`

          setFunctionName(extractedFunctionName)
          setFileName(generatedFileName)

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

  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    })

    const editorElement = document.querySelector(".monaco-editor")
    if (editorElement) {
      resizeObserver.observe(editorElement)
    }

    return () => resizeObserver.disconnect()
  }, [editorRef.current])

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

      console.log = (...args) => {
        consoleOutput += args.join(" ") + "\n"
        originalConsoleLog(...args)
      }

      try {
        const userCode = code
        eval(userCode)
      } catch (e) {
        throw new Error(`Error al ejecutar el código: ${e.message}`)
      }

      console.log = originalConsoleLog
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

      console.log = (...args) => {
        consoleOutput += args.join(" ") + "\n"
        originalConsoleLog(...args)
      }

      const functionNameMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/)
      if (!functionNameMatch) {
        throw new Error("No se encontró ninguna función en tu código. Asegúrate de definir una función.")
      }

      const functionName = functionNameMatch[1]

      try {
        const wrappedCode = `
          (function() {
            ${code}
            window["${functionName}"] = ${functionName};
          })();
        `

        eval(wrappedCode)

        if (typeof window[functionName] !== "function") {
          throw new Error(`La función ${functionName} no está definida correctamente.`)
        }
      } catch (e) {
        throw new Error(`Error al ejecutar el código: ${e.message}`)
      }

      console.log = originalConsoleLog

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
            let args = test.input

            if (typeof args === "string" && args.includes(",")) {
              args = args.split(",").map((arg) => {
                const trimmed = arg.trim()
                const num = Number(trimmed)
                return isNaN(num) ? trimmed : num
              })
              result = window[functionName](...args)
            } else {
              result = window[functionName](args)
            }

            const resultStr = String(result)
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
        try {
          if (user) {
            const challengeData = {
              user_id: user.id,
              challenge_id: id,
              completed_at: new Date().toISOString(),
              code: code,
              is_saved: isSaved,
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
    await handleCheckCode()

    if (success) {
      try {
        if (user) {
          const challengeData = {
            user_id: user.id,
            challenge_id: id,
            completed_at: new Date().toISOString(),
            code: code,
            is_saved: isSaved,
          }

          const result = await saveCompletedChallenge(challengeData)

          if (!result.success) {
            throw new Error("No se pudo guardar la solución")
          }

          toast({
            title: "Solución guardada",
            description: "Tu solución ha sido guardada correctamente.",
          })

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
        shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
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
    const shareCard = document.getElementById("share-card")
    if (!shareCard) return

    toast({
      title: "Función no implementada",
      description: "La descarga de imágenes estará disponible próximamente.",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    const lowerDifficulty = typeof difficulty === "string" ? difficulty.toLowerCase() : ""

    if (lowerDifficulty.includes("fácil") || lowerDifficulty.includes("facil")) {
      return "bg-green-500 text-white"
    } else if (lowerDifficulty.includes("intermedio") || lowerDifficulty.includes("medio")) {
      return "bg-orange-500 text-white"
    } else if (lowerDifficulty.includes("difícil") || lowerDifficulty.includes("dificil")) {
      return "bg-red-500 text-white"
    } else {
      return "bg-blue-500 text-white"
    }
  }

  if (authLoading || isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InteractiveGridBackground>
    )
  }

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

  // Mobile version with tabs
  if (isMobile) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex flex-col">
          <NavbarWithUser />
          <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
            {/* Header con navegación */}
            <div className="flex items-center justify-between mb-4">
              <Link href="/retos">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-yellow-500" />
                <span className="font-medium text-sm">{formatTime(remainingTime)}</span>
              </div>
            </div>

            {/* Cabecera del reto */}
            <div className="bg-[#121212] rounded-lg overflow-hidden border border-gray-800 mb-4">
              <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono">{fileName}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h1 className="font-bold text-white text-lg">{reto.title}</h1>
                  <Badge className={`${getDifficultyColor(reto.difficulty)} ml-2 shrink-0 text-xs`}>
                    {reto.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tabs for mobile */}
            <Tabs defaultValue="description" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="hints">Pistas</TabsTrigger>
              </TabsList>

              {/* Description tab content remains the same */}
              <TabsContent value="description" className="flex-1 overflow-auto">
                <div className="bg-[#121212] rounded-lg border border-gray-800 p-4">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-2 text-white">Descripción</h2>
                      <p className="text-gray-400">{reto.description}</p>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold mb-2 text-white">Ejemplos</h2>
                      <div className="space-y-3">
                        {reto.examples.map((example: any, index: number) => (
                          <div key={index} className="bg-[#1e1e1e] p-3 rounded-md">
                            <p className="text-sm font-mono mb-1.5 text-gray-300">Ejemplo {index + 1}:</p>
                            <p className="text-sm font-mono mb-1">
                              <span className="text-gray-400">Entrada:</span>{" "}
                              <span className="text-green-400">{example.input}</span>
                            </p>
                            <p className="text-sm font-mono">
                              <span className="text-gray-400">Salida:</span>{" "}
                              <span className="text-blue-400">{example.output}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón de guardar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleSave}
                      className={`w-full ${isSaved ? "bg-primary/10" : ""}`}
                    >
                      {isSaved ? "Quitar de guardados" : "Guardar reto"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Editor tab with console below */}
              <TabsContent value="editor" className="flex-1 flex flex-col space-y-4">
                {/* Editor container */}
                <div className="flex-1 min-h-[300px] border border-gray-800 rounded-md overflow-hidden bg-[#1e1e1e]">
                  <div className="bg-[#1e1e1e] px-4 py-2 text-sm font-medium border-b border-gray-800 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Editor</span>
                  </div>
                  <div style={{ height: "calc(100% - 40px)", minHeight: "260px" }}>
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      onMount={(editor) => {
                        editorRef.current = editor
                        // Force layout updates
                        setTimeout(() => {
                          editor.layout()
                          const editorElement = editor.getDomNode()
                          if (editorElement) {
                            editorElement.style.height = "260px"
                          }
                        }, 100)
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        folding: true,
                        automaticLayout: true,
                        wordWrap: "on",
                      }}
                    />
                  </div>
                </div>

                {/* Console below editor */}
                <div className="h-[200px] border border-gray-800 rounded-md overflow-hidden bg-[#121212]">
                  <div className="bg-[#1e1e1e] px-4 py-2 text-sm font-medium border-b border-gray-800 flex items-center">
                    <Terminal className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Consola</span>
                  </div>
                  <div className="h-[calc(100%-40px)]">
                    {isRunning ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      <CodeOutput value={output || "Ejecuta tu código para ver los resultados"} height="100%" />
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Reiniciar
                  </Button>
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
              </TabsContent>

              {/* Hints tab content remains the same */}
              <TabsContent value="hints" className="flex-1 overflow-auto">
                <div className="bg-[#121212] rounded-lg border border-gray-800 p-4">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold mb-2 text-white">Pistas</h2>
                    {reto.hints && reto.hints.length > 0 ? (
                      <div className="space-y-3">
                        {reto.hints.map((hint: string, index: number) => (
                          <div key={index} className="bg-[#1e1e1e] p-3 rounded-md">
                            <h3 className="font-medium mb-1 text-white">Pista {index + 1}</h3>
                            <p className="text-gray-400">{hint}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No hay pistas disponibles para este reto.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Mostrar banner promocional para usuarios no premium en retos gratuitos */}
            {!isPro && isFreeAccess && (
              <div className="mt-4 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-full shrink-0">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">¿Te gusta este reto?</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Este es uno de nuestros retos gratuitos. Actualiza a Premium para acceder a todos los retos.
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
          </div>

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-black border border-border rounded-lg max-w-lg w-full overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    ¡Reto completado!
                  </h3>
                  <button onClick={() => setShowSuccessModal(false)} className="text-muted-foreground hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="text-center">
                    <div className="mb-4 text-base">
                      ¡Felicidades, <span className="font-bold">{username}</span>!
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Has completado exitosamente el reto <span className="font-bold">{reto.title}</span>.
                    </p>
                  </div>
                  <div className="relative border border-border rounded-lg overflow-hidden" id="share-card">
                    <div className="p-4 flex flex-col items-center justify-center min-h-[180px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                        <span className="text-base font-semibold flex items-center gap-1">
                          <span className="bg-white text-black px-2">1code</span>
                          <span className="text-white">1day</span>
                        </span>
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-lg font-bold mb-1">{username}</div>
                        <div className="text-xs text-muted-foreground">ha completado el reto</div>
                        <div className="text-lg font-bold mt-1">{reto.title}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(reto.difficulty)}`}>
                        {reto.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-4">¡Comparte tu logro con el mundo!</p>
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("twitter")}
                        title="Compartir en Twitter"
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("facebook")}
                        title="Compartir en Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare("linkedin")}
                        title="Compartir en LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex justify-between items-center">
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

          <KeyboardHandler editorRef={editorRef} />
          <ClipboardHelper editorRef={editorRef} />
          <Toaster />
        </div>
      </InteractiveGridBackground>
    )
  }

  // Versión desktop con layout de dos columnas
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex flex-col">
        <NavbarWithUser />
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          {/* Header con navegación */}
          <div className="flex items-center mb-4">
            <Link href="/retos">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Volver</span>
              </Button>
            </Link>
          </div>

          {/* Contenedor principal con grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">
            {/* Panel izquierdo: Descripción del reto con pestañas */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="bg-[#121212] rounded-lg overflow-hidden border border-gray-800 flex flex-col h-full">
                {/* Header con nombre de archivo */}
                <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-300 font-mono">{fileName}</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* Cabecera del reto */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <h1 className="font-bold text-white text-xl">{reto.title}</h1>
                    <Badge className={`${getDifficultyColor(reto.difficulty)} ml-2 shrink-0`}>{reto.difficulty}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1.5 text-yellow-500" />
                      <span className="font-medium">{formatTime(remainingTime)}</span>
                    </div>

                    {/* Indicador de Premium o Gratuito */}
                    {!isPro &&
                      (isFreeAccess ? (
                        <Badge className="bg-green-500 text-white">Gratuito</Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Premium
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Tabs para escritorio */}
                <Tabs defaultValue="description" className="flex-1 flex flex-col">
                  <div className="border-b border-gray-800">
                    <TabsList className="flex w-full bg-transparent p-0">
                      <TabsTrigger
                        value="description"
                        className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                      >
                        Descripción
                      </TabsTrigger>
                      <TabsTrigger
                        value="hints"
                        className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                      >
                        Pistas
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Tab de descripción */}
                  <TabsContent value="description" className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-semibold mb-2 text-white">Descripción</h2>
                        <p className="text-gray-400">{reto.description}</p>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold mb-2 text-white">Ejemplos</h2>
                        <div className="space-y-3">
                          {reto.examples.map((example: any, index: number) => (
                            <div key={index} className="bg-[#1e1e1e] p-3 rounded-md">
                              <p className="text-sm font-mono mb-1.5 text-gray-300">Ejemplo {index + 1}:</p>
                              <p className="text-sm font-mono mb-1">
                                <span className="text-gray-400">Entrada:</span>{" "}
                                <span className="text-green-400">{example.input}</span>
                              </p>
                              <p className="text-sm font-mono">
                                <span className="text-gray-400">Salida:</span>{" "}
                                <span className="text-blue-400">{example.output}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab de pistas */}
                  <TabsContent value="hints" className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold mb-2 text-white">Pistas</h2>
                      {reto.hints && reto.hints.length > 0 ? (
                        <div className="space-y-3">
                          {reto.hints.map((hint: string, index: number) => (
                            <div key={index} className="bg-[#1e1e1e] p-3 rounded-md">
                              <h3 className="font-medium mb-1 text-white">Pista {index + 1}</h3>
                              <p className="text-gray-400">{hint}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No hay pistas disponibles para este reto.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Acciones del reto */}
                <div className="p-3 border-t border-gray-800 bg-[#1e1e1e]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSave}
                    className={`w-full ${isSaved ? "bg-primary/10" : ""}`}
                  >
                    {isSaved ? "Quitar de guardados" : "Guardar reto"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Panel derecho: Editor y consola */}
            <div className="lg:col-span-3 flex flex-col">
              <div className="flex flex-col h-full gap-4">
                {/* Editor de código */}
                <div className="flex-1 border border-gray-800 rounded-md overflow-hidden bg-[#1e1e1e] min-h-[500px]">
                  <div className="bg-[#1e1e1e] px-4 py-2 text-sm font-medium border-b border-gray-800 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Editor</span>
                  </div>
                  <div className="h-[calc(100%-40px)]">
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
                </div>

                {/* Consola de salida */}
                <div className="h-64 border border-gray-800 rounded-md overflow-hidden bg-[#121212]">
                  <div className="bg-[#1e1e1e] px-4 py-2 text-sm font-medium border-b border-gray-800 flex items-center">
                    <Terminal className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-300">Consola</span>
                  </div>
                  <div className="h-[calc(100%-40px)]">
                    {isRunning ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      <CodeOutput value={output || "Ejecuta tu código para ver los resultados"} height="100%" />
                    )}
                  </div>
                </div>

                {/* Barra de acciones */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={resetCode} className="flex-1 sm:flex-none">
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Reiniciar
                  </Button>
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
                  <Button size="sm" onClick={handleSubmit} disabled={isRunning} className="flex-1 sm:flex-none">
                    <Save className="h-4 w-4 mr-1.5" />
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </div>

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

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-black border border-border rounded-lg max-w-lg w-full overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                    ¡Reto completado!
                  </h3>
                  <button onClick={() => setShowSuccessModal(false)} className="text-muted-foreground hover:text-white">
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="mb-4 text-base sm:text-lg">
                      ¡Felicidades, <span className="font-bold">{username}</span>!
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Has completado exitosamente el reto <span className="font-bold">{reto.title}</span>.
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
                        <div className="text-xs sm:text-sm text-muted-foreground">ha completado el reto</div>
                        <div className="text-lg sm:text-xl font-bold mt-1">{reto.title}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(reto.difficulty)}`}>
                        {reto.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">¡Comparte tu logro con el mundo!</p>
                    <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleShare("twitter")}
                        title="Compartir en X"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                          <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1122 12.8955L4 20H5.38119L10.7254 13.7878L14.994 20H19.656L13.3174 10.7749ZM11.4257 12.9738L10.8064 12.0881L5.87886 5.03974H8.00029L11.9769 10.728L12.5962 11.6137L17.7646 19.0075H15.6432L11.4257 12.9738Z" />
                        </svg>
                        <span className="sr-only">Compartir en X</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleShare("facebook")}
                        title="Compartir en Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Compartir en Facebook</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleShare("linkedin")}
                        title="Compartir en LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">Compartir en LinkedIn</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex justify-between items-center">
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

          <KeyboardHandler editorRef={editorRef} />
          <ClipboardHelper editorRef={editorRef} />
          <Toaster />
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

