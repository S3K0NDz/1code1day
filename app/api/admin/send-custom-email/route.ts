import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyAdminToken } from "@/lib/admin-auth"
import { getDailyChallenge } from "@/lib/get-daily-challenge"
import { Resend } from "resend"

// Inicializar Resend para enviar correos
const resend = new Resend(process.env.RESEND_API_KEY)

// Cliente de Supabase con la clave de servicio para operaciones administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // Obtener datos de la solicitud
    const { token, subject, content, recipientType, selectedUsers, includeUnsubscribed, includeDailyChallenge } =
      await request.json()

    // Verificar si el token pertenece a un administrador
    const isAdmin = await verifyAdminToken(token)

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado. No tienes permisos de administrador." }, { status: 403 })
    }

    // Obtener el reto diario si se solicita
    let dailyChallenge = null
    if (includeDailyChallenge) {
      dailyChallenge = await getDailyChallenge()
      if (!dailyChallenge) {
        return NextResponse.json({ error: "No se pudo obtener la información del reto diario." }, { status: 500 })
      }
    }

    // Obtener usuarios según el tipo de destinatario
    let users = []

    if (recipientType === "specific") {
      // Obtener usuarios específicos
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

      if (authError) {
        console.error("Error al obtener usuarios:", authError)
        return NextResponse.json({ error: "Error al obtener la lista de usuarios" }, { status: 500 })
      }

      users = authUsers.users.filter((user) => selectedUsers.includes(user.id))
    } else {
      // Obtener todos los usuarios
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

      if (authError) {
        console.error("Error al obtener usuarios:", authError)
        return NextResponse.json({ error: "Error al obtener la lista de usuarios" }, { status: 500 })
      }

      // Obtener información adicional de los perfiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, email_notifications")

      if (profilesError) {
        console.error("Error al obtener perfiles:", profilesError)
        return NextResponse.json({ error: "Error al obtener la información de perfiles" }, { status: 500 })
      }

      // Filtrar usuarios según el tipo de destinatario
      users = authUsers.users.filter((user) => {
        const profile = profiles.find((p) => p.id === user.id) || {}

        // Si no se incluyen los usuarios que han desactivado las notificaciones
        if (!includeUnsubscribed && profile.email_notifications === false) {
          return false
        }

        // Filtrar por tipo de usuario
        if (recipientType === "premium") {
          // Verificar si el usuario tiene una suscripción activa
          // Nota: Esto depende de cómo se almacena la información de suscripción en tu base de datos
          return user.user_metadata?.is_subscribed === true
        } else if (recipientType === "free") {
          // Verificar si el usuario no tiene una suscripción activa
          return user.user_metadata?.is_subscribed !== true
        }

        // Para "all", incluir todos los usuarios
        return true
      })
    }

    // Enviar correos
    let sentCount = 0
    const errors = []

    for (const user of users) {
      try {
        // Personalizar el contenido del correo si es necesario
        let emailContent = content

        // Si se incluye el reto diario, reemplazar los marcadores de posición
        if (dailyChallenge && includeDailyChallenge) {
          // Verificar que dailyChallenge tiene la estructura esperada
          if (!dailyChallenge.title) {
            console.log("Estructura de dailyChallenge:", JSON.stringify(dailyChallenge, null, 2))
            console.warn("El reto diario no tiene la estructura esperada. Usando valores por defecto.")

            // Usar valores por defecto si no se encuentra la estructura esperada
            emailContent = emailContent
              .replace("{{CHALLENGE_TITLE}}", "Reto del día")
              .replace("{{CHALLENGE_DESCRIPTION}}", "Descripción no disponible")
              .replace("{{CHALLENGE_DIFFICULTY}}", "Intermedio")
              .replace("{{CHALLENGE_CATEGORY}}", "Programación")
              .replace(
                "{{CHALLENGE_DATE}}",
                new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              )
          } else {
            // Usar la nueva estructura directamente
            emailContent = emailContent
              .replace("{{CHALLENGE_TITLE}}", dailyChallenge.title || "Reto del día")
              .replace("{{CHALLENGE_DESCRIPTION}}", dailyChallenge.description || "Descripción no disponible")
              .replace("{{CHALLENGE_DIFFICULTY}}", dailyChallenge.difficulty || "Intermedio")
              .replace("{{CHALLENGE_CATEGORY}}", dailyChallenge.category || "Programación")
              .replace(
                "{{CHALLENGE_DATE}}",
                dailyChallenge.date ||
                  new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
              )
          }
        }

        await resend.emails.send({
          from: "1Code1Day <no-reply@1code1day.app>",
          to: user.email,
          subject: subject,
          html: emailContent,
        })

        sentCount++
      } catch (error) {
        console.error(`Error al enviar correo a ${user.email}:`, error)
        errors.push({
          email: user.email,
          error: error.message || "Error desconocido",
        })
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalUsers: users.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error al enviar correos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

