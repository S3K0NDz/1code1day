import { NextResponse } from "next/server"
import { Resend } from "resend"
import { supabase } from "@/lib/supabase"

// Inicializar el cliente de Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    // Verificar la clave secreta para asegurar que solo Supabase puede llamar a esta API
    const { authorization } = req.headers
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET

    if (authorization !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener los datos del reto diario desde el cuerpo de la solicitud
    const { record } = await req.json()

    if (!record || !record.id) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Obtener los detalles completos del reto
    const { data: challenge, error: challengeError } = await supabase
      .from("retos")
      .select("*")
      .eq("id", record.id)
      .single()

    if (challengeError || !challenge) {
      console.error("Error fetching challenge details:", challengeError)
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Obtener usuarios que han optado por recibir notificaciones por correo
    // Asumimos que hay una columna 'email_notifications' en la tabla 'profiles'
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email_notifications", true)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users to notify" }, { status: 200 })
    }

    // Enviar correos electrónicos a todos los usuarios
    const emailPromises = users.map(async (user) => {
      try {
        // Obtener el correo electrónico del usuario desde auth.users si no está en profiles
        let userEmail = user.email
        if (!userEmail) {
          const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
          userEmail = authUser?.user?.email
        }

        if (!userEmail) {
          console.warn(`No email found for user ${user.id}`)
          return null
        }

        // Crear el contenido del correo
        const emailData = {
          from: "1code1day <notificaciones@1code1day.com>",
          to: userEmail,
          subject: `¡Nuevo reto diario disponible: ${challenge.title}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0;">1code1day</h1>
                <p style="margin: 5px 0 0;">Tu reto diario de programación</p>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
                <h2 style="color: #333;">¡Nuevo reto disponible!</h2>
                <p>Hola,</p>
                <p>Hay un nuevo reto diario esperándote: <strong>${challenge.title}</strong></p>
                <p>Dificultad: ${challenge.difficulty}</p>
                <p>Categoría: ${challenge.category}</p>
                <div style="margin: 25px 0; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reto-diario" style="background-color: #4a65ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Resolver el reto ahora
                  </a>
                </div>
                <p>¡Buena suerte!</p>
              </div>
              <div style="padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>Si no deseas recibir más notificaciones, puedes <a href="${process.env.NEXT_PUBLIC_SITE_URL}/perfil/editar" style="color: #4a65ff;">actualizar tus preferencias</a>.</p>
              </div>
            </div>
          `,
        }

        // Enviar el correo
        const { data, error } = await resend.emails.send(emailData)

        if (error) {
          console.error(`Error sending email to ${userEmail}:`, error)
          return { email: userEmail, success: false, error }
        }

        return { email: userEmail, success: true, data }
      } catch (err) {
        console.error(`Error in email process for user ${user.id}:`, err)
        return { email: user.id, success: false, error: err }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter((r) => r && r.success).length

    return NextResponse.json({
      message: `Successfully sent ${successCount} of ${users.length} emails`,
      results,
    })
  } catch (error) {
    console.error("Error in send-daily-challenge-email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

