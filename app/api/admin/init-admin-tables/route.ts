import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/admin-auth"

// Función para verificar si una tabla existe
async function tableExists(supabase, tableName) {
  try {
    // Intentamos seleccionar un registro de la tabla
    const { data, error } = await supabase.from(tableName).select("id").limit(1)

    // Si no hay error, la tabla existe
    return !error
  } catch (error) {
    console.error(`Error al verificar tabla ${tableName}:`, error)
    return false
  }
}

export async function POST(request: Request) {
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

    // Tablas que necesitamos verificar
    const requiredTables = ["config", "security_config", "blocked_ips", "security_logs", "stats"]
    const missingTables = []
    const results = {}

    // Verificar qué tablas existen
    for (const table of requiredTables) {
      const exists = await tableExists(supabase, table)
      results[table] = { exists }

      if (!exists) {
        missingTables.push(table)
      }
    }

    // Si todas las tablas existen, devolvemos éxito
    if (missingTables.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Todas las tablas de administración existen",
        results,
      })
    }

    // Si faltan tablas, devolvemos la lista de tablas faltantes
    return NextResponse.json(
      {
        success: false,
        message: "Faltan algunas tablas de administración",
        missingTables,
        results,
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Error al inicializar tablas de administración:", error)

    // Asegurarnos de devolver un JSON válido incluso en caso de error
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al inicializar tablas",
      },
      { status: 500 },
    )
  }
}

