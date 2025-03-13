import { createClient } from "@supabase/supabase-js"

// Función para crear un cliente de Supabase con permisos de administrador
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Faltan variables de entorno para Supabase")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Función para verificar si un usuario es administrador
export async function isUserAdmin(userId: string) {
  try {
    const supabase = createAdminClient()

    // Verificar si el usuario existe en la tabla profiles
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error al verificar si el usuario es administrador:", error)
      return false
    }

    // Verificar si el usuario tiene el rol de administrador
    // Esto depende de cómo estés almacenando los roles de usuario
    // Aquí asumimos que hay un campo user_metadata.is_admin en la tabla auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData) {
      console.error("Error al obtener datos del usuario:", userError)
      return false
    }

    return userData.user.user_metadata?.is_admin === true
  } catch (error) {
    console.error("Error al verificar si el usuario es administrador:", error)
    return false
  }
}

