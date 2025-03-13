import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/admin-auth"
import { getServerSession } from "@/lib/auth"

// GET: Obtener logs de seguridad
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const eventType = searchParams.get("event_type")

    const supabase = createAdminClient()

    // Construir la consulta
    let query = supabase.from("security_logs").select("*", { count: "exact" }).order("timestamp", { ascending: false })

    // Aplicar filtros si existen
    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    // Aplicar paginación
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener logs de seguridad:", error)
    return NextResponse.json({ success: false, error: "Error al obtener logs de seguridad" }, { status: 500 })
  }
}

