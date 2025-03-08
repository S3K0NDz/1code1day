import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"
import { upsertUserSubscription } from "@/lib/db-functions"

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    console.log("Verificando sesión ID:", sessionId)

    if (!sessionId) {
      console.error("Error: ID de sesión no proporcionado")
      return NextResponse.json({ success: false, error: "ID de sesión no proporcionado" }, { status: 400 })
    }

    // Verificar la sesión con Stripe
    try {
      console.log("Consultando a Stripe para la sesión:", sessionId)
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      console.log("Sesión recuperada de Stripe:", {
        id: session.id,
        payment_status: session.payment_status,
        customer: session.customer,
        subscription: session.subscription,
      })

      if (session.payment_status !== "paid") {
        console.error("Error: El pago no ha sido completado. Estado:", session.payment_status)
        return NextResponse.json({ success: false, error: "El pago no ha sido completado" }, { status: 400 })
      }

      // Obtener el ID del usuario desde los metadatos de la sesión o desde el cliente
      const userId = session.client_reference_id || session.metadata?.userId
      const plan = session.metadata?.plan || "premium"
      const billingCycle = session.metadata?.billingCycle || "monthly"

      console.log("Datos de usuario extraídos:", { userId, plan, billingCycle })

      if (!userId) {
        console.error("Error: No se pudo identificar al usuario")
        return NextResponse.json({ success: false, error: "No se pudo identificar al usuario" }, { status: 400 })
      }

      if (userId && session.subscription) {
        try {
          // Obtener detalles de la suscripción
          console.log("Obteniendo detalles de suscripción:", session.subscription)
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          console.log("Suscripción recuperada:", {
            id: subscription.id,
            status: subscription.status,
            current_period_end: subscription.current_period_end,
          })

          // Crear o actualizar la suscripción en nuestra base de datos
          const upsertResult = await upsertUserSubscription({
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

          console.log("Resultado de upsert:", upsertResult)

          if (!upsertResult.success) {
            console.error("Error al guardar la suscripción en la base de datos:", upsertResult.error)
            // Continuamos a pesar del error para intentar actualizar los metadatos del usuario
          }

          // Intentar actualizar los metadatos del usuario, pero no fallar si esto no funciona
          try {
            console.log("Intentando actualizar metadatos del usuario:", userId)
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
              console.error("Error al actualizar metadatos del usuario:", error)
              // No fallamos aquí, solo registramos el error
            } else {
              console.log("Metadatos de usuario actualizados correctamente")
            }
          } catch (metadataError) {
            console.error("Excepción al actualizar metadatos del usuario:", metadataError)
            // No fallamos aquí, solo registramos el error
          }

          // Devolvemos éxito incluso si la actualización de metadatos falló
          // porque la suscripción ya está registrada en la base de datos
          return NextResponse.json({
            success: true,
            session,
            subscription_saved: upsertResult.success,
          })
        } catch (error) {
          console.error("Error al procesar la suscripción:", error)
          return NextResponse.json(
            {
              success: false,
              error: "Error al procesar la suscripción",
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
          )
        }
      }

      return NextResponse.json({ success: true, session })
    } catch (stripeError) {
      console.error("Error de Stripe al verificar la sesión:", stripeError)
      return NextResponse.json(
        {
          success: false,
          error: "Error al verificar la sesión con Stripe",
          details: stripeError instanceof Error ? stripeError.message : String(stripeError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error general al verificar la sesión:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar la sesión",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

