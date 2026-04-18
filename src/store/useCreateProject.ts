'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/react-query';
import { toast } from 'sonner';
import { CreateProjectInput } from '@/lib/schemas';

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  createdAt: string;
}

export function useCreateProject(onSuccess: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectInput>({
    mutationFn: (data: CreateProjectInput) => api.post('/api/projects', data),
    
    onSuccess: (newProject) => {
      toast.success(`Проект "${newProject.title}" успешно создан`);

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      router.refresh();
      onSuccess();

      if (newProject.id) {
        router.push(`/projects/${newProject.id}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Не удалось создать проект');
    },
  });
}