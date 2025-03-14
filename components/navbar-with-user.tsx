"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function NavbarWithUser() {
  const { user, isLoading, signOut, isPro } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Evitar errores de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const handleProfileClick = () => {
    router.push("/perfil")
  }

  const handleSettingsClick = () => {
    router.push("/perfil/editar")
  }

  // Obtener la imagen de avatar y nombre de usuario de los metadatos
  const avatarUrl = user?.user_metadata?.avatar_url || "/placeholder-user.jpg"
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split("@")[0] || "usuario"

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center">
                <div className="bg-white text-black px-3 py-1 text-2xl font-bold">1code</div>
                <div className="text-white text-2xl font-bold px-1">1day</div>
              </Link>
            </div>
            <div className="mt-8 pl-7 pr-6">
              {user && (
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{displayName}</p>
                      {isPro && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">Premium</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Link href="/reto-diario">
                  <Button variant="ghost" className="w-full justify-start">
                    Reto Diario
                  </Button>
                </Link>
                <Link href="/ranking">
                  <Button variant="ghost" className="w-full justify-start">
                    Ranking
                  </Button>
                </Link>
                <Link href="/retos">
                  <Button variant="ghost" className="w-full justify-start">
                    Retos Anteriores
                  </Button>
                </Link>
                <Link href="/perfil">
                  <Button variant="ghost" className="w-full justify-start">
                    Mi Perfil
                  </Button>
                </Link>
                <Link href="/planes">
                  <Button variant="ghost" className="w-full justify-start">
                    Planes
                  </Button>
                </Link>
                {user && (
                  <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="bg-white text-black px-3 py-1 text-xl font-bold hidden md:block">1code</div>
          <div className="text-white text-xl font-bold px-1 hidden md:block">1day</div>
          <div className="bg-white text-black px-2 py-0.5 text-lg font-bold md:hidden">1</div>
          <div className="text-white text-lg font-bold px-0.5 md:hidden">1</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/reto-diario" className="font-medium transition-colors hover:text-primary">
            Reto Diario
          </Link>
          <Link href="/ranking" className="font-medium transition-colors hover:text-primary">
            Ranking
          </Link>
          <Link href="/retos" className="font-medium transition-colors hover:text-primary">
            Retos Anteriores
          </Link>
          <Link href="/planes" className="font-medium transition-colors hover:text-primary">
            Planes
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end">
          {!isLoading && user ? (
            <div className="flex items-center gap-2">
              {/* Implementación alternativa del menú desplegable */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full overflow-hidden ring-offset-background transition-all duration-300 hover:ring-2 hover:ring-primary/30 hover:ring-offset-2"
                >
                  {isPro && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-background z-10 flex items-center justify-center shadow-md">
                      <span className="text-[8px] font-bold text-black">PRO</span>
                    </div>
                  )}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>

                <div className="absolute right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-1 z-50">
                  <div className="py-2 bg-popover border border-border/50 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{displayName}</p>
                        {isPro && (
                          <Badge className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-500 border-yellow-500/20 hover:from-yellow-400/30 hover:to-yellow-600/30 transition-colors">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                    </div>

                    <div className="py-1 px-1.5">
                      <button
                        onClick={handleProfileClick}
                        className="flex w-full items-center px-3 py-2.5 text-sm rounded-lg hover:bg-accent/50 hover:text-accent-foreground transition-colors duration-200"
                      >
                        <User className="h-4 w-4 mr-3 text-muted-foreground" />
                        Mi Perfil
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="flex w-full items-center px-3 py-2.5 text-sm rounded-lg hover:bg-accent/50 hover:text-accent-foreground transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                        Configuración
                      </button>
                    </div>

                    <div className="border-t border-border/50 py-1 px-1.5 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

