import { auth } from '@/lib/auth';
import { projectService } from '@/services/project.service';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { ProjectStatusToggle } from '@/components/projects/project-status-toggle';
import { notFound, redirect } from 'next/navigation';
import { CreateTaskButton } from '@/components/kanban/create-task-button';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  const project = await projectService.getWithTasks(id, session.user.id);

  if (!project) return notFound();

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 md:p-6 rounded-2xl border border-border/50 shadow-sm mx-4 md:mx-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <div 
              className="h-3 w-3 rounded-full shrink-0 shadow-sm" 
              style={{ backgroundColor: project.color }} 
            />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
              {project.name}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
            {project.description || "У этого проекта нет описания."}
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <CreateTaskButton projectId={id} /> 
          <ProjectStatusToggle 
            projectId={project.id} 
            currentStatus={project.status} 
          />
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <KanbanBoard 
          initialTasks={JSON.parse(JSON.stringify(project.tasks))} 
          projectId={id} 
        />
      </div>
    </div>
  );
}