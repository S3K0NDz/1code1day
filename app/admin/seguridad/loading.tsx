import { Loader2 } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function Loading() {
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando seguridad...</p>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

