import { auth } from "@/lib/auth";
import { projectService } from "@/services/project.service";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { redirect } from "next/navigation";
import { SidebarProject } from "@/store/useSidebarProjects";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const projects = await projectService.getUserProjects(userId);
  const serializedProjects = JSON.parse(JSON.stringify(projects)) as SidebarProject[];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex h-full shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="flex h-14 items-center border-b bg-card/50 backdrop-blur-md px-4 gap-2 sticky top-0 z-50">
          <MobileSidebar 
            projects={serializedProjects} 
            userId={userId} 
          />
          
          <Header />
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="h-full w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}