import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Obtener los datos de la solicitud
    const { prompt, difficulty, category } = await req.json()

    // Validar los datos
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Se requiere una descripción o tema para el reto" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
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

    // Llamar a la API de OpenAI
    const result = streamText({
      model: openai("gpt-3.5-turbo"),
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error en la API de Edge:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
        mockData: getMockReto("fallback", "Intermedio", "Programación"),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// Función para generar datos de prueba
function getMockReto(prompt: string, difficulty: string, category: string) {
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

