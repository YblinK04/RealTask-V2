'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { SidebarHeader } from './sidebar/sidebar-header';
import { SidebarFooter } from './sidebar/sidebar-footer';
import { SidebarSection } from './sidebar/sidebar-section';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { useSidebarProjects, type SidebarProject } from '@/store/useSidebarProjects';

interface SidebarClientProps {
  projects: SidebarProject[];
  userId: string;
  isMobile?: boolean; 
}

export function SidebarClient({ 
  projects: initialProjects, 
  userId, 
  isMobile = false 
}: SidebarClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const pathname = usePathname();

  const { activeProjects, completedProjects, deleteProject } = useSidebarProjects(initialProjects);

  const isCurrentlyCollapsed = isMobile ? false : collapsed;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Удалить проект "${name}"?`)) deleteProject(id);
  };

  return (
    <aside className={cn(
      'flex h-full flex-col border-r bg-card transition-all duration-300',
      isCurrentlyCollapsed ? 'w-16' : 'w-64',
      isMobile && 'w-full border-none' 
    )}>
      <SidebarHeader 
        collapsed={isCurrentlyCollapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        hideToggle={isMobile} 
      />

      <div className='flex-1 overflow-hidden py-4 px-3'>
        {!isCurrentlyCollapsed && (
          <div className='flex items-center justify-between mb-4 px-2'>
            <span className='text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest'>
              Проекты
            </span>
            <Button variant='ghost' size='icon' className='h-5 w-5' onClick={() => setCreateDialogOpen(true)}>
              <Plus className='h-3 w-3' />
            </Button>
          </div>
        )}
        
        <ScrollArea className='h-full'>
          <SidebarSection 
            title="В работе" 
            projects={activeProjects} 
            collapsed={isCurrentlyCollapsed} 
            isActive={(id: string) => pathname === `/projects/${id}`} 
            onDelete={handleDelete}
          />
          <SidebarSection 
            title="Завершенные" 
            projects={completedProjects} 
            collapsed={isCurrentlyCollapsed} 
            isActive={(id: string) => pathname === `/projects/${id}`} 
            onDelete={handleDelete} 
          />
        </ScrollArea>
      </div>

      <SidebarFooter collapsed={isCurrentlyCollapsed} />
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </aside>
  );
}