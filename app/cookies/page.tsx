"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function CookiesPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Política de Cookies</h1>
            <p className="text-muted-foreground">Última actualización: 1 de marzo de 2023</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p>
              Esta Política de Cookies explica qué son las cookies y cómo las utilizamos en 1code1day. Debes leer esta
              política para entender qué son las cookies, cómo las usamos, los tipos de cookies que utilizamos, la
              información que recopilamos usando cookies y cómo se utiliza esa información, y cómo controlar las
              preferencias de cookies.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador o dispositivo
              móvil) cuando visitas un sitio web. Las cookies son ampliamente utilizadas por los propietarios de sitios
              web para hacer que sus sitios web funcionen, o funcionen de manera más eficiente, así como para
              proporcionar información de informes.
            </p>
            <p>
              Las cookies establecidas por el propietario del sitio web (en este caso, 1code1day) se denominan "cookies
              de primera parte". Las cookies establecidas por partes que no sean el propietario del sitio web se
              denominan "cookies de terceros". Las cookies de terceros permiten que se proporcionen funciones o
              características de terceros en o a través del sitio web (por ejemplo, publicidad, contenido interactivo y
              análisis).
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. ¿Cómo utilizamos las cookies?</h2>
            <p>
              Utilizamos cookies por varias razones que se detallan a continuación. Desafortunadamente, en la mayoría de
              los casos, no existen opciones estándar de la industria para deshabilitar las cookies sin deshabilitar
              completamente la funcionalidad y las características que agregan a este sitio. Se recomienda que dejes
              activadas todas las cookies si no estás seguro de si las necesitas o no, en caso de que se utilicen para
              proporcionar un servicio que utilizas.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Tipos de cookies que utilizamos</h2>
            <p>
              <strong>Cookies esenciales:</strong> Estas cookies son necesarias para que el sitio web funcione y no se
              pueden desactivar en nuestros sistemas. Generalmente solo se establecen en respuesta a acciones realizadas
              por ti que equivalen a una solicitud de servicios, como establecer tus preferencias de privacidad, iniciar
              sesión o completar formularios. Puedes configurar tu navegador para que bloquee o te alerte sobre estas
              cookies, pero algunas partes del sitio no funcionarán.
            </p>
            <p>
              <strong>Cookies de rendimiento:</strong> Estas cookies nos permiten contar las visitas y fuentes de
              tráfico para que podamos medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas
              son las más y menos populares y ver cómo se mueven los visitantes por el sitio. Toda la información que
              recopilan estas cookies es agregada y, por lo tanto, anónima.
            </p>
            <p>
              <strong>Cookies de funcionalidad:</strong> Estas cookies permiten que el sitio proporcione una
              funcionalidad y personalización mejoradas. Pueden ser establecidas por nosotros o por proveedores externos
              cuyos servicios hemos agregado a nuestras páginas. Si no permites estas cookies, es posible que algunos o
              todos estos servicios no funcionen correctamente.
            </p>
            <p>
              <strong>Cookies de orientación:</strong> Estas cookies pueden ser establecidas a través de nuestro sitio
              por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para construir un perfil de tus
              intereses y mostrarte anuncios relevantes en otros sitios. No almacenan directamente información personal,
              sino que se basan en la identificación única de tu navegador y dispositivo de Internet.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Cookies específicas que utilizamos</h2>
            <table className="min-w-full border-collapse border border-gray-700 my-6">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 px-4 py-2 text-left">Nombre</th>
                  <th className="border border-gray-700 px-4 py-2 text-left">Proveedor</th>
                  <th className="border border-gray-700 px-4 py-2 text-left">Propósito</th>
                  <th className="border border-gray-700 px-4 py-2 text-left">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-700 px-4 py-2">session_id</td>
                  <td className="border border-gray-700 px-4 py-2">1code1day.com</td>
                  <td className="border border-gray-700 px-4 py-2">Mantener la sesión del usuario</td>
                  <td className="border border-gray-700 px-4 py-2">Sesión</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-2">auth_token</td>
                  <td className="border border-gray-700 px-4 py-2">1code1day.com</td>
                  <td className="border border-gray-700 px-4 py-2">Autenticación</td>
                  <td className="border border-gray-700 px-4 py-2">30 días</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-2">_ga</td>
                  <td className="border border-gray-700 px-4 py-2">Google Analytics</td>
                  <td className="border border-gray-700 px-4 py-2">Análisis de uso</td>
                  <td className="border border-gray-700 px-4 py-2">2 años</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-4 py-2">_gid</td>
                  <td className="border border-gray-700 px-4 py-2">Google Analytics</td>
                  <td className="border border-gray-700 px-4 py-2">Análisis de uso</td>
                  <td className="border border-gray-700 px-4 py-2">24 horas</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Control de cookies</h2>
            <p>
              La mayoría de los navegadores están configurados para aceptar cookies de forma predeterminada. Sin
              embargo, puedes eliminar o rechazar las cookies en la configuración de tu navegador. Ten en cuenta que al
              deshabilitar ciertas cookies, es posible que no puedas acceder a ciertas funcionalidades de nuestro sitio
              web.
            </p>
            <p>
              A continuación, te proporcionamos enlaces a las instrucciones para gestionar y eliminar cookies de los
              navegadores más comunes:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Internet Explorer
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Cambios en nuestra política de cookies</h2>
            <p>
              Podemos actualizar nuestra Política de Cookies de vez en cuando para reflejar, por ejemplo, cambios en las
              cookies que utilizamos o por otras razones operativas, legales o regulatorias. Por lo tanto, visita esta
              Política de Cookies regularmente para mantenerte informado sobre nuestro uso de cookies y tecnologías
              relacionadas.
            </p>
            <p>La fecha en la parte superior de esta Política de Cookies indica cuándo se actualizó por última vez.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Contacto</h2>
            <p>Si tienes alguna pregunta sobre nuestra política de cookies, por favor contáctanos:</p>
            <p>
              Email:{" "}
              <a href="mailto:cookies@1code1day.com" className="text-primary hover:underline">
                cookies@1code1day.com
              </a>
            </p>
          </div>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

