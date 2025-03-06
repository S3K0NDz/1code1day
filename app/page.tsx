import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Trophy, Users } from "lucide-react"
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

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-6 max-w-3xl mx-auto">
              La plataforma de retos de programación en español para mejorar tus habilidades y prepararte para
              entrevistas técnicas
            </h1>
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

          {/* Stats Section */}
          <section className="my-32">
            <h2 className="text-4xl font-bold text-center mb-6">Nuestra Comunidad en Números</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
              Descubre el impacto que estamos teniendo en la comunidad de desarrolladores
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-border bg-card/50 p-8 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-6 mx-auto">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="text-4xl font-bold text-center mb-2">365+</h3>
                <p className="text-center text-muted-foreground">Retos de programación</p>
              </div>
              <div className="border border-border bg-card/50 p-8 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-6 mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-4xl font-bold text-center mb-2">10,000+</h3>
                <p className="text-center text-muted-foreground">Desarrolladores activos</p>
              </div>
              <div className="border border-border bg-card/50 p-8 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-6 mx-auto">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-4xl font-bold text-center mb-2">50,000+</h3>
                <p className="text-center text-muted-foreground">Soluciones enviadas</p>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="my-32">
            <h2 className="text-4xl font-bold text-center mb-6">Planes de Suscripción</h2>
            <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades de aprendizaje
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="border border-border bg-card/50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">Gratis</h3>
                <p className="text-muted-foreground mb-4">Comienza tu viaje de programación</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">€0</span>
                  <span className="text-muted-foreground">/mes</span>
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
                </ul>
                <Button className="w-full">Comenzar Gratis</Button>
              </div>

              {/* Pro Plan */}
              <div className="border border-primary bg-card/80 p-8 rounded-lg scale-105 shadow-lg">
                <div className="bg-primary/20 text-primary-foreground text-sm font-medium px-3 py-1 rounded-full w-fit mb-4">
                  Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-muted-foreground mb-4">Para desarrolladores comprometidos</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">€9.99</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Todos los retos diarios</span>
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
                <Button className="w-full">Suscribirse</Button>
              </div>

              {/* Enterprise Plan */}
              <div className="border border-border bg-card/50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">Empresas</h3>
                <p className="text-muted-foreground mb-4">Para equipos y organizaciones</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">€29.99</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Todo lo de Pro</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Retos personalizados</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Ranking de equipo</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Administración de usuarios</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contactar
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </InteractiveGridBackground>
  )
}

