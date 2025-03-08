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

  console.log(`Evento de Stripe recibido: ${event.type}`)

  // Manejar los eventos de Stripe
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      console.log("Procesando checkout.session.completed:", {
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
      })

      // Obtener el ID del usuario desde los metadatos de la sesión
      const userId = session.client_reference_id || session.metadata?.userId
      const plan = session.metadata?.plan || "premium"
      const billingCycle = session.metadata?.billingCycle || "monthly"

      if (!userId) {
        console.error("No se encontró userId en la sesión de checkout")
        return NextResponse.json({ error: "No se encontró userId" }, { status: 400 })
      }

      if (!session.subscription) {
        console.error("No se encontró subscription_id en la sesión de checkout")
        return NextResponse.json({ error: "No se encontró subscription_id" }, { status: 400 })
      }

      if (userId && session.subscription) {
        try {
          // Obtener detalles de la suscripción
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          console.log("Detalles de suscripción recuperados:", {
            id: subscription.id,
            status: subscription.status,
          })

          // Crear o actualizar la suscripción en nuestra base de datos
          const result = await upsertUserSubscription({
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

          console.log("Resultado de upsertUserSubscription:", result)

          if (!result.success) {
            console.error("Error al guardar la suscripción:", result.error)
          }

          // También actualizar los metadatos del usuario para mantener compatibilidad
          try {
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
            } else {
              console.log("Metadatos de usuario actualizados correctamente")
            }
          } catch (error) {
            console.error("Excepción al actualizar metadatos del usuario:", error)
          }
        } catch (error) {
          console.error("Error al procesar checkout.session.completed:", error)
        }
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      console.log("Procesando customer.subscription.updated:", {
        id: subscription.id,
        status: subscription.status,
      })

      try {
        // Buscar el usuario por subscription_id en la tabla user_subscriptions
        const { data: subscriptions, error } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .limit(1)

        if (error) {
          console.error("Error al buscar usuario por subscription_id:", error)
          break
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.error("No se encontró usuario para la suscripción:", subscription.id)
          break
        }

        const userId = subscriptions[0].user_id
        console.log("Usuario encontrado para la suscripción:", userId)

        // Actualizar la suscripción en nuestra base de datos
        const result = await upsertUserSubscription({
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

        console.log("Resultado de actualización de suscripción:", result)

        // También actualizar los metadatos del usuario para mantener compatibilidad
        try {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              subscription_status: subscription.status,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            },
          })

          if (error) {
            console.error("Error al actualizar metadatos del usuario:", error)
          } else {
            console.log("Metadatos de usuario actualizados correctamente")
          }
        } catch (error) {
          console.error("Excepción al actualizar metadatos del usuario:", error)
        }
      } catch (error) {
        console.error("Error al procesar customer.subscription.updated:", error)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      console.log("Procesando customer.subscription.deleted:", {
        id: subscription.id,
      })

      try {
        // Buscar el usuario por subscription_id en la tabla user_subscriptions
        const { data: subscriptions, error } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .limit(1)

        if (error) {
          console.error("Error al buscar usuario por subscription_id:", error)
          break
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.error("No se encontró usuario para la suscripción:", subscription.id)
          break
        }

        const userId = subscriptions[0].user_id
        console.log("Usuario encontrado para la suscripción cancelada:", userId)

        // Actualizar la suscripción en nuestra base de datos
        const result = await upsertUserSubscription({
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

        console.log("Resultado de cancelación de suscripción:", result)

        // También actualizar los metadatos del usuario para mantener compatibilidad
        try {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              is_pro: false,
              subscription_status: "canceled",
              subscription_end: new Date().toISOString(),
            },
          })

          if (error) {
            console.error("Error al actualizar metadatos del usuario:", error)
          } else {
            console.log("Metadatos de usuario actualizados correctamente")
          }
        } catch (error) {
          console.error("Excepción al actualizar metadatos del usuario:", error)
        }
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

