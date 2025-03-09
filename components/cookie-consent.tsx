"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Comprobar si el usuario ya ha aceptado las cookies
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all")
    setShowConsent(false)
  }

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential")
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur-sm border-t border-border">
      <Card className="max-w-6xl mx-auto p-4 md:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">🍪 Utilizamos cookies</h3>
            <p className="text-sm text-muted-foreground">
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Puedes aceptar todas las cookies o
              elegir cuáles aceptar.{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Más información
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button variant="outline" onClick={acceptEssential} className="whitespace-nowrap">
              Solo esenciales
            </Button>
            <Button onClick={acceptAll} className="whitespace-nowrap">
              Aceptar todas
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

