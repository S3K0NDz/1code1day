"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
// Añadir la importación de getUserSubscription
import { getUserSubscription } from "@/lib/db-functions"

// Ampliamos la interfaz del usuario para incluir is_admin
type ExtendedUser = User & {
  user_metadata: User["user_metadata"] & {
    is_admin?: boolean
  }
}

// Ampliar la interfaz AuthContextType para incluir información de suscripción
type AuthContextType = {
  user: ExtendedUser | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  subscription: any | null
  isSubscriptionLoading: boolean
  isPro: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
  }>
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ) => Promise<{
    error: Error | null
    data: {
      user: User | null
      session: Session | null
    }
  }>
  signInWithMagicLink: (email: string) => Promise<{
    error: Error | null
  }>
  signInWithGitHub: () => Promise<{
    error: Error | null
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  // Dentro de la función AuthProvider, añadir estos estados:
  const [subscription, setSubscription] = useState<any>(null)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      // Verificamos si el usuario es administrador
      const currentUser = session?.user as ExtendedUser | null
      setUser(currentUser)
      setIsAdmin(!!currentUser?.user_metadata?.is_admin)
      setIsLoading(false)
    }

    getInitialSession()

    // Configurar el listener para cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const currentUser = session?.user as ExtendedUser | null
      setUser(currentUser)
      setIsAdmin(!!currentUser?.user_metadata?.is_admin)
      setIsLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Añadir este useEffect para cargar la información de suscripción
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null)
        setIsPro(false)
        setIsSubscriptionLoading(false)
        return
      }

      try {
        setIsSubscriptionLoading(true)
        const { data, success } = await getUserSubscription(user.id)

        if (success && data) {
          setSubscription(data)
          setIsPro(data.plan_id === "premium" && data.status === "active")
        } else {
          // Fallback a los metadatos del usuario
          setIsPro(!!user.user_metadata?.is_pro)
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
        // Fallback a los metadatos del usuario
        setIsPro(!!user.user_metadata?.is_pro)
      } finally {
        setIsSubscriptionLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) {
      router.push("/reto-diario")
    }
    return { error }
  }

  const signUp = async (email: string, password: string, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { ...metadata, is_admin: false }, // Por defecto, los nuevos usuarios no son administradores
      },
    })
    return { data, error }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.NODE_ENV === "production"
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  // Añadir función para iniciar sesión con GitHub
  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo:
          process.env.NODE_ENV === "production"
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Actualizar el objeto value para incluir la información de suscripción
  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    subscription,
    isSubscriptionLoading,
    isPro,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGitHub,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

