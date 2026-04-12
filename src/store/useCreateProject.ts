'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/react-query';
import { toast } from 'sonner';
import { CreateProjectInput } from '@/lib/schemas';

export function useCreateProject(onSuccess: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => api.post('/api/projects', data),
    onSuccess: (newProject: any) => {
      toast.success('Проект успешно создан');

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      router.refresh();

      onSuccess();

      if (newProject?.id) {
        router.push(`/projects/${newProject.id}`);
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Не удалось создать проект';
      toast.error('Ошибка', { description: message });
    },
  });
}