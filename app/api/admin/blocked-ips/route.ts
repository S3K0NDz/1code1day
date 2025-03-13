import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/admin-auth"
import { getServerSession } from "@/lib/auth"

// GET: Obtener IPs bloqueadas
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Obtener IPs bloqueadas
    const { data, error } = await supabase.from("blocked_ips").select("*").order("blocked_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener IPs bloqueadas:", error)
    return NextResponse.json({ success: false, error: "Error al obtener IPs bloqueadas" }, { status: 500 })
  }
}

// POST: Bloquear una IP
export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { ip_address, reason, expires_at } = await request.json()

    if (!ip_address) {
      return NextResponse.json({ success: false, error: "Dirección IP requerida" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verificar si la IP ya está bloqueada
    const { data: existingIP, error: checkError } = await supabase
      .from("blocked_ips")
      .select("id")
      .eq("ip_address", ip_address)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingIP) {
      return NextResponse.json({ success: false, error: "Esta dirección IP ya está bloqueada" }, { status: 400 })
    }

    // Bloquear IP
    const { data, error } = await supabase
      .from("blocked_ips")
      .insert({
        ip_address,
        reason: reason || "Bloqueo manual por administrador",
        blocked_by: session.user.id,
        expires_at: expires_at || null,
      })
      .select()

    if (error) throw error

    // Registrar evento de seguridad
    await supabase.rpc("log_security_event", {
      event_type: "ip_blocked",
      user_id: session.user.id,
      user_email: session.user.email,
      ip_address,
      details: reason || "Bloqueo manual por administrador",
    })

    return NextResponse.json({ success: true, data: data[0], message: "IP bloqueada correctamente" })
  } catch (error) {
    console.error("Error al bloquear IP:", error)
    return NextResponse.json({ success: false, error: "Error al bloquear IP" }, { status: 500 })
  }
}

// DELETE: Desbloquear una IP
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user || !session.user.is_admin) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Obtener la IP antes de eliminarla para el registro
    const { data: ipData, error: getError } = await supabase
      .from("blocked_ips")
      .select("ip_address")
      .eq("id", id)
      .single()

    if (getError) throw getError

    // Desbloquear IP
    const { error } = await supabase.from("blocked_ips").delete().eq("id", id)

    if (error) throw error

    // Registrar evento de seguridad
    await supabase.rpc("log_security_event", {
      event_type: "ip_unblocked",
      user_id: session.user.id,
      user_email: session.user.email,
      ip_address: ipData.ip_address,
      details: "IP desbloqueada manualmente",
    })

    return NextResponse.json({ success: true, message: "IP desbloqueada correctamente" })
  } catch (error) {
    console.error("Error al desbloquear IP:", error)
    return NextResponse.json({ success: false, error: "Error al desbloquear IP" }, { status: 500 })
  }
}

