import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

// Función para obtener la sesión del servidor
export async function getServerSession() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener la sesión:", error)
      return null
    }

    if (!session) {
      return null
    }

    // Obtener información adicional del usuario si es necesario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("Error al obtener datos del usuario:", userError)
      // Devolver la sesión sin datos adicionales
      return session
    }

    // Combinar los datos de la sesión con los datos adicionales del usuario
    return {
      ...session,
      user: {
        ...session.user,
        ...userData,
      },
    }
  } catch (error) {
    console.error("Error general al obtener la sesión:", error)
    return null
  }
}

// Función para verificar si un usuario está autenticado
export async function isAuthenticated() {
  const session = await getServerSession()
  return !!session
}

// Función para verificar si un usuario es administrador
export async function isAdmin() {
  const session = await getServerSession()
  return !!session?.user?.is_admin
}

// Función para obtener el ID del usuario actual
export async function getCurrentUserId() {
  const session = await getServerSession()
  return session?.user?.id || null
}

