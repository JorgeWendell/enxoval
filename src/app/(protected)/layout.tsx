import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

import { AppSidebar } from "./components/sidebar/app-sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
          <div className="flex h-14 items-center px-4">
            <SidebarTrigger />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
