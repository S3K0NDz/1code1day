import { supabase } from "@/lib/supabase"

// Definición de tipos
export interface UserChallenge {
  id?: string
  user_id: string
  challenge_id: string
  completed_at: string
  code: string
  is_saved?: boolean
  execution_time?: number
  score?: number
}

// Función para guardar un reto completado
export async function saveCompletedChallenge(challengeData: UserChallenge) {
  try {
    // Verificar si ya existe un registro para este usuario y reto
    const { data: existingData, error: fetchError } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", challengeData.user_id)
      .eq("challenge_id", challengeData.challenge_id)
      .maybeSingle()

    if (fetchError) throw fetchError

    // Si ya existe, actualizar el registro
    if (existingData) {
      const { error } = await supabase
        .from("user_challenges")
        .update({
          completed_at: challengeData.completed_at,
          code: challengeData.code,
          is_saved: challengeData.is_saved || existingData.is_saved,
          execution_time: challengeData.execution_time || existingData.execution_time,
          score: challengeData.score || existingData.score,
        })
        .eq("id", existingData.id)

      if (error) throw error
      return { success: true, data: existingData.id }
    }
    // Si no existe, crear un nuevo registro
    else {
      const { data, error } = await supabase.from("user_challenges").insert(challengeData).select()

      if (error) throw error
      return { success: true, data: data[0].id }
    }
  } catch (error) {
    console.error("Error saving completed challenge:", error)
    return { success: false, error }
  }
}

// Función para marcar un reto como guardado/favorito
export async function toggleSavedChallenge(userId: string, challengeId: string, isSaved: boolean) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()

    if (fetchError) throw fetchError

    // Si ya existe un registro, actualizar is_saved
    if (existingData) {
      const { error } = await supabase.from("user_challenges").update({ is_saved: isSaved }).eq("id", existingData.id)

      if (error) throw error
      return { success: true }
    }
    // Si no existe, crear un nuevo registro con is_saved
    else {
      const { error } = await supabase.from("user_challenges").insert({
        user_id: userId,
        challenge_id: challengeId,
        is_saved: isSaved,
        completed_at: new Date().toISOString(),
        code: "",
      })

      if (error) throw error
      return { success: true }
    }
  } catch (error) {
    console.error("Error toggling saved challenge:", error)
    return { success: false, error }
  }
}

// Función para obtener todos los retos completados por un usuario
export async function getUserCompletedChallenges(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_challenges")
      .select(`
        *,
        retos:challenge_id(id, title, difficulty, category, description)
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching user completed challenges:", error)
    return { success: false, error }
  }
}

// Función para obtener los retos guardados por un usuario
export async function getUserSavedChallenges(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_challenges")
      .select(`
        *,
        retos:challenge_id(id, title, difficulty, category, description)
      `)
      .eq("user_id", userId)
      .eq("is_saved", true)
      .order("completed_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching user saved challenges:", error)
    return { success: false, error }
  }
}

// Añadir estas nuevas interfaces y funciones al final del archivo

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

// Modificar la función upsertUserSubscription para añadir más logging y manejo de errores

// Función para crear o actualizar una suscripción
export async function upsertUserSubscription(subscription: UserSubscription) {
  try {
    console.log("Iniciando upsertUserSubscription con datos:", {
      user_id: subscription.user_id,
      plan_id: subscription.plan_id,
      status: subscription.status,
    })

    // Verificar que los datos esenciales estén presentes
    if (!subscription.user_id) {
      console.error("Error: user_id es requerido para upsertUserSubscription")
      return { success: false, error: "user_id es requerido" }
    }

    // Verificar si ya existe una suscripción para este usuario
    const { data: existingData, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", subscription.user_id)
      .maybeSingle()

    if (fetchError) {
      console.error("Error al buscar suscripción existente:", fetchError)
      throw fetchError
    }

    console.log("Resultado de búsqueda de suscripción existente:", existingData)

    // Si ya existe, actualizar
    if (existingData) {
      console.log("Actualizando suscripción existente con ID:", existingData.id)

      const updateData = {
        stripe_customer_id: subscription.stripe_customer_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        billing_cycle: subscription.billing_cycle,
        updated_at: new Date().toISOString(),
      }

      console.log("Datos de actualización:", updateData)

      const { data: updatedData, error } = await supabase
        .from("user_subscriptions")
        .update(updateData)
        .eq("id", existingData.id)
        .select()

      if (error) {
        console.error("Error al actualizar suscripción:", error)
        throw error
      }

      console.log("Suscripción actualizada correctamente:", updatedData)
      return { success: true, data: existingData.id }
    }
    // Si no existe, crear
    else {
      console.log("Creando nueva suscripción para usuario:", subscription.user_id)

      const insertData = {
        ...subscription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Datos de inserción:", insertData)

      const { data, error } = await supabase.from("user_subscriptions").insert(insertData).select()

      if (error) {
        console.error("Error al insertar suscripción:", error)
        throw error
      }

      console.log("Nueva suscripción creada correctamente:", data)
      return { success: true, data: data[0]?.id }
    }
  } catch (error) {
    console.error("Error en upsertUserSubscription:", error)
    return { success: false, error }
  }
}

// Función para cancelar una suscripción
export async function cancelUserSubscription(userId: string) {
  try {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "canceling",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error canceling user subscription:", error)
    return { success: false, error }
  }
}

