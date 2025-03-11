import { Skeleton } from "@/components/ui/skeleton"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function LoadingRanking() {
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex flex-col">
        <NavbarWithUser />
        <main className="container mx-auto px-4 py-6 flex-1">
          <div className="flex flex-col gap-6">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-10 w-64" />
              </div>

              <Skeleton className="h-10 w-full md:w-64" />
            </div>

            {/* Información del reto */}
            <div className="bg-black/20 border border-border/40 rounded-lg p-4 md:p-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>

            {/* Tabla de ranking */}
            <div className="bg-black/20 border border-border/40 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40 bg-black/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                        Pos.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tiempo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Completado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Skeleton className="h-6 w-6" />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Skeleton className="h-8 w-8 rounded-full mr-3" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

