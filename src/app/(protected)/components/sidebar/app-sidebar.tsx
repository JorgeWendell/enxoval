"use client";

import {
  BarChart3,
  BedDouble,
  DollarSign,
  FactoryIcon,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  PackageOpen,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Tag,
  Truck,
  UsersIcon,
  WashingMachine,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import { NavMain } from "./nav-main";

const data = {
  navMain: [
    {
      label: "Menu",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          items: [
            {
              title: "Dashboard",
              url: "/dashboard",
            },
          ],
        },
        {
          title: "Quartos",
          url: "/quartos",
          icon: BedDouble,
          items: [
            {
              title: "Lista de Quartos",
              url: "/quartos",
            },
          ],
        },
        {
          title: "Enxovais",
          url: "/enxovais",
          icon: PackageOpen,
          items: [
            {
              title: "Tipos de Enxovais",
              url: "/enxovais",
            },
            {
              title: "Itens",
              url: "/enxovais/itens",
            },
            {
              title: "Estoque",
              url: "/enxovais/itens?status=estoque",
            },
            {
              title: "Itens Danificados",
              url: "/enxovais/danificados",
            },
          ],
        },
        {
          title: "Lavanderia",
          url: "/lavanderia",
          icon: WashingMachine,
          items: [
            {
              title: "Dashboard",
              url: "/lavanderia",
            },
            {
              title: "Coletar",
              url: "/lavanderia/coletar",
            },
            {
              title: "Lavar",
              url: "/lavanderia/lavar",
            },
            {
              title: "Entregar",
              url: "/lavanderia/entregar",
            },
          ],
        },
        {
          title: "Movimentações",
          url: "/movimentacoes",
          icon: ClipboardList,
          items: [
            {
              title: "Histórico",
              url: "/movimentacoes",
            },
          ],
        },
        {
          title: "Relatórios",
          url: "/relatorios",
          icon: FileText,
          items: [
            {
              title: "Relatórios",
              url: "/relatorios",
            },
          ],
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const session = authClient.useSession();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const toggleTheme = () => {
    const currentTheme = theme || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
        className="mx-auto mt-4"
      />
      <SidebarContent>
        <NavMain groups={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>
                      {session.data?.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{session.data?.user.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={toggleTheme}>
                  {!mounted ? (
                    <>
                      <Moon />
                      Alternar Tema
                    </>
                  ) : theme === "dark" ? (
                    <>
                      <Sun />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon />
                      Modo Escuro
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
