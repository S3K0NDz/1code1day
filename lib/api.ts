import { supabase } from "@/lib/supabase"

// Interfaz para las suscripciones de usuario
export interface UserSubscription {
  id?: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  billing_cycle: string
}

// Función para obtener la suscripción de un usuario
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).maybeSingle()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return { success: false, error }
  }
}

