'use client';

import { useSidebarProjects, type SidebarProject } from '@/store/useSidebarProjects';
import { ProjectCard } from './project-card';
import { Loader2, LayoutGrid } from 'lucide-react';

export function ProjectList({ initialProjects }: { initialProjects: SidebarProject[] }) {
  const { activeProjects, isLoading } = useSidebarProjects(initialProjects);

  if (isLoading && activeProjects.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (activeProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-3xl border-border/50 bg-muted/5 mx-4">
        <LayoutGrid className="h-10 w-10 mb-4 text-muted-foreground/20" />
        <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">
          Активных проектов нет
        </p>
      </div>
    );
  }

  return (
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
      {activeProjects.map((project) => (
        <ProjectCard key={project.id} project={project as any} />
      ))}
    </div>
  );
}