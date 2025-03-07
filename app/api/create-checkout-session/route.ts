import { NextResponse } from "next/server"
import Stripe from "stripe"

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Modificar la función POST para manejar mejor los errores y verificar los IDs de precio
export async function POST(req: Request) {
  try {
    const { plan, billingCycle } = await req.json()

    // Determinar el precio basado en el plan y ciclo de facturación
    let priceId
    if (plan === "premium") {
      if (billingCycle === "monthly") {
        priceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
      } else if (billingCycle === "annual") {
        priceId = process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID
      }
    }

    if (!priceId) {
      return NextResponse.json({ error: "Plan o ciclo de facturación no válido" }, { status: 400 })
    }

    console.log(`Usando priceId: ${priceId} para plan: ${plan}, ciclo: ${billingCycle}`)

    // Verificar que el precio existe en Stripe antes de crear la sesión
    try {
      await stripe.prices.retrieve(priceId)
    } catch (priceError) {
      console.error("Error al verificar el precio en Stripe:", priceError)
      return NextResponse.json(
        {
          error: `El ID de precio no es válido: ${priceId}. Verifica tus variables de entorno STRIPE_PREMIUM_MONTHLY_PRICE_ID y STRIPE_PREMIUM_ANNUAL_PRICE_ID.`,
        },
        { status: 400 },
      )
    }

    // Crear una sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/planes`,
      metadata: {
        plan,
        billingCycle,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error al crear la sesión de checkout:", error)
    return NextResponse.json(
      {
        error: "Error al procesar el pago. Detalles: " + (error instanceof Error ? error.message : "Error desconocido"),
      },
      { status: 500 },
    )
  }
}

