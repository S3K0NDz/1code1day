import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/admin-auth"
import { getServerSession } from "@/lib/auth"

// GET: Obtener configuración
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Verificar si la tabla config existe
    const { data: tableExists, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "config")
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar tabla config:", checkError)
      throw new Error("Error al verificar si la tabla config existe")
    }

    // Si la tabla no existe, devolver configuración predeterminada
    if (!tableExists) {
      console.log("La tabla config no existe, devolviendo valores predeterminados")
      return NextResponse.json({
        success: true,
        data: {
          general: {
            siteName: "1code1day",
            siteDescription: "Mejora tus habilidades de programación con un reto diario",
            maintenanceMode: false,
            allowRegistrations: true,
            defaultUserRole: "user",
            maxLoginAttempts: 5,
            sessionTimeout: 60,
          },
          email: {
            emailSender: "no-reply@1code1day.app",
            emailFooter: "© 2025 1code1day. Todos los derechos reservados.",
            welcomeEmailEnabled: true,
            dailyChallengeEmailEnabled: true,
            dailyChallengeEmailTime: "08:00",
            emailNotificationsEnabled: true,
          },
          challenge: {
            defaultTimeLimit: 45,
            defaultDifficulty: "Intermedio",
            showSolutionsAfterCompletion: true,
            allowHints: true,
            maxHintsPerChallenge: 3,
            showLeaderboard: true,
            dailyChallengeEnabled: true,
            freeChallengesPercentage: 30,
          },
          isDefault: true,
        },
      })
    }

    // Obtener configuración general
    const { data: configData, error: configError } = await supabase.from("config").select("*").limit(1).single()

    if (configError) {
      // Si hay un error específico de "no se encontraron registros", crear un registro predeterminado
      if (configError.code === "PGRST116") {
        console.log("No hay registros en la tabla config, creando configuración predeterminada")

        const defaultConfig = {
          general: {
            siteName: "1code1day",
            siteDescription: "Mejora tus habilidades de programación con un reto diario",
            maintenanceMode: false,
            allowRegistrations: true,
            defaultUserRole: "user",
            maxLoginAttempts: 5,
            sessionTimeout: 60,
          },
          email: {
            emailSender: "no-reply@1code1day.app",
            emailFooter: "© 2025 1code1day. Todos los derechos reservados.",
            welcomeEmailEnabled: true,
            dailyChallengeEmailEnabled: true,
            dailyChallengeEmailTime: "08:00",
            emailNotificationsEnabled: true,
          },
          challenge: {
            defaultTimeLimit: 45,
            defaultDifficulty: "Intermedio",
            showSolutionsAfterCompletion: true,
            allowHints: true,
            maxHintsPerChallenge: 3,
            showLeaderboard: true,
            dailyChallengeEnabled: true,
            freeChallengesPercentage: 30,
          },
        }

        // Intentar insertar la configuración predeterminada
        const { error: insertError } = await supabase.from("config").insert([defaultConfig])

        if (insertError) {
          console.error("Error al insertar configuración predeterminada:", insertError)
          // Devolver la configuración predeterminada aunque no se haya podido insertar
          return NextResponse.json({
            success: true,
            data: { ...defaultConfig, isDefault: true },
          })
        }

        return NextResponse.json({
          success: true,
          data: { ...defaultConfig, isDefault: false },
        })
      }

      throw configError
    }

    return NextResponse.json({ success: true, data: configData })
  } catch (error) {
    console.error("Error al obtener configuración:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener configuración",
        details: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// PATCH: Actualizar configuración
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { section, data } = body

    if (!section || !data || !["general", "email", "challenge"].includes(section)) {
      return NextResponse.json({ success: false, error: "Parámetros inválidos" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Actualizar la sección específica de la configuración
    const updateData = {}
    updateData[section] = data

    const { error } = await supabase.from("config").update(updateData).eq("id", 1)

    if (error) throw error

    // Registrar evento de seguridad
    await supabase.rpc("log_security_event", {
      event_type: "config_updated",
      user_id: session.user.id,
      user_email: session.user.email,
      details: `Configuración actualizada: ${section}`,
    })

    return NextResponse.json({ success: true, message: "Configuración actualizada correctamente" })
  } catch (error) {
    console.error("Error al actualizar configuración:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar configuración" }, { status: 500 })
  }
}

