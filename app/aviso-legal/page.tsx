"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"

export default function AvisoLegalPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Aviso Legal</h1>
            <p className="text-muted-foreground">Última actualización: 1 de marzo de 2025</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Información del titular</h2>
            <p>
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de
              Comercio Electrónico, le informamos que:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>
                <strong>Denominación social:</strong> 1code1day S.L.
              </li>
              <li>
                <strong>NIF:</strong> B12345678
              </li>
              <li>
                <strong>Domicilio social:</strong> Calle Ejemplo 123, 28001 Madrid, España
              </li>
              <li>
                <strong>Correo electrónico:</strong> info@1code1day.com
              </li>
              <li>
                <strong>Teléfono:</strong> +34 912 345 678
              </li>
              <li>
                <strong>Datos registrales:</strong> Inscrita en el Registro Mercantil de Madrid, Tomo 12345, Folio 67,
                Hoja M-123456, Inscripción 1ª
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Objeto y ámbito de aplicación</h2>
            <p>
              El presente Aviso Legal regula el uso del sitio web 1code1day.com (en adelante, el "Sitio Web"), del que
              es titular 1code1day S.L.
            </p>
            <p>
              La navegación por el Sitio Web atribuye la condición de usuario del mismo e implica la aceptación plena y
              sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal, que pueden sufrir
              modificaciones.
            </p>
            <p>
              El usuario se obliga a hacer un uso correcto del Sitio Web de conformidad con las leyes, la buena fe, el
              orden público, los usos del tráfico y el presente Aviso Legal. El usuario responderá frente a 1code1day
              S.L. o frente a terceros, de cualesquiera daños y perjuicios que pudieran causarse como consecuencia del
              incumplimiento de dicha obligación.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Propiedad intelectual e industrial</h2>
            <p>
              Todos los contenidos del Sitio Web, entendiendo por estos a título meramente enunciativo los textos,
              fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o
              sonoros, así como su diseño gráfico y códigos fuente (en adelante, los "Contenidos"), son propiedad
              intelectual de 1code1day S.L. o de terceros, sin que puedan entenderse cedidos al usuario ninguno de los
              derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual sobre los
              mismos.
            </p>
            <p>
              Las marcas, nombres comerciales o signos distintivos son titularidad de 1code1day S.L. o terceros, sin que
              pueda entenderse que el acceso al Sitio Web atribuya ningún derecho sobre las citadas marcas, nombres
              comerciales y/o signos distintivos.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Enlaces</h2>
            <p>
              En el caso de que en el Sitio Web se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet,
              1code1day S.L. no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso
              1code1day S.L. asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio
              web ajeno, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad,
              validez y constitucionalidad de cualquier material o información contenida en ninguno de dichos
              hipervínculos u otros sitios de Internet.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Exclusión de garantías y responsabilidad</h2>
            <p>
              1code1day S.L. no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza
              que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de
              disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a
              pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
            </p>
            <p>
              1code1day S.L. no garantiza que el Sitio Web y el servidor estén libres de virus y no se hace responsable
              de los daños causados por el acceso al Sitio Web o por la imposibilidad de acceder.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Modificaciones</h2>
            <p>
              1code1day S.L. se reserva el derecho de efectuar sin previo aviso las modificaciones que considere
              oportunas en su Sitio Web, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se
              presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su
              portal.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Legislación aplicable y jurisdicción</h2>
            <p>
              La relación entre 1code1day S.L. y el usuario se regirá por la normativa española vigente y cualquier
              controversia se someterá a los Juzgados y tribunales de la ciudad de Madrid, salvo que la ley aplicable
              disponga otra cosa.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Contacto</h2>
            <p>Para cualquier consulta relacionada con este Aviso Legal, puede contactarnos en:</p>
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

