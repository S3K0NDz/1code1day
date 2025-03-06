import { NextResponse } from "next/server"
import OpenAI from "openai"

// Función para generar datos de prueba
function getMockReto(prompt: string, difficulty: string, category: string) {
  console.log("Generando datos de prueba como fallback")
  return {
    title: `Reto: ${prompt.slice(0, 30)}${prompt.length > 30 ? "..." : ""}`,
    description: `Este es un reto generado a partir de: "${prompt}". La descripción completa del problema iría aquí, explicando el contexto, los requisitos y las restricciones.`,
    difficulty: difficulty || "Intermedio",
    category: category || "JavaScript",
    initialCode: "function solucion(input) {\n  // Tu código aquí\n  \n  return resultado;\n}",
    examples: [
      { input: "Ejemplo 1", output: "Resultado 1" },
      { input: "Ejemplo 2", output: "Resultado 2" },
    ],
    hints: [
      "Piensa en cómo dividir el problema en partes más pequeñas.",
      "Considera usar un enfoque recursivo.",
      "No olvides manejar los casos extremos.",
    ],
    testCases: [
      { input: "Test 1", expected: "Resultado 1" },
      { input: "Test 2", expected: "Resultado 2" },
      { input: "Test 3", expected: "Resultado 3" },
    ],
  }
}

// Inicializar el cliente de OpenAI solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    console.log("Iniciando solicitud POST a /api/generate-reto")

    // Obtener los datos de la solicitud
    const requestData = await request.json()
    const { prompt, difficulty, category } = requestData

    console.log("Datos recibidos:", { prompt: prompt?.substring(0, 50) + "...", difficulty, category })

    // Validar los datos
    if (!prompt) {
      return NextResponse.json({ error: "Se requiere una descripción o tema para el reto" }, { status: 400 })
    }

    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY no está configurada")
      // Devolver datos de prueba si no hay API key
      return NextResponse.json(getMockReto(prompt, difficulty, category))
    }

    // Construir el prompt para OpenAI
    const systemPrompt = `Eres un experto en programación y creación de retos de código. 
    Genera un reto de programación completo basado en la descripción proporcionada.
    El reto debe tener una dificultad: ${difficulty}.
    ${category ? `El reto debe estar relacionado con la categoría: ${category}.` : ""}
    
    Devuelve SOLO un objeto JSON con la siguiente estructura, sin texto adicional:
    {
      "title": "Título del reto",
      "description": "Descripción detallada del problema",
      "difficulty": "${difficulty}",
      "category": "${category || "Programación"}",
      "initialCode": "Código inicial que el usuario debe completar",
      "examples": [
        {"input": "ejemplo1", "output": "resultado1"},
        {"input": "ejemplo2", "output": "resultado2"}
      ],
      "hints": [
        "Primera pista para resolver el reto",
        "Segunda pista para resolver el reto"
      ],
      "testCases": [
        {"input": "test1", "expected": "resultado1"},
        {"input": "test2", "expected": "resultado2"}
      ]
    }`

    try {
      console.log("Llamando a la API de OpenAI...")

      // Llamar a la API de OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      console.log("Respuesta recibida de OpenAI")

      // Obtener la respuesta
      const responseContent = completion.choices[0].message.content

      if (!responseContent) {
        console.error("OpenAI devolvió una respuesta vacía")
        // Devolver datos de prueba si la respuesta está vacía
        return NextResponse.json(getMockReto(prompt, difficulty, category))
      }

      // Intentar parsear la respuesta como JSON
      try {
        console.log("Procesando respuesta:", responseContent.substring(0, 100) + "...")

        // Extraer el JSON si está envuelto en backticks
        let jsonString = responseContent

        // Buscar si hay un bloque de código JSON
        const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/) || jsonString.match(/```\n([\s\S]*?)\n```/)

        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1]
          console.log("JSON extraído de bloque de código")
        }

        // Limpiar el string antes de parsearlo
        jsonString = jsonString.trim()

        // Si el string no comienza con { o [, podría no ser JSON
        if (!jsonString.startsWith("{") && !jsonString.startsWith("[")) {
          console.warn("La respuesta no parece ser JSON válido:", jsonString)
          // Devolver datos de prueba si la respuesta no es JSON válido
          return NextResponse.json(getMockReto(prompt, difficulty, category))
        }

        const retoData = JSON.parse(jsonString)
        console.log("JSON parseado correctamente")
        return NextResponse.json(retoData)
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError, "Response:", responseContent)
        // Devolver datos de prueba si no podemos parsear la respuesta
        return NextResponse.json(getMockReto(prompt, difficulty, category))
      }
    } catch (openaiError) {
      console.error("Error calling OpenAI API:", openaiError)
      // Devolver datos de prueba si hay un error al llamar a la API
      return NextResponse.json(getMockReto(prompt, difficulty, category))
    }
  } catch (error) {
    console.error("Error general en generate-reto API:", error)
    // Devolver datos de prueba en caso de error general
    return NextResponse.json(getMockReto("fallback", "Intermedio", "Programación"))
  }
}

// Ruta GET para pruebas
export async function GET() {
  return NextResponse.json(getMockReto("Factorial", "Intermedio", "Algoritmos"))
}

