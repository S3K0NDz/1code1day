import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Esta ruta es solo para depuración y debe eliminarse o protegerse en producción
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Se requiere userId" }, { status: 400 })
    }

    // Verificar si existe una suscripción para este usuario
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (subscriptionError) {
      console.error("Error al consultar suscripción:", subscriptionError)
      return NextResponse.json({ error: "Error al consultar suscripción" }, { status: 500 })
    }

    // Verificar los metadatos del usuario
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) {
      console.error("Error al consultar usuario:", userError)
      return NextResponse.json({ error: "Error al consultar usuario" }, { status: 500 })
    }

    // Verificar la estructura de la tabla user_subscriptions
    const { data: tableInfo, error: tableError } = await supabase.from("user_subscriptions").select("*").limit(1)

    if (tableError) {
      console.error("Error al consultar estructura de tabla:", tableError)
      return NextResponse.json({ error: "Error al consultar estructura de tabla" }, { status: 500 })
    }

    return NextResponse.json({
      subscription,
      user_metadata: userData?.user?.user_metadata || null,
      table_structure: tableInfo ? Object.keys(tableInfo[0] || {}) : null,
      success: true,
    })
  } catch (error) {
    console.error("Error en debug-subscription:", error)
    return NextResponse.json(
      {
        error: "Error al depurar suscripción",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

