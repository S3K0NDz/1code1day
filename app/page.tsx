"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Code, Terminal, Calendar, Play, UserPlus, Check, X } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { JavaScriptLogo } from "@/components/javascript-logo"
import { supabase } from "@/lib/supabase"
import { AnimatedLogo } from "@/components/animated-logo"

export default function Home() {
  const [stats, setStats] = useState({
    totalRetos: 0,
    isLoading: true,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
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
          {/* Header con logo animado */}
          <header className="flex justify-center mb-8 sm:mb-16">
            <AnimatedLogo />
          </header>

          {/* Hero Section */}
          <div className="mb-16 sm:mb-24">
            <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden">
              {/* macOS window header */}
              <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono">index.js</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="text-green-400 font-mono text-sm mb-4">// Bienvenido a 1code1day</div>

                <div className="flex items-center mb-6">
                  <JavaScriptLogo size={32} className="mr-3" />
                  <div className="text-sm sm:text-base font-mono overflow-x-auto whitespace-nowrap">
                    <span className="text-blue-400">import</span>
                    <span className="text-white mx-1">*</span>
                    <span className="text-blue-400">as</span>
                    <span className="text-yellow-300 ml-1">JavaScript</span>
                    <span className="text-white ml-1">from</span>
                    <span className="text-green-300 ml-1">'1code1day'</span>
                  </div>
                </div>

                <div className="mb-6 space-y-2 font-mono text-sm sm:text-base">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-blue-400">const</span>
                    <span className="text-yellow-300">plataforma</span>
                    <span className="text-white">=</span>
                    <span className="text-white">{"{"}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-purple-400">nombre:</span>
                      <span className="text-green-300 break-all">
                        "La plataforma de retos diarios de programación",
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-purple-400">lenguaje:</span>
                      <span className="text-green-300">"JavaScript",</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-purple-400">descripción:</span>
                      <span className="text-green-300 break-all">
                        "Mejora tus habilidades con un nuevo desafío cada día"
                      </span>
                    </div>
                  </div>
                  <div className="text-white">{"}"}</div>
                </div>

                <div className="bg-[#1e1e1e] p-3 rounded mb-6">
                  <div className="flex items-center text-sm sm:text-base font-mono">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-blue-400">const</span>
                    <span className="text-yellow-300 ml-1">fechaActual</span>
                    <span className="text-white ml-1">=</span>
                    <span className="text-green-300 ml-1">"{new Date().toISOString().split("T")[0]}"</span>
                  </div>
                </div>

                <div className="text-green-400 font-mono text-sm mb-4">// Funciones disponibles:</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/reto-diario" className="block">
                    <div className="bg-[#2a2a2a] hover:bg-[#333] transition-colors p-3 rounded border border-blue-600/30 group">
                      <div className="flex items-center text-sm">
                        <Play className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-blue-400 font-mono">function</span>
                        <span className="text-yellow-300 font-mono ml-1">comenzarAhora()</span>
                      </div>
                      <div className="pl-6 py-1 text-gray-300 font-mono text-xs">// Inicia tu reto diario</div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>

                  <Link href="/registro" className="block">
                    <div className="bg-[#2a2a2a] hover:bg-[#333] transition-colors p-3 rounded border border-gray-600/30 group">
                      <div className="flex items-center text-sm">
                        <UserPlus className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-blue-400 font-mono">function</span>
                        <span className="text-yellow-300 font-mono ml-1">registrarse()</span>
                      </div>
                      <div className="pl-6 py-1 text-gray-300 font-mono text-xs">// Crea tu cuenta</div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-16 sm:mb-24">
            <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden">
              <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center">
                  <Terminal className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono">stats.js</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="text-green-400 font-mono text-sm mb-4">// Biblioteca de retos</div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6">Nuestra biblioteca de retos</h2>
                </div>

                {stats.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                    <span className="ml-3 text-lg">Cargando...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-700">
                      <div className="font-mono text-sm sm:text-base space-y-2">
                        <div className="text-blue-400">const stats = {"{"}</div>
                        <div className="pl-4">
                          <div className="text-purple-400">
                            totalRetos: <span className="text-yellow-300">{stats.totalRetos}</span>,
                          </div>
                          <div className="text-purple-400">
                            lenguaje: <span className="text-green-300">"JavaScript"</span>,
                          </div>
                          <div className="text-purple-400">
                            actualizado:{" "}
                            <span className="text-green-300">"{new Date().toISOString().split("T")[0]}"</span>
                          </div>
                        </div>
                        <div className="text-blue-400">{"}"}</div>
                      </div>
                    </div>

                    <div className="text-center px-4">
                      <h3 className="text-xl sm:text-2xl font-medium mb-3">Retos de JavaScript</h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-6">
                        Desde manipulación del DOM hasta algoritmos avanzados y patrones de diseño. Practica con nuestra
                        amplia colección de desafíos para todos los niveles.
                      </p>

                      <Link href="/retos">
                        <div className="inline-block bg-[#2a2a2a] hover:bg-[#333] transition-colors p-3 rounded border border-blue-600/30 group">
                          <div className="flex items-center text-sm">
                            <Code className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="text-blue-400 font-mono">function</span>
                            <span className="text-yellow-300 font-mono ml-1">explorarRetos()</span>
                            <ArrowRight className="ml-2 h-4 w-4 text-blue-400 group-hover:translate-x-1 transition" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section - Actualizada */}
          <section className="my-16 sm:my-32">
            <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
              {/* macOS window header */}
              <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono">pricing.js</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="text-green-400 font-mono text-sm mb-4">// Planes de suscripción</div>

                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 text-white">
                    Planes de Suscripción
                  </h2>
                  <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 max-w-3xl mx-auto">
                    Elige el plan que mejor se adapte a tus necesidades para dominar JavaScript
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                  {/* Free Plan */}
                  <div className="bg-[#1a1a1a] rounded-lg border-2 border-gray-800 overflow-hidden">
                    {/* Barra superior estilo editor de código */}
                    <div className="flex items-center justify-between bg-black/80 px-4 py-2">
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-2 text-white" />
                        <span className="text-xs text-white">plan-gratis.js</span>
                      </div>
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-6">
                      {/* Encabezado con nombre del plan */}
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Code className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-xl font-bold">Gratis</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Comienza tu viaje de programación</p>
                      </div>

                      {/* Precio */}
                      <div className="bg-black/10 p-3 rounded-md mb-4">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">€0</span>
                          <span className="text-muted-foreground ml-2 text-sm">para siempre</span>
                        </div>
                      </div>

                      {/* Características */}
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-blue-500 text-sm mr-2">// Incluye:</span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>1 reto diario</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>Editor de código básico</span>
                          </li>
                          <li className="flex items-start">
                            <X className="h-4 w-4 text-red-500 mr-2 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">Sin acceso a retos anteriores</span>
                          </li>
                        </ul>
                      </div>

                      {/* Botón de acción */}
                      <Link href="/registro" className="w-full">
                        <Button variant="outline" className="w-full">
                          Comenzar Gratis
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Premium Plan */}
                  <div className="bg-[#1a1a1a] rounded-lg border-2 border-primary overflow-hidden relative">
                    {/* Etiqueta de recomendado */}
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-bl-lg">
                        Recomendado
                      </div>
                    </div>

                    {/* Barra superior estilo editor de código */}
                    <div className="flex items-center justify-between bg-black/80 px-4 py-2">
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-2 text-white" />
                        <span className="text-xs text-white">plan-premium.js</span>
                      </div>
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-6">
                      {/* Encabezado con nombre del plan */}
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Code className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-xl font-bold">Premium</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Acceso completo a todas las funciones</p>
                      </div>

                      {/* Precio */}
                      <div className="bg-black/10 p-3 rounded-md mb-4">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">€5</span>
                          <span className="text-muted-foreground ml-2 text-sm">por mes</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">o €4/mes facturado anualmente</p>
                      </div>

                      {/* Características */}
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <span className="text-blue-500 text-sm mr-2">// Incluye:</span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>Todos los retos diarios</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>Acceso a todos los retos anteriores</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>Editor de código avanzado</span>
                          </li>
                        </ul>
                      </div>

                      {/* Botón de acción */}
                      <Link href="/checkout?plan=premium&billing=monthly" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90">Suscribirse</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <Link href="/planes" className="inline-flex items-center text-primary hover:underline">
                    <span>Ver todos los detalles de los planes</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Footer simplificado con logo y redes sociales */}
          <footer className="mt-16 sm:mt-24 mb-8 border-t border-gray-800 pt-8 sm:pt-12">
            <div className="flex flex-col items-center justify-center">
              {/* Logo */}
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="bg-white text-black px-2 py-1 sm:px-3 sm:py-1 text-lg sm:text-xl font-bold">1code</div>
                <div className="text-white text-lg sm:text-xl font-bold px-1">1day</div>
              </div>

              {/* Terminal-style date */}
              <div className="bg-[#1e1e1e] flex items-center px-3 py-1.5 rounded mb-6 text-gray-300">
                <Terminal className="h-4 w-4 mr-2" />
                <span className="font-mono text-sm">© {new Date().getFullYear()} 1code1day</span>
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

