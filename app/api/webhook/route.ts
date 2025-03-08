import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"
import { upsertUserSubscription } from "@/lib/db-functions"

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

      if (userId && session.subscription) {
        try {
          // Obtener detalles de la suscripción
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          // Crear o actualizar la suscripción en nuestra base de datos
          await upsertUserSubscription({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan_id: plan,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            billing_cycle: billingCycle,
          })

          // También actualizar los metadatos del usuario para mantener compatibilidad
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
        } catch (error) {
          console.error("Error al procesar checkout.session.completed:", error)
        }
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription

      try {
        // Buscar el usuario por subscription_id en la tabla user_subscriptions
        const { data: subscriptions, error } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .limit(1)

        if (error || !subscriptions || subscriptions.length === 0) {
          console.error("Error al buscar usuario por subscription_id:", error)
          break
        }

        const userId = subscriptions[0].user_id

        // Actualizar la suscripción en nuestra base de datos
        await upsertUserSubscription({
          user_id: userId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_id: subscription.metadata?.plan || "premium",
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          billing_cycle: subscription.metadata?.billingCycle || "monthly",
        })

        // También actualizar los metadatos del usuario para mantener compatibilidad
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            subscription_status: subscription.status,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          },
        })
      } catch (error) {
        console.error("Error al procesar customer.subscription.updated:", error)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      try {
        // Buscar el usuario por subscription_id en la tabla user_subscriptions
        const { data: subscriptions, error } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .limit(1)

        if (error || !subscriptions || subscriptions.length === 0) {
          console.error("Error al buscar usuario por subscription_id:", error)
          break
        }

        const userId = subscriptions[0].user_id

        // Actualizar la suscripción en nuestra base de datos
        await upsertUserSubscription({
          user_id: userId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_id: "free", // Volver al plan gratuito
          status: "canceled",
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          billing_cycle: "monthly",
        })

        // También actualizar los metadatos del usuario para mantener compatibilidad
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            is_pro: false,
            subscription_status: "canceled",
            subscription_end: new Date().toISOString(),
          },
        })
      } catch (error) {
        console.error("Error al procesar customer.subscription.deleted:", error)
      }
      break
    }

    default:
      console.log(`Evento no manejado: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

