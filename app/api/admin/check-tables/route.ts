import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo crear el cliente de Supabase con permisos de administrador",
        },
        { status: 500 },
      )
    }

    const tables = ["config", "security_config", "blocked_ips", "security_logs", "stats"]
    const results = {}

    // Verificar cada tabla
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("id").limit(1)

        results[table] = {
          exists: !error,
          error: error ? error.message : null,
        }
      } catch (error) {
        results[table] = {
          exists: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    }

    return NextResponse.json({
      success: true,
      tables: results,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
  } catch (error) {
    console.error("Error al verificar tablas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al verificar tablas",
      },
      { status: 500 },
    )
  }
}

