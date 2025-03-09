import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

// Inicializar Resend para enviar correos
const resend = new Resend(process.env.RESEND_API_KEY)

// Crear cliente de Supabase con la clave de servicio para operaciones administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    // Verificar que el usuario es administrador
    const requestUrl = new URL(request.url)
    const requestHeaders = new Headers(request.headers)
    const cookies = requestHeaders.get("cookie")

    // Crear cliente de Supabase con la cookie para verificar la sesión
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            cookie: cookies,
          },
        },
      },
    )

    // Obtener la sesión del usuario
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "No autorizado. Debes iniciar sesión." }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || !userData.is_admin) {
      return NextResponse.json({ error: "No autorizado. No tienes permisos de administrador." }, { status: 403 })
    }

    // Obtener los datos del cuerpo de la solicitud
    const { subject, content, recipientType, selectedUsers, includeUnsubscribed } = await request.json()

    // Validar los datos
    if (!subject || !content) {
      return NextResponse.json({ error: "El asunto y el contenido son obligatorios" }, { status: 400 })
    }

    if (recipientType === "specific" && (!selectedUsers || selectedUsers.length === 0)) {
      return NextResponse.json({ error: "Debes seleccionar al menos un usuario" }, { status: 400 })
    }

    // Obtener los usuarios según el tipo de destinatario
    let usersQuery = supabaseAdmin.from("profiles").select("id, email, email_notifications")

    if (recipientType === "premium") {
      usersQuery = usersQuery.eq("is_subscribed", true)
    } else if (recipientType === "free") {
      usersQuery = usersQuery.eq("is_subscribed", false)
    } else if (recipientType === "specific") {
      usersQuery = usersQuery.in("id", selectedUsers)
    }

    // Si no se incluyen los usuarios que han desactivado las notificaciones
    if (!includeUnsubscribed) {
      usersQuery = usersQuery.eq("email_notifications", true)
    }

    const { data: users, error: usersError } = await usersQuery

    if (usersError) {
      console.error("Error al obtener usuarios:", usersError)
      return NextResponse.json({ error: "Error al obtener los usuarios" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "No hay usuarios que cumplan con los criterios seleccionados" },
        { status: 400 },
      )
    }

    // Enviar correos a los usuarios
    const emailPromises = users.map(async (user) => {
      try {
        await resend.emails.send({
          from: "1Code1Day <noreply@1code1day.com>",
          to: user.email,
          subject: subject,
          html: content,
        })
        return { success: true, userId: user.id }
      } catch (error) {
        console.error(`Error al enviar correo a ${user.email}:`, error)
        return { success: false, userId: user.id, error }
      }
    })

    const emailResults = await Promise.all(emailPromises)
    const successfulEmails = emailResults.filter((result) => result.success)

    return NextResponse.json({
      success: true,
      sentCount: successfulEmails.length,
      totalCount: users.length,
    })
  } catch (error) {
    console.error("Error en el envío de correos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

