"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, HelpCircle, Star, Trophy, Zap, X, Code, Terminal } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"

// Datos de los planes
const PLANS = {
  monthly: [
    {
      name: "Gratis",
      description: "Comienza tu viaje de programación",
      price: "€0",
      period: "para siempre",
      features: ["1 reto diario", "Editor de código básico", "Acceso a comunidad", "Estadísticas básicas"],
      limitations: [
        "Sin acceso a retos anteriores",
        "Sin soluciones explicadas",
        "Sin modo práctica",
        "Sin certificados",
      ],
      cta: "Comenzar Gratis",
      ctaLink: "/registro",
      popular: false,
      color: "border-border bg-card/50",
    },
    {
      name: "Premium",
      description: "Acceso completo a todas las funciones",
      price: "€5",
      period: "por mes",
      features: [
        "Todos los retos diarios",
        "Acceso a todos los retos anteriores",
        "Editor de código avanzado",
        "Soluciones explicadas",
        "Estadísticas personales detalladas",
        "Modo práctica ilimitado",
        "Certificados de logros",
        "Soporte prioritario",
      ],
      limitations: [],
      cta: "Suscribirse",
      ctaLink: "/checkout?plan=premium&billing=monthly",
      popular: true,
      color: "border-primary bg-card/80",
    },
  ],
  annual: [
    {
      name: "Gratis",
      description: "Comienza tu viaje de programación",
      price: "€0",
      period: "para siempre",
      features: ["1 reto diario", "Editor de código básico", "Acceso a comunidad", "Estadísticas básicas"],
      limitations: [
        "Sin acceso a retos anteriores",
        "Sin soluciones explicadas",
        "Sin modo práctica",
        "Sin certificados",
      ],
      cta: "Comenzar Gratis",
      ctaLink: "/registro",
      popular: false,
      color: "border-border bg-card/50",
    },
    {
      name: "Premium",
      description: "Acceso completo a todas las funciones",
      price: "€4",
      period: "por mes, facturado anualmente",
      features: [
        "Todos los retos diarios",
        "Acceso a todos los retos anteriores",
        "Editor de código avanzado",
        "Soluciones explicadas",
        "Estadísticas personales detalladas",
        "Modo práctica ilimitado",
        "Certificados de logros",
        "Soporte prioritario",
      ],
      limitations: [],
      cta: "Suscribirse",
      ctaLink: "/checkout?plan=premium&billing=annual",
      popular: true,
      color: "border-primary bg-card/80",
      savings: "Ahorra un 20%",
    },
  ],
}

// Datos de la tabla comparativa
const FEATURES_COMPARISON = [
  {
    category: "Contenido",
    features: [
      { name: "Reto diario", free: true, premium: true },
      { name: "Acceso a retos anteriores", free: false, premium: true },
      { name: "Soluciones explicadas", free: false, premium: true },
      { name: "Retos de entrevistas técnicas", free: false, premium: true },
    ],
  },
  {
    category: "Herramientas",
    features: [
      { name: "Editor de código básico", free: true, premium: true },
      { name: "Editor de código avanzado", free: false, premium: true },
      { name: "Modo práctica", free: false, premium: true },
      { name: "Depurador integrado", free: false, premium: true },
    ],
  },
  {
    category: "Progreso",
    features: [
      { name: "Estadísticas básicas", free: true, premium: true },
      { name: "Estadísticas avanzadas", free: false, premium: true },
      { name: "Certificados de logros", free: false, premium: true },
      { name: "Seguimiento de progreso", free: false, premium: true },
    ],
  },
  {
    category: "Soporte",
    features: [
      { name: "Soporte comunitario", free: true, premium: true },
      { name: "Soporte prioritario", free: false, premium: true },
      { name: "Guías y tutoriales", free: false, premium: true },
      { name: "Recursos adicionales", free: false, premium: true },
    ],
  },
]

// Datos de testimonios
const TESTIMONIALS = [
  {
    name: "María García",
    role: "Frontend Developer",
    company: "TechStart",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "1code1day me ha ayudado a mejorar mis habilidades de JavaScript de manera constante. Los retos diarios son desafiantes pero accesibles, y las soluciones explicadas son muy educativas.",
  },
  {
    name: "Carlos Rodríguez",
    role: "Full Stack Developer",
    company: "DevHouse",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "Gracias a la suscripción Pro, pude practicar para mis entrevistas técnicas y conseguir mi trabajo soñado. La inversión valió completamente la pena.",
  },
  {
    name: "Laura Martínez",
    role: "CTO",
    company: "InnoTech",
    avatar: "/placeholder.svg?height=80&width=80",
    content:
      "Implementamos 1code1day en nuestro equipo de desarrollo y hemos visto una mejora notable en las habilidades de resolución de problemas. El plan Empresas nos permite hacer seguimiento del progreso de todo el equipo.",
  },
]

// Datos de preguntas frecuentes
const FAQS = [
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí, puedes actualizar tu plan en cualquier momento. Si decides cambiar de un plan anual a uno mensual o viceversa, el cambio se aplicará al final de tu ciclo de facturación actual. Los cambios de plan se prorratean según el tiempo restante de tu suscripción actual.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal y transferencia bancaria para planes empresariales. Todas las transacciones están protegidas con encriptación SSL y cumplimos con los estándares PCI DSS.",
  },
  {
    question: "¿Ofrecen descuentos para estudiantes?",
    answer:
      "Sí, ofrecemos un 50% de descuento en el plan Pro para estudiantes verificados. Para solicitar el descuento, regístrate con tu correo electrónico institucional o envíanos un comprobante de matrícula a estudiantes@1code1day.com.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. Si cancelas, mantendrás el acceso hasta el final del período de facturación actual. No realizamos reembolsos por períodos parciales.",
  },
  {
    question: "¿Qué incluye exactamente el editor de código avanzado?",
    answer:
      "El editor de código avanzado incluye resaltado de sintaxis para múltiples lenguajes, autocompletado inteligente, depuración en tiempo real, formateo automático, integración con linters, temas personalizables y la posibilidad de guardar y compartir snippets de código.",
  },
  {
    question: "¿Cómo funciona el plan Empresas para equipos grandes?",
    answer:
      "El plan Empresas está diseñado para equipos de cualquier tamaño. Ofrecemos precios por volumen para equipos de más de 10 personas. Incluye un panel de administración para gestionar usuarios, asignar retos personalizados, ver estadísticas del equipo y generar informes de progreso. Contacta con nuestro equipo de ventas para obtener una demo personalizada.",
  },
]

export default function PlanesPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly")
  const plans = billingPeriod === "monthly" ? PLANS.monthly : PLANS.annual

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Planes y Precios</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades y comienza a mejorar tus habilidades de programación
              hoy mismo.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <Tabs value={billingPeriod} onValueChange={setBillingPeriod} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Mensual</TabsTrigger>
                <TabsTrigger value="annual">
                  Anual
                  <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 border-green-500/20">
                    Ahorra 20%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden font-mono border-2 ${
                  plan.popular ? "border-primary" : "border-border"
                }`}
              >
                {/* Barra superior estilo editor de código */}
                <div className="flex items-center justify-between bg-black/80 px-4 py-2">
                  <div className="flex items-center">
                    <Terminal className="h-4 w-4 mr-2 text-white" />
                    <span className="text-xs text-white">plan-{plan.name.toLowerCase()}.js</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                {/* Contenido principal */}
                <div className="p-6 bg-black/5">
                  {/* Encabezado con nombre del plan */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <Code className="h-5 w-5 text-primary mr-2" />
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      {plan.popular && (
                        <Badge className="ml-2 bg-primary/20 text-primary border-primary/20">Recomendado</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Precio */}
                  <div className="bg-black/10 p-4 rounded-md mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/20">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Características */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <span className="text-blue-500 mr-2">// Incluye:</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitaciones */}
                  {plan.limitations.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <span className="text-yellow-500 mr-2">// Limitaciones:</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, i) => (
                          <li key={i} className="flex items-start">
                            <X className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botón de acción */}
                <CardFooter className="p-6 bg-black/10 border-t border-border">
                  <Link href={plan.ctaLink} className="w-full">
                    <Button
                      className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">Comparación de características</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium">Característica</th>
                    <th className="text-center py-4 px-4 font-medium">Gratis</th>
                    <th className="text-center py-4 px-4 font-medium">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES_COMPARISON.map((category, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      <tr className="bg-muted/30">
                        <td colSpan={3} className="py-3 px-4 font-medium">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={featureIndex} className="border-b border-border">
                          <td className="py-3 px-4">{feature.name}</td>
                          <td className="text-center py-3 px-4">
                            {feature.free ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {feature.premium ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">Lo que dicen nuestros usuarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index} className="border-border bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <img
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                    <div className="flex mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Encuentra respuestas a las preguntas más comunes sobre nuestros planes y servicios.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-12 bg-gradient-to-r from-primary/10 to-primary/5 p-12 rounded-lg border border-primary/20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Comienza tu viaje de programación hoy</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Únete a miles de desarrolladores que mejoran sus habilidades cada día con 1code1day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/registro">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Zap className="mr-2 h-5 w-5" />
                    Comenzar gratis
                  </Button>
                </Link>
                <Link href="/checkout?plan=premium">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Trophy className="mr-2 h-5 w-5" />
                    Obtener Premium
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              ¿Tienes alguna pregunta? Contáctanos en{" "}
              <a href="mailto:info@1code1day.com" className="text-primary hover:underline">
                info@1code1day.com
              </a>
            </p>
            <p className="mt-2">
              Todos los precios están en euros (EUR) e incluyen impuestos aplicables.
              <br />
              Las suscripciones se renuevan automáticamente al final del período.
            </p>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

