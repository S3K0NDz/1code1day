"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
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
import { supabase } from "@/utils/supabaseClient"

export default function RetoPage() {
  const params = useParams()
  const id = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [reto, setReto] = useState(null)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [success, setSuccess] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(45 * 60)
  const editorRef = useRef(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [username, setUsername] = useState("usuario")
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    const fetchReto = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("retos").select("*").eq("id", id).single()

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
          })
          setCode(data.initialcode)
          setRemainingTime((data.timelimit || 45) * 60)

          // Fetch user data if needed
          const fetchUserData = async () => {
            try {
              const { data: userData } = await supabase.auth.getUser()
              if (userData?.user) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("username")
                  .eq("id", userData.user.id)
                  .single()

                if (profile?.username) {
                  setUsername(profile.username)
                }
              }
            } catch (error) {
              console.error("Error fetching user data:", error)
            }
          }

          fetchUserData()
        }
      } catch (error) {
        console.error("Error al cargar el reto:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReto()
  }, [id])

  const formatTime = (seconds) => {
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

      // Capture console.log output
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "\n"
      }

      // Create a sandbox to execute the code
      const evalFunction = new Function(`
        "use strict";
        ${code}
        return "Código ejecutado exitosamente";
      `)

      const result = evalFunction()
      console.log = originalConsoleLog

      setOutput(consoleOutput || result)
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

      // Capture console.log output
      console.log = (...args) => {
        consoleOutput += args.join(" ") + "\n"
      }

      // Create a sandbox to execute the code and extract the functions
      const evalFunction = new Function(`
        "use strict";
        ${code}

        // Return an object with all the functions that might be needed for testing
        return {
          invertirPalabras: typeof invertirPalabras === 'function' ? invertirPalabras : null,
          encontrarNumeroAusente: typeof encontrarNumeroAusente === 'function' ? encontrarNumeroAusente : null,
          // Add other functions as needed based on challenge requirements
          ...Object.fromEntries(
            Object.getOwnPropertyNames(this)
              .filter(name => typeof this[name] === 'function' && !name.startsWith('_'))
              .map(name => [name, this[name]])
          )
        };
      `)

      const functions = evalFunction()
      console.log = originalConsoleLog

      // Process test cases
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
            // Determine which function to call based on the challenge
            if (reto.id === "1" && functions.invertirPalabras) {
              result = functions.invertirPalabras(test.input)
            } else if (reto.id === "2" && functions.encontrarNumeroAusente) {
              result = functions.encontrarNumeroAusente(
                typeof test.input === "string" ? JSON.parse(test.input) : test.input,
              )
            } else {
              // Try to find a function that matches the test case
              const functionName = Object.keys(functions).find(
                (name) => functions[name] && typeof functions[name] === "function",
              )

              if (functionName && functions[functionName]) {
                result = functions[functionName](
                  typeof test.input === "string" && test.input.startsWith("[") ? JSON.parse(test.input) : test.input,
                )
              } else {
                throw new Error("No se encontró la función requerida")
              }
            }

            // Compare result with expected output
            const expected =
              typeof test.expected === "string" && test.expected.startsWith("[")
                ? JSON.parse(test.expected)
                : test.expected

            passed = JSON.stringify(result) === JSON.stringify(expected)
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

          testOutput += `Test ${i + 1}: ${passed ? "✅" : "❌"}\n`
          testOutput += `Entrada: ${JSON.stringify(test.input)}\n`
          testOutput += `Esperado: ${JSON.stringify(test.expected)}\n`
          testOutput += `Obtenido: ${result !== undefined ? JSON.stringify(result) : "undefined"}\n`
          if (error) testOutput += `Error: ${error}\n`
          testOutput += "\n"

          allTestsPassed = allTestsPassed && passed
        }
      } else {
        testOutput = "No hay tests definidos para este reto.\n"
      }

      setTestResults(testResults)
      setOutput(consoleOutput + "\n" + testOutput)
      setSuccess(allTestsPassed)

      if (allTestsPassed) {
        // Save completion status if all tests passed
        try {
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            await supabase.from("user_challenges").upsert({
              user_id: userData.user.id,
              challenge_id: id,
              completed_at: new Date().toISOString(),
              code: code,
            })
          }
        } catch (error) {
          console.error("Error saving completion status:", error)
        }

        setTimeout(() => setShowSuccessModal(true), 1000)
      }
    } catch (error) {
      setOutput(`Error en la ejecución: ${error.message}`)
      setSuccess(false)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    // First check if all tests pass
    await handleCheckCode()

    // If successful, save the solution
    if (success) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          const { error } = await supabase.from("user_challenges").upsert({
            user_id: userData.user.id,
            challenge_id: id,
            completed_at: new Date().toISOString(),
            code: code,
          })

          if (error) throw error

          // Show success modal
          setShowSuccessModal(true)
        }
      } catch (error) {
        console.error("Error al guardar la solución:", error)
        setOutput(output + "\n\nError al guardar la solución: " + error.message)
      }
    }
  }

  const resetCode = () => {
    if (reto) setCode(reto.initialCode)
  }

  const handleShare = (platform) => {
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
    alert("Imagen generada y descargada")

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

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                      onMount={(editor, monaco) => {
                        editorRef.current = editor
                        monaco.editor.defineTheme("vibrant-js", {
                          base: "vs-dark",
                          inherit: true,
                          rules: [
                            { token: "comment", foreground: "6A9955", fontStyle: "italic" },
                            { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
                            { token: "string", foreground: "CE9178" },
                            { token: "number", foreground: "B5CEA8" },
                            { token: "function", foreground: "DCDCAA" },
                            { token: "variable", foreground: "9CDCFE" },
                            { token: "operator", foreground: "D4D4D4" },
                          ],
                          colors: {
                            "editor.background": "#1E1E1E",
                            "editor.foreground": "#D4D4D4",
                            "editorLineNumber.foreground": "#858585",
                            "editor.selectionBackground": "#264F78",
                            "editor.lineHighlightBackground": "#2A2D2E",
                          },
                        })
                        monaco.editor.setTheme("vibrant-js")
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
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{reto.description}</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Ejemplos</h3>
                  <div className="space-y-3">
                    {reto.examples.map((example, index) => (
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
                  {reto.hints.map((hint, index) => (
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

          <KeyboardHandler editorRef={editorRef} />
          <ClipboardHelper editorRef={editorRef} />
          <Toaster />
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

