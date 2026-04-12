'use client';

import { ProjectItem } from '@/components/projects/project-item';
import { Trash2 } from 'lucide-react';
import { Project } from "@prisma/client";

interface SidebarSectionProps {
  title: string;
  projects: (Omit<Project, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  })[];
  collapsed: boolean;
  isActive: (id: string) => boolean;
  onDelete: (id: string, name: string) => void;
}

export function SidebarSection({ 
  title, 
  projects, 
  collapsed, 
  isActive, 
  onDelete 
}: SidebarSectionProps) {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-1 mb-6">
      {!collapsed && (
        <h3 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 mb-2'>
          {title} ({projects.length})
        </h3>
      )}
      <div className={collapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
        {projects.map((project) => (
          <div key={project.id} className="group relative w-full">
            <ProjectItem
              project={project}
              collapsed={collapsed}
              isActive={isActive(project.id)}
            />
            {!collapsed && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(project.id, project.name);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}