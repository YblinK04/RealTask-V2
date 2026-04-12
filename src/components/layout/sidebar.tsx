import { auth } from '@/lib/auth';
import { projectService } from '@/services/project.service';
import { SidebarClient } from './sidebar-client';
import { Project } from "@prisma/client"; 

export async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  
  
  let projects: Project[] = []; 
  
  try {
    projects = await projectService.getUserProjects(userId);
  } catch (error: unknown) {
    console.error("Ошибка загрузки проектов:", error);
  }


  const serializedProjects = projects.map((project) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  }));

  return <SidebarClient projects={serializedProjects} userId={userId} />;
}