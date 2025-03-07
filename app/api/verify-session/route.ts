import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "ID de sesión no proporcionado" }, { status: 400 })
    }

    // Verificar la sesión con Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, error: "El pago no ha sido completado" }, { status: 400 })
    }

    // Obtener el ID del usuario desde los metadatos de la sesión o desde el cliente
    const userId = session.client_reference_id || session.metadata?.userId
    const plan = session.metadata?.plan || "premium"
    const billingCycle = session.metadata?.billingCycle || "monthly"

    if (userId) {
      // Actualizar el estado de suscripción del usuario en la base de datos
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          is_pro: true,
          subscription_plan: plan,
          subscription_cycle: billingCycle,
          subscription_start: new Date().toISOString(),
          subscription_id: session.subscription,
        },
      })

      if (error) {
        console.error("Error al actualizar el usuario:", error)
        return NextResponse.json({ success: false, error: "Error al actualizar el usuario" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error("Error al verificar la sesión:", error)
    return NextResponse.json({ success: false, error: "Error al verificar la sesión" }, { status: 500 })
  }
}

