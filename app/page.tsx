"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Code, Terminal, Play, UserPlus, Check, X } from "lucide-react"
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
        <div className="container mx-auto px-4 py-8 sm:py-16 max-w-5xl">
          {/* Header con logo animado */}
          <header className="flex justify-center mb-8 sm:mb-12">
            <AnimatedLogo />
          </header>

          {/* Hero Section - Con ventana muy translúcida */}
          <section className="mb-16" aria-labelledby="hero-heading">
            <div className="bg-[#121212]/30 backdrop-blur-md border border-gray-800/40 rounded-lg overflow-hidden shadow-xl">
              {/* macOS window header */}
              <div className="bg-[#1e1e1e]/40 px-4 py-2 flex items-center justify-between border-b border-gray-800/40">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-gray-300" />
                  <span className="text-sm text-gray-300 font-mono">index.js</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h1 id="hero-heading" className="sr-only">
                  1Code1Day - Un reto de código cada día
                </h1>

                <div className="text-green-400 font-mono text-sm mb-4">// Bienvenido a 1code1day</div>

                {/* Logo de JavaScript destacado en el centro */}
                <div className="flex justify-center mb-6">
                  <JavaScriptLogo size={64} />
                </div>

                <div className="mb-6 space-y-2 font-mono text-sm sm:text-base">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white text-center">
                    Mejora tus habilidades con un reto diario de JavaScript
                  </h2>
                  <p className="text-gray-200 mb-4 text-center">
                    Practica, aprende y perfecciona tu código con desafíos interactivos
                  </p>
                </div>

                <div className="bg-[#1e1e1e]/30 backdrop-blur-md p-3 rounded mb-6 font-mono text-sm sm:text-base">
                  <div className="flex flex-wrap items-center">
                    <span className="text-blue-400">import</span>
                    <span className="text-white mx-1">*</span>
                    <span className="text-blue-400">as</span>
                    <span className="text-yellow-300 ml-1">JavaScript</span>
                    <span className="text-white ml-1">from</span>
                    <span className="text-green-300 ml-1">'1code1day'</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/reto-diario" className="block">
                    <div className="bg-[#2a2a2a]/40 hover:bg-[#333]/50 transition-colors p-3 rounded border border-blue-600/30 group">
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
                    <div className="bg-[#2a2a2a]/40 hover:bg-[#333]/50 transition-colors p-3 rounded border border-gray-600/30 group">
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
          </section>

          {/* Stats Section - Con ventana muy translúcida */}
          <section className="mb-16" aria-labelledby="stats-heading">
            <div className="bg-[#121212]/30 backdrop-blur-md border border-gray-800/40 rounded-lg overflow-hidden shadow-xl">
              <div className="bg-[#1e1e1e]/40 px-4 py-2 flex items-center justify-between border-b border-gray-800/40">
                <div className="flex items-center">
                  <Terminal className="h-4 w-4 mr-2 text-gray-300" />
                  <span className="text-sm text-gray-300 font-mono">stats.js</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h2 id="stats-heading" className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                  Nuestra biblioteca de retos
                </h2>

                {stats.isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
                    <span className="ml-3 text-lg">Cargando...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#1e1e1e]/30 backdrop-blur-md p-4 rounded-lg border border-gray-700/40">
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

                    <div className="text-center">
                      <Link
                        href="/retos"
                        className="inline-flex items-center bg-[#2a2a2a]/40 hover:bg-[#333]/50 transition-colors p-3 rounded border border-blue-600/30 group"
                      >
                        <Code className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-blue-400 font-mono">function</span>
                        <span className="text-yellow-300 font-mono ml-1">explorarRetos()</span>
                        <ArrowRight className="ml-2 h-4 w-4 text-blue-400 group-hover:translate-x-1 transition" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Pricing Section - Con ventana muy translúcida */}
          <section className="mb-16" aria-labelledby="pricing-heading">
            <div className="bg-[#121212]/30 backdrop-blur-md rounded-lg border border-gray-800/40 overflow-hidden shadow-xl">
              <div className="bg-[#1e1e1e]/40 px-4 py-2 flex items-center justify-between border-b border-gray-800/40">
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-gray-300" />
                  <span className="text-sm text-gray-300 font-mono">pricing.js</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                </div>
              </div>

              <div className="p-6">
                <h2 id="pricing-heading" className="text-3xl font-bold text-center mb-6 text-white">
                  Planes de Suscripción
                </h2>
                <p className="text-center text-gray-200 mb-8 max-w-3xl mx-auto">
                  Elige el plan que mejor se adapte a tus necesidades para dominar JavaScript
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Free Plan */}
                  <div className="bg-[#1a1a1a]/40 backdrop-blur-md rounded-lg border-2 border-gray-800/40 overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between bg-black/40 px-4 py-2">
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-2 text-white" />
                        <span className="text-xs text-white">plan-gratis.js</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 flex items-center">
                        <Code className="h-5 w-5 text-primary mr-2" />
                        Gratis
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">Comienza tu viaje de programación</p>

                      <div className="bg-black/20 backdrop-blur-md p-3 rounded-md mb-4">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">€0</span>
                          <span className="text-gray-300 ml-2 text-sm">para siempre</span>
                        </div>
                      </div>

                      <ul className="space-y-1 text-sm mb-4">
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
                          <span className="text-gray-400">Sin acceso a retos anteriores</span>
                        </li>
                      </ul>

                      <Link href="/registro">
                        <Button variant="outline" className="w-full">
                          Comenzar Gratis
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Premium Plan */}
                  <div className="bg-[#1a1a1a]/40 backdrop-blur-md rounded-lg border-2 border-primary/40 overflow-hidden relative shadow-lg">
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary/20 backdrop-blur-md text-primary text-xs font-medium px-2 py-1 rounded-bl-lg">
                        Recomendado
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/40 px-4 py-2">
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-2 text-white" />
                        <span className="text-xs text-white">plan-premium.js</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 flex items-center">
                        <Code className="h-5 w-5 text-primary mr-2" />
                        Premium
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">Acceso completo a todas las funciones</p>

                      <div className="bg-black/20 backdrop-blur-md p-3 rounded-md mb-4">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">€5</span>
                          <span className="text-gray-300 ml-2 text-sm">por mes</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">o €4/mes facturado anualmente</p>
                      </div>

                      <ul className="space-y-1 text-sm mb-4">
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

                      <Link href="/checkout?plan=premium&billing=monthly">
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

          {/* Footer simplificado */}
          <footer className="border-t border-gray-800/30 pt-8 pb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center mb-6">
                <div className="bg-white text-black px-2 py-1 text-lg font-bold">1code</div>
                <div className="text-white text-lg font-bold px-1">1day</div>
              </div>

              <nav className="flex flex-wrap justify-center gap-6 mb-6">
                <Link href="/retos" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Retos
                </Link>
                <Link href="/planes" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Planes
                </Link>
                <Link href="/contacto" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
                <Link href="/terminos" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Términos
                </Link>
                <Link href="/privacidad" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Privacidad
                </Link>
              </nav>

              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
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
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
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
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
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
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
              </div>

              <div className="text-xs text-gray-400">
                <p>© {new Date().getFullYear()} 1code1day. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </InteractiveGridBackground>
  )
}

