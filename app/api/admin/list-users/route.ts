import { NextResponse } from "next/server"
import { verifyAdminToken, getAllUsers } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    // Obtener el token de acceso del cuerpo de la solicitud
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token de acceso no proporcionado" }, { status: 401 })
    }

    // Verificar si el token pertenece a un administrador
    const isAdmin = await verifyAdminToken(token)

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado. No tienes permisos de administrador." }, { status: 403 })
    }

    // Obtener todos los usuarios
    const result = await getAllUsers()

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      data: { users: result.users },
      success: true,
    })
  } catch (error) {
    console.error("Error en la API de listar usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

