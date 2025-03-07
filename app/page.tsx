import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function Home() {
  return (
    <InteractiveGridBackground>
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          {/* Header */}
          <header className="flex justify-center mb-16">
            <div className="flex items-center">
              <div className="bg-white text-black px-4 py-2 text-3xl font-bold">1code</div>
              <div className="text-white text-3xl font-bold px-2">1day</div>
            </div>
          </header>

          {/* Hero Section - Ligeramente mejorado pero manteniendo el minimalismo */}
          <div className="text-center mb-24">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
              La plataforma de retos de programación diarios
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Mejora tus habilidades de programación con un nuevo desafío cada día. Aprende, practica y crece como
              desarrollador.
            </p>
            <div className="flex gap-4 justify-center mt-10">
              <Link href="/reto-diario">
                <Button size="lg" className="group">
                  Comenzar ahora
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
              <Link href="/registro">
                <Button size="lg" variant="outline" className="group">
                  Registrarse
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Pricing Section - Manteniendo el estilo minimalista */}
          <section className="my-32">
            <h2 className="text-4xl font-bold text-center mb-6">Planes de Suscripción</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades de aprendizaje
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="border border-border bg-card/50 p-8 rounded-lg hover:border-primary/50 transition-colors duration-300 flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">Gratis</h3>
                  <p className="text-muted-foreground mb-4">Comienza tu viaje de programación</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">€0</span>
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
                <Button className="w-full mt-auto">Comenzar Gratis</Button>
              </div>

              {/* Premium Plan */}
              <div className="border border-primary bg-card/80 p-8 rounded-lg shadow-lg flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0">
                  <div className="bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-md shadow-md">
                    Recomendado
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-muted-foreground mb-4">Acceso completo a todas las funciones</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">€5</span>
                    <span className="text-muted-foreground">/mes</span>
                    <p className="text-sm text-muted-foreground mt-1">o €4/mes facturado anualmente</p>
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
                <Button className="w-full mt-auto">Suscribirse</Button>
              </div>
            </div>
          </section>

          {/* Footer simplificado con logo y redes sociales */}
          <footer className="mt-24 mb-8 border-t border-border pt-12">
            <div className="flex flex-col items-center justify-center">
              {/* Logo */}
              <div className="flex items-center mb-8">
                <div className="bg-white text-black px-3 py-1 text-xl font-bold">1code</div>
                <div className="text-white text-xl font-bold px-1">1day</div>
              </div>

              {/* Redes sociales */}
              <div className="flex space-x-6 mb-8">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                    width="24"
                    height="24"
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
                    width="24"
                    height="24"
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
                    width="24"
                    height="24"
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
                    width="24"
                    height="24"
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
              <div className="text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} 1code1day. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </InteractiveGridBackground>
  )
}

