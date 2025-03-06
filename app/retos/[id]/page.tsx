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

// Base de datos simulada para retos
const RETOS_DATA = {
  "1": {
    id: "1",
    title: "Invertir palabras en una cadena",
    description:
      "Dada una cadena de texto, debes invertir cada palabra individualmente, manteniendo el orden original de las palabras. Los espacios entre palabras deben conservarse.",
    difficulty: "Intermedio",
    category: "Cadenas de texto",
    timeLimit: 45,
    initialCode: `// Escribe tu solución aquí
function invertirPalabras(cadena) {
  // Tu código aquí
  
}

// Ejemplos de prueba
console.log(invertirPalabras("Hola mundo")); // Debería mostrar: "aloH odnum"
console.log(invertirPalabras("El gato con botas")); // Debería mostrar: "lE otag noc satob"
`,
    examples: [
      {
        input: "Hola mundo",
        output: "aloH odnum",
      },
      {
        input: "El gato con botas",
        output: "lE otag noc satob",
      },
    ],
    hints: [
      "Puedes dividir la cadena en palabras usando el método split() con un espacio como separador.",
      "Para invertir cada palabra, puedes convertirla en un array de caracteres, invertir el array y luego unirlo de nuevo.",
      "También puedes invertir una palabra recorriéndola de atrás hacia adelante y construyendo una nueva cadena.",
    ],
    testCases: [
      {
        input: "Hola mundo",
        expected: "aloH odnum",
      },
      {
        input: "El gato con botas",
        expected: "lE otag noc satob",
      },
      {
        input: "JavaScript es genial",
        expected: "tpircSavaJ se laineg",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Encontrar el número ausente",
    description: "Encuentra el único número que falta en una secuencia de números consecutivos.",
    difficulty: "Fácil",
    category: "Algoritmos",
    timeLimit: 30,
    initialCode: `// Escribe tu solución aquí
function encontrarNumeroAusente(array) {
  // Tu código aquí
  
}

// Ejemplos de prueba
console.log(encontrarNumeroAusente([1, 2, 3, 5])); // Debería mostrar: 4
console.log(encontrarNumeroAusente([1, 3, 4, 5])); // Debería mostrar: 2
`,
    examples: [
      {
        input: "[1, 2, 3, 5]",
        output: "4",
      },
      {
        input: "[1, 3, 4, 5]",
        output: "2",
      },
    ],
    hints: [
      "Puedes calcular la suma esperada de una secuencia completa y restarle la suma real.",
      "Utiliza fórmula de suma aritmética: n*(n+1)/2 donde n es el último número.",
      "También puedes usar XOR para encontrar el número faltante de manera eficiente.",
    ],
    testCases: [
      {
        input: "[1, 2, 3, 5]",
        expected: 4,
      },
      {
        input: "[1, 3, 4, 5]",
        expected: 2,
      },
      {
        input: "[1, 2, 4, 5, 6]",
        expected: 3,
      },
    ],
  },
}

export default function RetoPage() {
  const params = useParams()
  const id = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [reto, setReto] = useState(null)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [success, setSuccess] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(45 * 60) // 45 minutos en segundos
  const editorRef = useRef(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [username, setUsername] = useState("usuario")

  // Cargar datos del reto desde Supabase
  useEffect(() => {
    const fetchReto = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("retos").select("*").eq("id", id).single()

        if (error) throw error

        if (data) {
          // Asegurarse de que examples, hints y testCases sean arrays
          // Verificar si son JSON válidos antes de intentar parsearlos
          let examples = []
          let hints = []
          let testCases = []

          try {
            if (typeof data.examples === "string") {
              // Verificar si parece un JSON válido
              if (data.examples.trim().startsWith("[") || data.examples.trim().startsWith("{")) {
                examples = JSON.parse(data.examples)
              } else {
                // Si no es JSON, usar un array por defecto
                console.warn("examples no es un JSON válido:", data.examples)
                examples = []
              }
            } else if (Array.isArray(data.examples)) {
              examples = data.examples
            }
          } catch (e) {
            console.error("Error parsing examples:", e)
            examples = []
          }

          try {
            if (typeof data.hints === "string") {
              if (data.hints.trim().startsWith("[") || data.hints.trim().startsWith("{")) {
                hints = JSON.parse(data.hints)
              } else {
                console.warn("hints no es un JSON válido:", data.hints)
                hints = []
              }
            } else if (Array.isArray(data.hints)) {
              hints = data.hints
            }
          } catch (e) {
            console.error("Error parsing hints:", e)
            hints = []
          }

          try {
            if (typeof data.testcases === "string") {
              if (data.testcases.trim().startsWith("[") || data.testcases.trim().startsWith("{")) {
                testCases = JSON.parse(data.testcases)
              } else {
                console.warn("testcases no es un JSON válido:", data.testcases)
                testCases = []
              }
            } else if (Array.isArray(data.testcases)) {
              testCases = data.testcases
            }
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
            examples: examples,
            hints: hints,
            testCases: testCases,
          })
          setCode(data.initialcode)
          setRemainingTime(data.timelimit * 60 || 45 * 60)
        }
      } catch (error) {
        console.error("Error al cargar el reto:", error)
        // Usar datos de ejemplo como fallback
        if (RETOS_DATA[id]) {
          setReto(RETOS_DATA[id])
          setCode(RETOS_DATA[id].initialCode)
          setRemainingTime(RETOS_DATA[id].timeLimit * 60)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchReto()
  }, [id])

  // Formato del tiempo restante
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Simulación de cuenta regresiva
  useEffect(() => {
    if (!reto) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [reto])

  // Función para ejecutar el código
  const runCode = () => {
    if (!reto) return

    setIsRunning(true)
    setOutput("")

    try {
      // Capturar la salida de la consola
      const originalConsoleLog = console.log
      let output = ""

      console.log = (...args) => {
        output += args.join(" ") + "\n"
      }

      // Evaluar el código con seguridad
      const evalCode = new Function(`
        "use strict";
        ${code}
        // Verificar respuestas
        const test1 = typeof invertirPalabras === 'function' && invertirPalabras("Hola mundo") === "aloH odnum";
        const test2 = typeof invertirPalabras === 'function' && invertirPalabras("El gato con botas") === "lE otag noc satob";
        return { output, test1, test2 };
      `)

      const result = evalCode()
      console.log = originalConsoleLog

      // Comprobar si la solución es correcta
      const isCorrect = result.test1 && result.test2
      setSuccess(isCorrect)

      // Establecer la salida
      setTimeout(() => {
        setOutput(
          result.output +
            (isCorrect
              ? "\n✅ ¡Felicidades! Tu solución es correcta."
              : "\n❌ Tu solución no pasa todas las pruebas. Sigue intentando."),
        )
        setIsRunning(false)

        // Si la solución es correcta, mostrar el modal de éxito después de un breve retraso
        if (isCorrect) {
          setTimeout(() => {
            setShowSuccessModal(true)
          }, 1000)
        }
      }, 500)
    } catch (error) {
      setTimeout(() => {
        setOutput(`Error: ${error.message}`)
        setSuccess(false)
        setIsRunning(false)
      }, 500)
    }
  }

  const handleCheckCode = () => {
    runCode()
  }

  const resetCode = () => {
    if (reto) {
      setCode(reto.initialCode)
    }
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
    // Simulación de generación de imagen
    alert("Imagen generada y descargada")
  }

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

  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </InteractiveGridBackground>
    )
  }

  // Mostrar error si no se encuentra el reto
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
          {/* Header con título del reto */}
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

          {/* Tabs para navegación */}
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="descripcion">Descripción</TabsTrigger>
              <TabsTrigger value="pistas">Pistas</TabsTrigger>
            </TabsList>

            {/* Contenido de la pestaña Editor */}
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
                      onChange={(value) => setCode(value)}
                      onMount={(editor, monaco) => {
                        editorRef.current = editor

                        // Configurar el tema para resaltar mejor la sintaxis de JavaScript
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
                        copyWithSyntaxHighlighting: true,
                        mouseWheelZoom: true,
                        contextmenu: true,
                        quickSuggestions: true,
                        ariaLabel: "Editor de código",
                        accessibilitySupport: "on",
                        find: {
                          addExtraSpaceOnTop: false,
                        },
                        clipboard: {
                          copyWithSyntaxHighlighting: true,
                        },
                        // Mejoras para el resaltado de sintaxis
                        language: "javascript",
                        semanticHighlighting: true,
                        bracketPairColorization: { enabled: true },
                        colorDecorators: true,
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
                      <Button size="sm" disabled={isRunning} onClick={handleCheckCode}>
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

            {/* Contenido de la pestaña Descripción */}
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

            {/* Contenido de la pestaña Pistas */}
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

          {/* Modal de éxito */}
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

                  {/* Imagen compartible */}
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

          {/* Añadir el manejador de teclado y el helper de portapapeles */}
          <KeyboardHandler editorRef={editorRef} />
          <ClipboardHelper editorRef={editorRef} />
          <Toaster />
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

