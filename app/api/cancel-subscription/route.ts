import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"
import { cancelUserSubscription } from "@/lib/db-functions"

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
    const { data: subscription, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError) {
      console.error("Error al obtener la suscripción:", fetchError)
      return NextResponse.json({ error: "Error al obtener la suscripción" }, { status: 500 })
    }

    if (!subscription) {
      return NextResponse.json({ error: "No se encontró una suscripción activa" }, { status: 404 })
    }

    // Cancelar la suscripción en Stripe
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        })
      } catch (stripeError) {
        console.error("Error al cancelar la suscripción en Stripe:", stripeError)
        return NextResponse.json({ error: "Error al cancelar la suscripción en Stripe" }, { status: 500 })
      }
    }

    // Actualizar el estado de la suscripción en nuestra base de datos
    const result = await cancelUserSubscription(userId)

    if (!result.success) {
      console.error("Error al actualizar la suscripción en la base de datos:", result.error)
      return NextResponse.json({ error: "Error al actualizar la suscripción en la base de datos" }, { status: 500 })
    }

    // Actualizar los metadatos del usuario
    try {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          subscription_status: "canceling",
          subscription_cancel_at_period_end: true,
        },
      })
    } catch (error) {
      console.error("Error al actualizar los metadatos del usuario:", error)
      // No fallamos aquí, ya que la suscripción ya se canceló en Stripe
    }

    return NextResponse.json({
      success: true,
      message: "La suscripción se cancelará al final del período actual",
    })
  } catch (error) {
    console.error("Error al cancelar la suscripción:", error)
    return NextResponse.json(
      {
        error: "Error al cancelar la suscripción",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

