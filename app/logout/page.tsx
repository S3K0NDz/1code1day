"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function LogoutPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await signOut()
      router.push("/login")
    }

    logout()
  }, [signOut, router])

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white text-black px-4 py-2 text-3xl font-bold">1code</div>
            <div className="text-white text-3xl font-bold px-2">1day</div>
          </div>
          <p className="text-lg mb-4">Cerrando sesión...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

