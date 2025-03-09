"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabaseClient"

interface EmailNotificationToggleProps {
  userId: string
  initialValue?: boolean
}

export function EmailNotificationToggle({ userId, initialValue = false }: EmailNotificationToggleProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("profiles").update({ email_notifications: checked }).eq("id", userId)

      if (error) throw error

      setEnabled(checked)
      toast({
        title: checked ? "Notificaciones activadas" : "Notificaciones desactivadas",
        description: checked
          ? "Recibirás un correo cuando haya un nuevo reto diario."
          : "Ya no recibirás correos sobre nuevos retos diarios.",
      })
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar tus preferencias. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="email-notifications" checked={enabled} onCheckedChange={handleToggle} disabled={isLoading} />
      <Label htmlFor="email-notifications" className="cursor-pointer">
        Recibir notificaciones por correo sobre nuevos retos diarios
      </Label>
    </div>
  )
}

