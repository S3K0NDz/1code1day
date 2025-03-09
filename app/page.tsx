"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { JavaScriptLogo } from "@/components/javascript-logo"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [stats, setStats] = useState({
    totalRetos: 0,
    isLoading: true,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Obtener el conteo de retos publicados
        const { count, error } = await supabase.from("retos").select("id", { count: "exact" }).eq("published", true)

        if (error) throw error

        setStats({
          totalRetos: count || 0,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error al obtener estadísticas:", error)
        setStats((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchStats()
  }, [])

  return (
    <InteractiveGridBackground>
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:py-16 max-w-7xl">
          {/* Header */}
          <header className="flex justify-center mb-8 sm:mb-16">
            <div className="flex items-center">
              <div className="bg-white text-black px-3 py-1 sm:px-4 sm:py-2 text-2xl sm:text-3xl font-bold">1code</div>
              <div className="text-white text-2xl sm:text-3xl font-bold px-1 sm:px-2">1day</div>
            </div>
          </header>

          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-24">
            <div className="flex flex-col items-center mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-center sm:text-left">
                  La plataforma de retos diarios
                </h1>
                <JavaScriptLogo size={56} className="mt-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">JavaScript</h2>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto px-4">
              Mejora tus habilidades de JavaScript con un nuevo desafío cada día. Aprende, practica y crece como
              desarrollador.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 px-4">
              <Link href="/reto-diario" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
              <Link href="/registro" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="group w-full">
                  Registrarse
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Sección de estadísticas con datos reales - MOVIDA ARRIBA */}
          <div className="mb-16 sm:mb-24 py-12 sm:py-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Nuestra biblioteca de retos</h2>

              {stats.isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                  <span className="ml-3 text-lg">Cargando...</span>
                </div>
              ) : (
                <div className="py-8 px-4">
                  <div className="text-5xl sm:text-6xl font-bold text-yellow-400 mb-4">{stats.totalRetos}</div>
                  <h3 className="text-xl sm:text-2xl font-medium mb-3">Retos de JavaScript</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                    Desde manipulación del DOM hasta algoritmos avanzados y patrones de diseño. Practica con nuestra
                    amplia colección de desafíos para todos los niveles.
                  </p>

                  <div className="mt-8">
                    <Link href="/retos" className="w-full sm:w-auto inline-block">
                      <Button size="lg" className="w-full sm:w-auto">
                        Explorar todos los retos
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <section className="my-16 sm:my-32 px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">Planes de Suscripción</h2>
            <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 sm:mb-16 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades para dominar JavaScript
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="border border-border bg-card/50 p-6 sm:p-8 rounded-lg hover:border-primary/50 transition-colors duration-300 flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Gratis</h3>
                  <p className="text-muted-foreground mb-4">Comienza tu viaje de programación</p>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-bold">€0</span>
                    <span className="text-muted-foreground">/para siempre</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>1 reto diario</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Editor de código básico</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Acceso a comunidad</span>
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="mr-2">✗</span>
                      <span>Sin acceso a retos anteriores</span>
                    </li>
                  </ul>
                </div>
                <Link href="/registro" className="w-full">
                  <Button className="w-full mt-auto">Comenzar Gratis</Button>
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="border border-primary bg-card/80 p-6 sm:p-8 rounded-lg shadow-lg flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0">
                  <div className="bg-blue-600 text-white text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 rounded-md shadow-md">
                    Recomendado
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-muted-foreground mb-4">Acceso completo a todas las funciones</p>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-bold">€5</span>
                    <span className="text-muted-foreground">/mes</span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">o €4/mes facturado anualmente</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Todos los retos diarios</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Acceso a todos los retos anteriores</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Editor de código avanzado</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Soluciones explicadas</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Estadísticas personales</span>
                    </li>
                  </ul>
                </div>
                <Link href="/checkout?plan=premium&billing=monthly" className="w-full">
                  <Button className="w-full mt-auto">Suscribirse</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Footer simplificado con logo y redes sociales */}
          <footer className="mt-16 sm:mt-24 mb-8 border-t border-border pt-8 sm:pt-12">
            <div className="flex flex-col items-center justify-center">
              {/* Logo */}
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="bg-white text-black px-2 py-1 sm:px-3 sm:py-1 text-lg sm:text-xl font-bold">1code</div>
                <div className="text-white text-lg sm:text-xl font-bold px-1">1day</div>
              </div>

              {/* Redes sociales */}
              <div className="flex space-x-4 sm:space-x-6 mb-6 sm:mb-8">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 2a9.96 9.96 0 0 0-7.071 2.929A9.96 9.96 0 0 0 2 12a9.96 9.96 0 0 0 2.929 7.071A9.96 9.96 0 0 0 12 22a9.96 9.96 0 0 0 7.071-2.929A9.96 9.96 0 0 0 22 12a9.96 9.96 0 0 0-2.929-7.071A9.96 9.96 0 0 0 12 2zm0 4c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm-1 17v-9h2v9h-2z"></path>
                  </svg>
                </a>
              </div>

              {/* Copyright */}
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} 1code1day. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </InteractiveGridBackground>
  )
}

