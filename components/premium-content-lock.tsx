import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { LockIcon } from "lucide-react"

// Añadir una prop para indicar si el contenido es de acceso gratuito
interface PremiumContentLockProps {
  children: React.ReactNode
  message?: string
  freeAccess?: boolean
}

// Modificar el componente para verificar si el contenido es de acceso gratuito
export default function PremiumContentLock({ children, message, freeAccess = false }: PremiumContentLockProps) {
  const { user, isPremium, isLoading } = useAuth()

  // Si el contenido es de acceso gratuito, mostrarlo sin restricciones
  if (freeAccess) {
    return (
      <div className="relative">
        {children}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Acceso gratuito
          </Badge>
        </div>
      </div>
    )
  }

  // Si el usuario es premium o está cargando, mostrar el contenido
  if (isPremium || isLoading) {
    return <>{children}</>
  }

  // Si el usuario no está autenticado o no es premium, mostrar el mensaje de bloqueo
  return (
    <div className="relative border border-yellow-200 rounded-lg p-4 bg-yellow-50">
      <div className="text-center py-8">
        <LockIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Contenido Premium</h3>
        <p className="text-yellow-600 mb-4">
          {message || "Este contenido está disponible exclusivamente para suscriptores premium."}
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/planes">Ver planes</Link>
          </Button>
          {!user && (
            <Button asChild variant="outline">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

