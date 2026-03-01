import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mi Restaurante", url: "/settings", icon: Settings },
  { title: "Editor de Menú", url: "/menu-editor", icon: UtensilsCrossed },
  { title: "Código QR", url: "/qr", icon: QrCode },
  { title: "Analíticas", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && (
              <span className="font-heading text-lg font-bold tracking-tight text-sidebar-primary">
                LiveMenu
              </span>
            )}
            {collapsed && (
              <span className="font-heading text-lg font-bold text-sidebar-primary">🍽</span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <p className="mb-2 truncate text-xs text-sidebar-foreground/60">
            {user.email}
          </p>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={logout}
          className="w-full text-sidebar-foreground/60 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Cerrar sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
