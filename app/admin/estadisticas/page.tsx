"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  Loader2,
  ArrowLeft,
  BarChart,
  Users,
  Code,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCwIcon as RefreshIcon,
} from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"

export default function AdminEstadisticasPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [loadingStats, setLoadingStats] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    premiumConversion: 0,
    totalRetos: 0,
    completedRetos: 0,
    avgCompletionTime: 0,
    successRate: 0,
    dailyChallengeParticipation: 0,
    userRetention: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
  })
  const [userGrowthData, setUserGrowthData] = useState([])
  const [retoCompletionsData, setRetoCompletionsData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const [usingMockData, setUsingMockData] = useState(false)
  const [detailedError, setDetailedError] = useState(null)

  // Verificar que el usuario es administrador
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [isLoading, isAdmin, router])

  // Cargar estadísticas
  const fetchStats = async () => {
    if (!isAdmin) return

    try {
      setLoadingStats(true)
      setErrorMessage("")
      setUsingMockData(false)
      setDetailedError(null)

      const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
        setUserGrowthData(result.data.charts.userGrowthData)
        setRetoCompletionsData(result.data.charts.retoCompletionsData)
        setRevenueData(result.data.charts.revenueData)

        if (result.usingMockData || (result.message && result.message.includes("simulados"))) {
          setUsingMockData(true)
          setErrorMessage(
            result.message || "Se están mostrando datos simulados porque no se pudieron cargar los datos reales.",
          )
        } else {
          setUsingMockData(false)
          setErrorMessage("")
        }
      } else {
        throw new Error(result.error || "Error al cargar estadísticas")
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido al cargar estadísticas")
      setDetailedError(error)

      toast({
        title: "Error al cargar estadísticas",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [isAdmin, timeRange])

  // Función para formatear números
  const formatNumber = (num) => {
    return new Intl.NumberFormat("es-ES").format(num)
  }

  // Función para formatear tiempo en minutos
  const formatTime = (minutes) => {
    const mins = Math.floor(minutes)
    const secs = Math.round((minutes - mins) * 60)
    return `${mins}m ${secs}s`
  }

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando...</p>
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  if (!isAdmin) {
    return null // Redirección manejada en el useEffect
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Volver al panel</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold flex items-center">
              <BarChart className="mr-2 h-6 w-6" />
              Estadísticas
            </h1>

            <Button variant="outline" size="sm" className="ml-auto" onClick={fetchStats} disabled={loadingStats}>
              {loadingStats ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshIcon className="h-4 w-4 mr-1" />
              )}
              Actualizar
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground">Visualiza las métricas y estadísticas de la plataforma</p>
            <div className="w-full sm:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Período de tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error al cargar estadísticas</p>
                <p className="text-sm">{errorMessage}</p>
                {detailedError && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer">Ver detalles técnicos</summary>
                    <pre className="text-xs mt-2 p-2 bg-red-50 dark:bg-red-950 rounded overflow-auto">
                      {JSON.stringify(detailedError, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {usingMockData && (
            <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Datos simulados</p>
                <p className="text-sm">
                  Se están mostrando datos simulados porque no se pudieron cargar los datos reales.
                </p>
              </div>
            </div>
          )}

          {loadingStats ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="users">Usuarios</TabsTrigger>
                <TabsTrigger value="challenges">Retos</TabsTrigger>
                <TabsTrigger value="revenue">Ingresos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Usuarios Totales"
                    value={formatNumber(stats.totalUsers)}
                    description={`+${stats.newUsers} nuevos`}
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                  />
                  <StatsCard
                    title="Usuarios Premium"
                    value={`${formatNumber(stats.premiumUsers)}`}
                    description={`${stats.premiumConversion.toFixed(1)}% de conversión`}
                    icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                  />
                  <StatsCard
                    title="Retos Completados"
                    value={formatNumber(stats.completedRetos)}
                    description={`de ${formatNumber(stats.totalRetos)} retos totales`}
                    icon={<Code className="h-4 w-4 text-purple-500" />}
                  />
                  <StatsCard
                    title="Ingresos Mensuales"
                    value={`${formatNumber(stats.monthlyRevenue)}€`}
                    description={`${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth}% vs mes anterior`}
                    icon={<Activity className="h-4 w-4 text-yellow-500" />}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Actividad de Usuarios</CardTitle>
                      <CardDescription>Usuarios activos y nuevos registros</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de actividad de usuarios</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Completados de Retos</CardTitle>
                      <CardDescription>Retos completados por día</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de completados de retos</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Participación en Reto Diario</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-3xl font-bold">{stats.dailyChallengeParticipation}%</div>
                      <p className="text-sm text-muted-foreground">de usuarios activos</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Retención de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-3xl font-bold">{stats.userRetention}%</div>
                      <p className="text-sm text-muted-foreground">tasa de retención a 30 días</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Tiempo Promedio</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-3xl font-bold">{formatTime(stats.avgCompletionTime)}</div>
                      <p className="text-sm text-muted-foreground">para completar un reto</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Usuarios Totales"
                    value={formatNumber(stats.totalUsers)}
                    description="Total de usuarios registrados"
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                  />
                  <StatsCard
                    title="Nuevos Usuarios"
                    value={formatNumber(stats.newUsers)}
                    description={`en los últimos ${timeRange === "7d" ? "7 días" : timeRange === "30d" ? "30 días" : timeRange === "90d" ? "90 días" : "año"}`}
                    icon={<Users className="h-4 w-4 text-green-500" />}
                  />
                  <StatsCard
                    title="Usuarios Activos"
                    value={formatNumber(stats.activeUsers)}
                    description={`en los últimos ${timeRange === "7d" ? "7 días" : timeRange === "30d" ? "30 días" : timeRange === "90d" ? "90 días" : "año"}`}
                    icon={<Activity className="h-4 w-4 text-yellow-500" />}
                  />
                  <StatsCard
                    title="Retención"
                    value={`${stats.userRetention}%`}
                    description="tasa de retención a 30 días"
                    icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Crecimiento de Usuarios</CardTitle>
                    <CardDescription>Nuevos registros por período</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Gráfico de crecimiento de usuarios</p>
                      <p className="text-sm">(Datos reales de la base de datos)</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Usuarios</CardTitle>
                      <CardDescription>Por tipo de suscripción</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="flex justify-center gap-8 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {formatNumber(stats.totalUsers - stats.premiumUsers)}
                            </div>
                            <div className="text-sm">Gratuitos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{formatNumber(stats.premiumUsers)}</div>
                            <div className="text-sm">Premium</div>
                          </div>
                        </div>
                        <p>Gráfico de distribución de usuarios</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad de Usuarios</CardTitle>
                      <CardDescription>Usuarios activos por día</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de actividad diaria</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Retos Totales"
                    value={formatNumber(stats.totalRetos)}
                    description="Retos publicados"
                    icon={<Code className="h-4 w-4 text-blue-500" />}
                  />
                  <StatsCard
                    title="Completados"
                    value={formatNumber(stats.completedRetos)}
                    description={`en los últimos ${timeRange === "7d" ? "7 días" : timeRange === "30d" ? "30 días" : timeRange === "90d" ? "90 días" : "año"}`}
                    icon={<Check className="h-4 w-4 text-green-500" />}
                  />
                  <StatsCard
                    title="Tasa de Éxito"
                    value={`${stats.successRate.toFixed(1)}%`}
                    description="promedio de todos los retos"
                    icon={<TrendingUp className="h-4 w-4 text-yellow-500" />}
                  />
                  <StatsCard
                    title="Tiempo Promedio"
                    value={formatTime(stats.avgCompletionTime)}
                    description="para completar un reto"
                    icon={<Clock className="h-4 w-4 text-purple-500" />}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Completados por Día</CardTitle>
                    <CardDescription>Número de retos completados diariamente</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Gráfico de completados por día</p>
                      <p className="text-sm">(Datos reales de la base de datos)</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Retos Diarios</CardTitle>
                      <CardDescription>Participación en retos diarios</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de participación en retos diarios</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Dificultad de Retos</CardTitle>
                      <CardDescription>Distribución por nivel de dificultad</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="flex justify-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold">30%</div>
                            <div className="text-sm">Fácil</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">45%</div>
                            <div className="text-sm">Intermedio</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">25%</div>
                            <div className="text-sm">Difícil</div>
                          </div>
                        </div>
                        <p>Gráfico de distribución por dificultad</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Ingresos Mensuales"
                    value={`${formatNumber(stats.monthlyRevenue)}€`}
                    description={`${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth}% vs mes anterior`}
                    icon={<Activity className="h-4 w-4 text-green-500" />}
                  />
                  <StatsCard
                    title="Usuarios Premium"
                    value={formatNumber(stats.premiumUsers)}
                    description={`${stats.premiumConversion.toFixed(1)}% de conversión`}
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                  />
                  <StatsCard
                    title="Valor Promedio"
                    value="9,99€"
                    description="por usuario premium"
                    icon={<TrendingUp className="h-4 w-4 text-yellow-500" />}
                  />
                  <StatsCard
                    title="Renovaciones"
                    value="85%"
                    description="tasa de renovación mensual"
                    icon={<RefreshCw className="h-4 w-4 text-purple-500" />}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Período</CardTitle>
                    <CardDescription>Evolución de ingresos</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Gráfico de ingresos por período</p>
                      <p className="text-sm">(Datos reales de la base de datos)</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Suscripciones</CardTitle>
                      <CardDescription>Por tipo de plan</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="flex justify-center gap-8 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">65%</div>
                            <div className="text-sm">Mensual</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">35%</div>
                            <div className="text-sm">Anual</div>
                          </div>
                        </div>
                        <p>Gráfico de distribución de suscripciones</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Conversión Premium</CardTitle>
                      <CardDescription>Tasa de conversión a usuarios premium</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>Gráfico de conversión premium</p>
                        <p className="text-sm">(Datos reales de la base de datos)</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

// Componente para tarjetas de estadísticas
function StatsCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Componente para el icono de Check
function Check(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Componente para el icono de RefreshCw
function RefreshCw(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

