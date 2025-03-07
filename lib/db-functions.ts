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

