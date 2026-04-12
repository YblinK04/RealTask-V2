'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/react-query';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { Project, Task } from "@prisma/client";

export type SidebarProject = Omit<Project, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

export function useSidebarProjects(initialProjects: SidebarProject[]) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const { data: projects = initialProjects, isLoading } = useQuery<SidebarProject[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects'),
    initialData: initialProjects,
    staleTime: 0,
  });

  const sortedProjects = useMemo(() => ({
    active: projects.filter((p) => p.status === 'ACTIVE'),
    completed: projects.filter((p) => p.status === 'COMPLETED'),
  }), [projects]);

  const { mutate: deleteProject } = useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: (_, deletedProjectId) => {
      const isCurrentProject = pathname.includes(deletedProjectId);

      toast.success('Проект полностью удален');

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (isCurrentProject) {
        router.push('/dashboard');
        
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        router.refresh();
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Ошибка при удалении';
      toast.error(message);
    }
  });

  return {
    activeProjects: sortedProjects.active,
    completedProjects: sortedProjects.completed,
    deleteProject,
    projects,
    isLoading
  };
}