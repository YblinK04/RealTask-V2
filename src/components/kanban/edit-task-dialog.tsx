'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/react-query';
import { CreateTaskSchema, type CreateTaskInput, type Task } from '@/lib/schemas';
import { useTaskStore } from '@/store/useTaskStore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const queryClient = useQueryClient();
  const updateTaskInZustand = useTaskStore((state) => state.updateTask);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema) as any,
    defaultValues: {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      order: task.order,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        order: task.order,
      });
    }
  }, [open, task, form]);

  const { mutate: sendUpdate, isPending } = useMutation({
    mutationFn: (data: CreateTaskInput) => 
      api.patch(`/api/tasks`, { id: task.id, ...data }),
    onSuccess: (updatedTaskFromServer: any) => {
      updateTaskInZustand(task.id, updatedTaskFromServer);
      
      queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
      
      toast.success('Задача обновлена');
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Ошибка обновления';
      toast.error(message);
    }
  });

  const onSubmit = (values: CreateTaskInput) => {
    sendUpdate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Редактировать задачу</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Заголовок</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} className="bg-muted/30 border-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ''} 
                      className="resize-none h-32 bg-muted/30 border-none" 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Статус</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/30 border-none"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="TODO">К исполнению</SelectItem>
                        <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                        <SelectItem value="REVIEW">На проверке</SelectItem>
                        <SelectItem value="DONE">Готово</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Приоритет</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="bg-muted/30 border-none"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">🔵 Низкий</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Средний</SelectItem>
                        <SelectItem value="HIGH">🟠 Высокий</SelectItem>
                        <SelectItem value="URGENT">🔴 Срочно</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[120px]">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Сохранить изменения'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}