import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase con la clave de servicio para operaciones administrativas
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Función para verificar si un token de acceso es válido y pertenece a un administrador
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    // Verificar el token de acceso
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      console.error("Error verificando token:", error)
      return false
    }

    // Verificar si el usuario es administrador
    return !!user.user_metadata?.is_admin
  } catch (error) {
    console.error("Error en verificación de admin:", error)
    return false
  }
}

// Función para obtener todos los usuarios
export async function getAllUsers() {
  try {
    // Obtener todos los usuarios
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error("Error al obtener usuarios:", authError)
      return { error: "Error al obtener la lista de usuarios" }
    }

    // Obtener información adicional de los perfiles
    // Solo seleccionamos columnas que sabemos que existen
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, username, email_notifications")

    if (profilesError) {
      console.error("Error al obtener perfiles:", profilesError)
      return { error: "Error al obtener la información de perfiles" }
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
        // No incluimos is_subscribed ya que no existe en la tabla
        email_notifications: profile.email_notifications || false,
      }
    })

    return { users }
  } catch (error) {
    console.error("Error al listar usuarios:", error)
    return { error: "Error interno del servidor" }
  }
}

