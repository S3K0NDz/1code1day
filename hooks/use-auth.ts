"use client"

import { createContext, useContext } from "react"
import { useAuth as useSupabaseAuth } from "@/components/auth-provider"

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return useSupabaseAuth()
  }
  return context
}

