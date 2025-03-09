import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase con la clave de servicio para operaciones administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function getDailyChallenge() {
  try {
    // Obtener la fecha actual
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Formatear la fecha para la consulta
    const formattedDate = today.toISOString().split("T")[0]

    console.log("Buscando reto para la fecha:", formattedDate)

    // Consultar el reto programado para hoy
    const { data, error } = await supabaseAdmin
      .from("retos")
      .select("*")
      .eq("published", true)
      .filter("daily_date", "gte", formattedDate + "T00:00:00")
      .filter("daily_date", "lt", formattedDate + "T23:59:59")
      .order("daily_date", { ascending: true })
      .limit(1)

    console.log("Resultado de la consulta:", data)

    if (error) {
      console.error("Error al obtener el reto diario:", error)
      return null
    }

    if (data && data.length > 0) {
      const dailyReto = data[0]

      // Parsear los campos JSON si es necesario
      let examples = []
      let hints = []
      let testCases = []

      try {
        examples = typeof dailyReto.examples === "string" ? JSON.parse(dailyReto.examples) : dailyReto.examples || []
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

      // Devolver los datos del reto
      return {
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
      }
    }

    return null
  } catch (error) {
    console.error("Error al obtener el reto diario:", error)
    return null
  }
}

