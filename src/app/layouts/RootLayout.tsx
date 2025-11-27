import { Outlet, useLocation, Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { Settings } from "lucide-react"

import { consumeQueuedToast } from "@/shared/lib/toast"
import { Button } from "@/shared/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { useAuth } from "@/app/features/auth/context/AuthContext"
import { UserUpdateDialog } from "@/app/features/users/ui/UserUpdateDialog"

type NavigationItem = {
  label: string
  to: string
  isActive: (pathname: string) => boolean
}

export default function RootLayout() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navigation = useMemo<NavigationItem[]>(
    () => [
      {
        label: "Accueil",
        to: "/home",
        isActive: (pathname) => pathname === "/home",
      },
      {
        label: "Événements",
        to: "/events",
        isActive: (pathname) => pathname.startsWith("/events"),
      },
      {
        label: "Inscriptions",
        to: "/subscriptions",
        isActive: (pathname) => pathname.startsWith("/subscriptions"),
      },
      ...(user?.role === "admin"
        ? [
            {
              label: "Créer un événement",
              to: "/admin/events/create",
              isActive: (pathname: string) =>
                pathname === "/admin/events/create",
            },
            {
              label: "Gestion de mes événements",
              to: "/admin/events",
              isActive: (pathname: string) =>
                pathname === "/admin/events" || pathname === "/admin/events/",
            } satisfies NavigationItem
          ]
        : []),
    ],
    [user?.role]
  )

  useEffect(() => {
    const queuedToast = consumeQueuedToast()
    if (!queuedToast) {
      return
    }

    const { type = "success", message, options } = queuedToast

    const showToast =
      type === "error"
        ? toast.error
        : type === "loading"
          ? toast.loading
          : toast.success

    showToast(message, options)
  }, [location])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-2 py-4">
            <div className="space-y-0.5">
              <p className="text-lg font-semibold">TopEvent</p>
              <p className="text-xs text-sidebar-foreground/60">
                Gestion de vos événements
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive(location.pathname)}
                      >
                        <Link to={item.to}>{item.label}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            {isAuthenticated && user ? (
              <div className="rounded-md border border-sidebar-border bg-sidebar/40 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="truncate font-semibold capitalize">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-sidebar-foreground/70">
                      {user.mail}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
                      Rôle : {user.role === "admin" ? "Organisateur" : "Utilisateur"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setIsProfileOpen(true)}
                    aria-label="Paramètres profil"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={logout}
                >
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <Button className="w-full" asChild>
                <Link to="/auth">Se connecter</Link>
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          <Outlet />
        </main>
        <UserUpdateDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      </div>
    </SidebarProvider>
  )
}

