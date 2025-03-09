"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function TerminosPage() {
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Términos y Condiciones</h1>
            <p className="text-muted-foreground">Última actualización: 1 de marzo de 2023</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p>
              Bienvenido a 1code1day. Estos términos y condiciones describen las reglas y regulaciones para el uso del
              sitio web de 1code1day.
            </p>

            <p>
              Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones en su totalidad. No
              continúes usando el sitio web 1code1day si no aceptas todos los términos y condiciones establecidos en
              esta página.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Definiciones</h2>
            <p>
              <strong>a. "Usuario"</strong>: cualquier persona que acceda, navegue o utilice la plataforma 1code1day.
            </p>
            <p>
              <strong>b. "Contenido"</strong>: incluye, pero no se limita a, texto, gráficos, logotipos, iconos,
              imágenes, clips de audio, descargas digitales, recopilaciones de datos, software y código.
            </p>
            <p>
              <strong>c. "Cuenta"</strong>: el registro personal de un usuario en nuestra plataforma que le permite
              acceder a funcionalidades específicas.
            </p>
            <p>
              <strong>d. "Suscripción"</strong>: el servicio de pago que proporciona acceso a funcionalidades premium de
              la plataforma.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Licencia de uso</h2>
            <p>
              Se concede una licencia limitada, no exclusiva, no transferible, revocable para acceder y utilizar
              1code1day estrictamente de acuerdo con estos términos. Esta licencia no incluye:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>La reventa o uso comercial de 1code1day o su contenido</li>
              <li>La reproducción, duplicación, copia o explotación de 1code1day con fines comerciales</li>
              <li>
                Cualquier uso de técnicas de data mining, robots o herramientas similares de recolección y extracción de
                datos
              </li>
              <li>
                La modificación, distribución, transmisión, reproducción, publicación, licenciamiento, creación de
                trabajos derivados, transferencia o venta de cualquier información, software, productos o servicios
                obtenidos a través de 1code1day
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Cuentas de usuario</h2>
            <p>Al crear una cuenta en 1code1day, eres responsable de:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Restringir el acceso a tu computadora y/o cuenta</li>
              <li>Asumir la responsabilidad por todas las actividades realizadas bajo tu cuenta y contraseña</li>
            </ul>
            <p>
              Nos reservamos el derecho de rechazar el servicio, terminar cuentas, eliminar o editar contenido a nuestra
              sola discreción.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Suscripciones y pagos</h2>
            <p>
              Las suscripciones a 1code1day se renuevan automáticamente al final de cada período de facturación. Puedes
              cancelar tu suscripción en cualquier momento desde tu perfil. La cancelación será efectiva al final del
              período de facturación actual.
            </p>
            <p>
              No ofrecemos reembolsos por pagos ya realizados, excepto en circunstancias excepcionales que serán
              evaluadas caso por caso.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Propiedad intelectual</h2>
            <p>
              Todo el contenido publicado en 1code1day es propiedad de 1code1day o de sus proveedores de contenido y
              está protegido por leyes de propiedad intelectual. No está permitido utilizar ningún contenido de
              1code1day sin nuestro consentimiento expreso por escrito.
            </p>
            <p>
              El código que los usuarios escriben y envían a través de la plataforma sigue siendo propiedad intelectual
              de los usuarios. Sin embargo, al enviar soluciones, los usuarios otorgan a 1code1day una licencia mundial,
              no exclusiva, libre de regalías para usar, reproducir y mostrar dicho contenido en relación con los
              servicios de 1code1day.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitación de responsabilidad</h2>
            <p>
              1code1day no será responsable por cualquier daño que surja del uso o la incapacidad de usar los servicios
              de 1code1day, incluyendo pero no limitado a daños directos, indirectos, incidentales, punitivos y
              consecuentes.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Modificaciones de los términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en
              vigor inmediatamente después de su publicación en el sitio web. Es tu responsabilidad revisar
              periódicamente estos términos.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Ley aplicable</h2>
            <p>
              Estos términos se regirán e interpretarán de acuerdo con las leyes de España, sin dar efecto a ningún
              principio de conflictos de leyes.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contacto</h2>
            <p>Si tienes alguna pregunta sobre estos términos, por favor contáctanos en:</p>
            <p>
              Email:{" "}
              <a href="mailto:legal@1code1day.com" className="text-primary hover:underline">
                legal@1code1day.com
              </a>
            </p>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

