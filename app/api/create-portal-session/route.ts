import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Se requiere el ID de usuario" }, { status: 400 })
    }

    // Obtener los datos del usuario
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user = userData.user
    const subscriptionId = user.user_metadata?.subscription_id

    if (!subscriptionId) {
      return NextResponse.json({ error: "El usuario no tiene una suscripción activa" }, { status: 400 })
    }

    // Buscar el cliente de Stripe asociado con este usuario
    let customerId = user.user_metadata?.stripe_customer_id

    // Si no existe un cliente, crear uno nuevo
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      // Actualizar el usuario con el ID del cliente
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          stripe_customer_id: customerId,
        },
      })
    }

    // Crear una sesión del portal de clientes
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/perfil/suscripcion`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error al crear la sesión del portal:", error)
    return NextResponse.json({ error: "Error al crear la sesión del portal" }, { status: 500 })
  }
}

