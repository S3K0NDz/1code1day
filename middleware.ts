import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación (todas excepto las especificadas)
const publicRoutes = [
  "/login",
  "/registro",
  "/recuperar-password",
  "/actualizar-password",
  "/reto-diario",
  "/auth/callback",
]

// Rutas que solo son accesibles si NO estás autenticado
const authRoutes = ["/login", "/registro", "/recuperar-password", "/actualizar-password"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()
  const { pathname } = url

  // Verificar si la ruta es pública o requiere autenticación
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirigir a la página principal si el usuario ya está autenticado e intenta acceder a rutas de auth
  if (isAuthRoute && session) {
    url.pathname = "/reto-diario"
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del navegador)
     * - imágenes y otros archivos estáticos
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

