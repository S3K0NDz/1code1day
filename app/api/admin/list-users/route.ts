import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con la clave de servicio para operaciones administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: Request) {
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

    // Obtener la lista de usuarios
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error("Error al obtener usuarios:", authError)
      return NextResponse.json({ error: "Error al obtener la lista de usuarios" }, { status: 500 })
    }

    // Obtener información adicional de los perfiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, username, is_subscribed, email_notifications")

    if (profilesError) {
      console.error("Error al obtener perfiles:", profilesError)
      return NextResponse.json({ error: "Error al obtener la información de perfiles" }, { status: 500 })
    }

    // Combinar la información de usuarios y perfiles
    const users = authUsers.users.map((user) => {
      const profile = profiles.find((p) => p.id === user.id) || {}
      return {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          username: profile.username || user.user_metadata?.username || "",
        },
        is_subscribed: profile.is_subscribed || false,
        email_notifications: profile.email_notifications || false,
      }
    })

    return NextResponse.json({
      data: { users },
      success: true,
    })
  } catch (error) {
    console.error("Error al listar usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

