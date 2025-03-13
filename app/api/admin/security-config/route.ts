import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/admin-auth"
import { getServerSession } from "@/lib/auth"

// GET: Obtener configuración de seguridad
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Obtener configuración de seguridad
    const { data, error } = await supabase.from("security_config").select("*").limit(1).single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener configuración de seguridad:", error)
    return NextResponse.json({ success: false, error: "Error al obtener configuración de seguridad" }, { status: 500 })
  }
}

// PATCH: Actualizar configuración de seguridad
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const data = await request.json()

    const supabase = createAdminClient()

    // Actualizar configuración de seguridad
    const { error } = await supabase.from("security_config").update(data).eq("id", 1)

    if (error) throw error

    // Registrar evento de seguridad
    await supabase.rpc("log_security_event", {
      event_type: "security_config_updated",
      user_id: session.user.id,
      user_email: session.user.email,
      details: "Configuración de seguridad actualizada",
    })

    return NextResponse.json({ success: true, message: "Configuración de seguridad actualizada correctamente" })
  } catch (error) {
    console.error("Error al actualizar configuración de seguridad:", error)
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración de seguridad" },
      { status: 500 },
    )
  }
}

