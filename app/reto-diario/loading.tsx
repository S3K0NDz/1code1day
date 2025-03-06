import { Loader2 } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function Loading() {
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white text-black px-4 py-2 text-3xl font-bold">1code</div>
            <div className="text-white text-3xl font-bold px-2">1day</div>
          </div>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-lg">Cargando el reto diario...</span>
          </div>
        </div>
      </div>
    </InteractiveGridBackground>
  )
}

