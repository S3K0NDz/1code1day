import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"
import { upsertUserSubscription } from "@/lib/db-functions"

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const { userId, stripeSubscriptionId } = await req.json()

    // Verificar que se proporcionó al menos uno de los parámetros
    if (!userId && !stripeSubscriptionId) {
      return NextResponse.json({ success: false, error: "Se requiere userId o stripeSubscriptionId" }, { status: 400 })
    }

    // Si se proporciona el ID de suscripción de Stripe, buscar directamente
    if (stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

      // Buscar el usuario asociado a esta suscripción
      let associatedUserId = subscription.metadata?.userId

      // Si no hay userId en los metadatos, buscar en la base de datos
      if (!associatedUserId) {
        // Buscar en los metadatos del usuario
        const { data: users } = await supabase
          .from("auth.users")
          .select("id, user_metadata")
          .filter("user_metadata->subscription_id", "eq", stripeSubscriptionId)
          .limit(1)

        if (users && users.length > 0) {
          associatedUserId = users[0].id
        } else {
          return NextResponse.json(
            { success: false, error: "No se encontró un usuario asociado a esta suscripción" },
            { status: 404 },
          )
        }
      }

      // Actualizar la suscripción en la base de datos
      await upsertUserSubscription({
        user_id: associatedUserId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        plan_id: subscription.metadata?.plan || "premium",
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        billing_cycle: subscription.metadata?.billingCycle || "monthly",
      })

      return NextResponse.json({
        success: true,
        message: "Suscripción sincronizada correctamente",
        subscription,
      })
    }

    // Si se proporciona el ID de usuario, buscar sus suscripciones en Stripe
    if (userId) {
      // Primero, buscar si el usuario tiene un ID de suscripción en los metadatos
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

      if (userError) {
        return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
      }

      const subscriptionId = userData.user?.user_metadata?.subscription_id

      if (subscriptionId) {
        try {
          // Intentar obtener la suscripción de Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Actualizar la suscripción en la base de datos
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

          return NextResponse.json({
            success: true,
            message: "Suscripción sincronizada correctamente",
            subscription,
          })
        } catch (error) {
          console.error("Error al obtener la suscripción de Stripe:", error)
          // Si no se encuentra la suscripción, continuar con la búsqueda por cliente
        }
      }

      // Si no se encontró por ID de suscripción, buscar por cliente
      // Primero, buscar si el usuario tiene un ID de cliente en los metadatos
      const stripeCustomerId = userData.user?.user_metadata?.stripe_customer_id

      if (stripeCustomerId) {
        // Buscar todas las suscripciones del cliente
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "active",
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]

          // Actualizar la suscripción en la base de datos
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

          // También actualizar los metadatos del usuario
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...userData.user?.user_metadata,
              subscription_id: subscription.id,
              is_pro: true,
            },
          })

          return NextResponse.json({
            success: true,
            message: "Suscripción sincronizada correctamente",
            subscription,
          })
        }
      }

      // Si llegamos aquí, no se encontró ninguna suscripción
      return NextResponse.json(
        { success: false, error: "No se encontró ninguna suscripción activa para este usuario" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: false, error: "Parámetros inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Error al sincronizar la suscripción:", error)
    return NextResponse.json({ success: false, error: "Error al sincronizar la suscripción" }, { status: 500 })
  }
}

