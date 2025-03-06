"use client"

import { useEffect, useState } from "react"
import NavbarWithUser from "@/components/navbar-with-user"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Loader2, UserCog, Search, Filter, Check, X, Edit, Save, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

// Interfaz para los usuarios
interface AdminUser {
  id: string
  email: string
  username: string
  created_at: string
  is_admin: boolean
  is_pro: boolean
  is_verified: boolean
  status: string
  editing?: boolean
}

export default function AdminUsuariosPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const usersPerPage = 10

  // Verificar que el usuario es administrador
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [isLoading, isAdmin, router])

  // Cargar usuarios de Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return

      try {
        setLoadingUsers(true)

        // En un escenario real, esta sería una función RPC de Supabase o un endpoint seguro
        // que solo pueden llamar los administradores
        const { data: signUpsData, error: signUpsError } = await supabase
          .from("auth.users") // Esto es un ejemplo, la tabla real puede ser diferente
          .select(`
            id,
            email,
            raw_user_meta_data,
            created_at,
            email_confirmed_at
          `)
          .range((page - 1) * usersPerPage, page * usersPerPage - 1)

        if (signUpsError) throw signUpsError

        // Procesar los datos para nuestro formato
        const formattedUsers: AdminUser[] = signUpsData.map((userData) => ({
          id: userData.id,
          email: userData.email,
          username: userData.raw_user_meta_data?.username || userData.email.split("@")[0],
          created_at: new Date(userData.created_at).toLocaleDateString(),
          is_admin: userData.raw_user_meta_data?.is_admin || false,
          is_pro: userData.raw_user_meta_data?.is_pro || false,
          is_verified: !!userData.email_confirmed_at,
          status: userData.email_confirmed_at ? "active" : "pending",
        }))

        setUsers(formattedUsers)

        // Obtener el total para la paginación
        const { count, error: countError } = await supabase.from("auth.users").select("id", { count: "exact" })

        if (countError) throw countError

        setTotalPages(Math.ceil(count! / usersPerPage))
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [isAdmin, page])

  // Filtrar usuarios según término de búsqueda y filtro de estado
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Función para cambiar el estado de administrador de un usuario
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // En producción, esto debería ser una función segura en el servidor
      const { error } = await supabase.rpc("update_user_admin_status", {
        user_id: userId,
        is_admin: !currentStatus,
      })

      if (error) throw error

      // Actualizar el estado local
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_admin: !currentStatus } : u)))

      toast({
        title: "Usuario actualizado",
        description: `Estado de administrador actualizado correctamente`,
      })
    } catch (error) {
      console.error("Error al actualizar el estado de administrador:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de administrador",
        variant: "destructive",
      })
    }
  }

  // Habilitar la edición para un usuario
  const enableEditing = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, editing: true } : u)))
  }

  // Guardar los cambios de un usuario
  const saveUserChanges = async (userId: string) => {
    try {
      const userToUpdate = users.find((u) => u.id === userId)
      if (!userToUpdate) return

      // En producción, esto debería ser una función segura en el servidor
      const { error } = await supabase.rpc("update_user", {
        user_id: userId,
        user_data: {
          is_admin: userToUpdate.is_admin,
          is_pro: userToUpdate.is_pro,
          status: userToUpdate.status,
        },
      })

      if (error) throw error

      // Desactivar modo edición
      setUsers(users.map((u) => (u.id === userId ? { ...u, editing: false } : u)))

      toast({
        title: "Usuario actualizado",
        description: "Cambios guardados correctamente",
      })
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <InteractiveGridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando...</p>
          </div>
        </div>
      </InteractiveGridBackground>
    )
  }

  if (!isAdmin) {
    return null // Redirección manejada en el useEffect
  }

  return (
    <InteractiveGridBackground>
      <div className="min-h-screen">
        <NavbarWithUser />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <UserCog className="mr-2 h-8 w-8" />
              Administración de Usuarios
            </h1>
            <p className="text-muted-foreground">Gestiona los usuarios de la plataforma y sus permisos</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por email, nombre o ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="suspended">Suspendidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {loadingUsers ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Cargando usuarios...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-6 font-medium">Usuario</th>
                        <th className="text-left py-4 px-6 font-medium">Email</th>
                        <th className="text-center py-4 px-6 font-medium">Estado</th>
                        <th className="text-center py-4 px-6 font-medium">Pro</th>
                        <th className="text-center py-4 px-6 font-medium">Admin</th>
                        <th className="text-center py-4 px-6 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/30">
                          <td className="py-4 px-6">
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</div>
                          </td>
                          <td className="py-4 px-6">
                            <div>{user.email}</div>
                            <div className="text-xs text-muted-foreground">Creado: {user.created_at}</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {user.editing ? (
                              <Select
                                value={user.status}
                                onValueChange={(value) =>
                                  setUsers(users.map((u) => (u.id === user.id ? { ...u, status: value } : u)))
                                }
                              >
                                <SelectTrigger className="w-[120px] mx-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Activo</SelectItem>
                                  <SelectItem value="pending">Pendiente</SelectItem>
                                  <SelectItem value="suspended">Suspendido</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "default"
                                    : user.status === "pending"
                                      ? "outline"
                                      : "destructive"
                                }
                              >
                                {user.status === "active"
                                  ? "Activo"
                                  : user.status === "pending"
                                    ? "Pendiente"
                                    : "Suspendido"}
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {user.editing ? (
                              <Switch
                                checked={user.is_pro}
                                onCheckedChange={(checked) =>
                                  setUsers(users.map((u) => (u.id === user.id ? { ...u, is_pro: checked } : u)))
                                }
                              />
                            ) : user.is_pro ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Switch
                              checked={user.is_admin}
                              onCheckedChange={() => toggleAdminStatus(user.id, user.is_admin)}
                            />
                          </td>
                          <td className="py-4 px-6 text-center">
                            {user.editing ? (
                              <Button size="sm" onClick={() => saveUserChanges(user.id)} className="w-full">
                                <Save className="h-4 w-4 mr-1" />
                                Guardar
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => enableEditing(user.id)}
                                className="w-full"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No se encontraron usuarios</p>
                </div>
              )}

              {/* Paginación */}
              {filteredUsers.length > 0 && (
                <div className="p-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {filteredUsers.length} de {users.length} usuarios
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </InteractiveGridBackground>
  )
}

