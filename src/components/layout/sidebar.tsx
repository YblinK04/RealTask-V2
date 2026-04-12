import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Добавлен импорт prisma
import { SidebarClient } from './sidebar-client';
import { SidebarProject } from '@/store/useSidebarProjects';

export async function Sidebar() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    const projects = await prisma.project.findMany({
      where: { 
        ownerId: userId 
      },
      include: { 
        tasks: true 
      }, 
      orderBy: { 
        updatedAt: 'desc' 
      },
    });

    const serializedProjects: SidebarProject[] = projects.map((project) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      tasks: JSON.parse(JSON.stringify(project.tasks))
    }));

    return <SidebarClient projects={serializedProjects} userId={userId} />;
  } catch (error: unknown) {
    console.error("Ошибка в серверном компоненте Sidebar:", error);
    return <SidebarClient projects={[]} userId={userId} />;
  }
}