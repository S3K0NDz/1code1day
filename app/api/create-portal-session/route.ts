import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"
import { getUserSubscription } from "@/lib/db-functions"

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

    // Obtener la suscripción del usuario
    const { data: subscription, success } = await getUserSubscription(userId)

    if (!success || !subscription) {
      return NextResponse.json({ error: "El usuario no tiene una suscripción activa" }, { status: 400 })
    }

    // Verificar que tenemos un customer_id
    let customerId = subscription.stripe_customer_id

    // Si no existe un cliente, crear uno nuevo
    if (!customerId) {
      // Obtener los datos del usuario
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

      if (userError || !userData?.user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      const user = userData.user

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      // Actualizar la suscripción con el ID del cliente
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("id", subscription.id)

      if (error) {
        console.error("Error al actualizar el ID del cliente:", error)
      }
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

