// Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SITE_URL = Deno.env.get("SITE_URL") || "https://1code1day.vercel.app"
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")

serve(async (req) => {
  try {
    // Verificar que la solicitud es un evento de base de datos
    const payload = await req.json()

    // Verificar si es una inserción o actualización en la tabla 'retos'
    // y si el reto tiene una fecha diaria (daily_date) para hoy o mañana
    if (payload.table === "retos" && (payload.type === "INSERT" || payload.type === "UPDATE")) {
      const record = payload.record

      // Verificar si es un reto diario (tiene daily_date)
      if (record.daily_date && record.published === true) {
        // Verificar si la fecha es para hoy o mañana
        const dailyDate = new Date(record.daily_date)
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Formatear fechas para comparación (YYYY-MM-DD)
        const formatDate = (date: Date) => date.toISOString().split("T")[0]
        const dailyDateStr = formatDate(dailyDate)
        const todayStr = formatDate(now)
        const tomorrowStr = formatDate(tomorrow)

        if (dailyDateStr === todayStr || dailyDateStr === tomorrowStr) {
          // Es un reto para hoy o mañana, enviar notificación
          const response = await fetch(`${SITE_URL}/api/send-daily-challenge-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${WEBHOOK_SECRET}`,
            },
            body: JSON.stringify({ record }),
          })

          const result = await response.json()

          return new Response(JSON.stringify({ success: true, message: "Notification sent", result }), {
            headers: { "Content-Type": "application/json" },
          })
        }
      }
    }

    // Si no es un evento relevante, simplemente responder OK
    return new Response(JSON.stringify({ success: true, message: "No notification needed" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing webhook:", error)

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

