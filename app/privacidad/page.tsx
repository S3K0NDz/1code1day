"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function PrivacidadPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Política de Privacidad</h1>
            <p className="text-muted-foreground">Última actualización: 1 de marzo de 2023</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p>
              En 1code1day, accesible desde 1code1day.com, una de nuestras principales prioridades es la privacidad de
              nuestros visitantes. Esta Política de Privacidad contiene los tipos de información que es recopilada y
              registrada por 1code1day y cómo la utilizamos.
            </p>

            <p>
              Si tienes preguntas adicionales o requieres más información sobre nuestra Política de Privacidad, no dudes
              en contactarnos.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Información que recopilamos</h2>
            <p>
              Cuando te registras en nuestro sitio, se te solicita proporcionar cierta información personal, incluyendo:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>Nombre y apellido</li>
              <li>Dirección de correo electrónico</li>
              <li>Nombre de usuario</li>
              <li>Información de pago (para suscripciones premium)</li>
            </ul>

            <p>Además, recopilamos automáticamente cierta información cuando visitas nuestro sitio:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Dirección IP</li>
              <li>Tipo de navegador</li>
              <li>Páginas visitadas</li>
              <li>Tiempo de acceso</li>
              <li>Sistema operativo</li>
              <li>Referencia URL</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Cómo utilizamos tu información</h2>
            <p>Utilizamos la información que recopilamos para:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Proporcionar, operar y mantener nuestro sitio web</li>
              <li>Mejorar, personalizar y expandir nuestro sitio web</li>
              <li>Entender y analizar cómo utilizas nuestro sitio web</li>
              <li>Desarrollar nuevos productos, servicios, características y funcionalidades</li>
              <li>
                Comunicarnos contigo, ya sea directamente o a través de uno de nuestros socios, para proporcionarte
                actualizaciones y otra información relacionada con el sitio web
              </li>
              <li>Enviar correos electrónicos</li>
              <li>Encontrar y prevenir fraudes</li>
              <li>Procesar pagos y gestionar suscripciones</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Cookies</h2>
            <p>
              1code1day utiliza cookies para mejorar la experiencia del usuario. Las cookies son pequeños archivos que
              un sitio o su proveedor de servicios transfiere al disco duro de tu computadora a través de tu navegador
              web (si lo permites) que permite a los sistemas del sitio o proveedor de servicios reconocer tu navegador
              y capturar y recordar cierta información.
            </p>
            <p>Utilizamos cookies para:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Entender y guardar las preferencias del usuario para futuras visitas</li>
              <li>Mantener la sesión del usuario</li>
              <li>Recopilar datos agregados sobre el tráfico del sitio y las interacciones del sitio</li>
              <li>Mejorar nuestro sitio web y productos</li>
            </ul>
            <p>
              Puedes elegir que tu computadora te avise cada vez que se envía una cookie, o puedes elegir desactivar
              todas las cookies. Esto se hace a través de la configuración de tu navegador. Dado que cada navegador es
              un poco diferente, consulta el menú de Ayuda de tu navegador para aprender la manera correcta de modificar
              tus cookies.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Servicios de terceros</h2>
            <p>Podemos emplear servicios de terceros como:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Supabase para autenticación y almacenamiento de datos</li>
              <li>Stripe para procesamiento de pagos</li>
              <li>Google Analytics para análisis de uso del sitio</li>
            </ul>
            <p>
              Estos terceros tienen acceso a tu información personal solo para realizar tareas específicas en nuestro
              nombre y están obligados a no divulgar o usar tu información para ningún otro propósito.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Seguridad de los datos</h2>
            <p>
              La seguridad de tus datos es importante para nosotros, pero recuerda que ningún método de transmisión por
              Internet o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios
              comercialmente aceptables para proteger tu información personal, no podemos garantizar su seguridad
              absoluta.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Derechos de protección de datos</h2>
            <p>
              Queremos asegurarnos de que estés completamente consciente de todos tus derechos de protección de datos.
              Todo usuario tiene derecho a lo siguiente:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>
                <strong>Derecho de acceso</strong> - Tienes derecho a solicitar copias de tus datos personales.
              </li>
              <li>
                <strong>Derecho de rectificación</strong> - Tienes derecho a solicitar que corrijamos cualquier
                información que creas que es inexacta. También tienes derecho a solicitar que completemos la información
                que creas que está incompleta.
              </li>
              <li>
                <strong>Derecho al olvido</strong> - Tienes derecho a solicitar que borremos tus datos personales, bajo
                ciertas condiciones.
              </li>
              <li>
                <strong>Derecho a restringir el procesamiento</strong> - Tienes derecho a solicitar que restrinjamos el
                procesamiento de tus datos personales, bajo ciertas condiciones.
              </li>
              <li>
                <strong>Derecho a oponerse al procesamiento</strong> - Tienes derecho a oponerte a nuestro procesamiento
                de tus datos personales, bajo ciertas condiciones.
              </li>
              <li>
                <strong>Derecho a la portabilidad de datos</strong> - Tienes derecho a solicitar que transfiramos los
                datos que hemos recopilado a otra organización, o directamente a ti, bajo ciertas condiciones.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Cambios a esta política de privacidad</h2>
            <p>
              Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio
              publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última
              actualización" en la parte superior.
            </p>
            <p>
              Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a
              esta Política de Privacidad son efectivos cuando se publican en esta página.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Contacto</h2>
            <p>Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos:</p>
            <p>
              Email:{" "}
              <a href="mailto:privacidad@1code1day.com" className="text-primary hover:underline">
                privacidad@1code1day.com
              </a>
            </p>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

