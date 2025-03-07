import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Esta es la clave secreta para verificar que las solicitudes provienen de Stripe
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret!)
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }

  // Manejar los eventos de Stripe
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      // Obtener el ID del usuario desde los metadatos de la sesión
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
        }
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription

      // Buscar el usuario por subscription_id en los metadatos
      const { data: users, error } = await supabase
        .from("users")
        .select("id, user_metadata")
        .filter("user_metadata->subscription_id", "eq", subscription.id)

      if (error || !users || users.length === 0) {
        console.error("Error al buscar usuario por subscription_id:", error)
        break
      }

      const user = users[0]

      // Actualizar el estado de la suscripción
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          subscription_status: subscription.status,
          subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        },
      })

      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      // Buscar el usuario por subscription_id en los metadatos
      const { data: users, error } = await supabase
        .from("users")
        .select("id, user_metadata")
        .filter("user_metadata->subscription_id", "eq", subscription.id)

      if (error || !users || users.length === 0) {
        console.error("Error al buscar usuario por subscription_id:", error)
        break
      }

      const user = users[0]

      // Actualizar el estado de la suscripción
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          is_pro: false,
          subscription_status: "canceled",
          subscription_end: new Date().toISOString(),
        },
      })

      break
    }

    default:
      console.log(`Evento no manejado: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

