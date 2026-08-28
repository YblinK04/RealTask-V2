import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/react-query';
import { UpdateTaskInput, Task } from '@/lib/schemas';
import { useTaskStore } from '@/store/useTaskStore';
import { toast } from 'sonner';

export function useUpdateTaskMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const updateTaskInZustand = useTaskStore((state) => state.updateTask);

  return useMutation({
    mutationFn: (data: UpdateTaskInput) => {
      
      return api.patch(`/api/tasks/${data.id}`, data);
    },
    onSuccess: (updatedTaskFromServer: unknown, variables) => {
      const freshTask = updatedTaskFromServer as Task;
      
      updateTaskInZustand(variables.id, freshTask);
      
      queryClient.invalidateQueries({ queryKey: ['tasks', freshTask.projectId] });
      
      toast.success('Задача обновлена');
      
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Ошибка обновления';
      toast.error(message);
    }
  });
}
