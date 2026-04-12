'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectSchema, type CreateProjectInput } from '@/lib/schemas';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateProject } from '@/store/useCreateProject';
import { ProjectFormFields } from './project-form-field';


export function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema) as any,
    defaultValues: { name: '', description: '', color: '#3b82f6', isPublic: false }
  });

  const { mutate, isPending } = useCreateProject(() => onOpenChange(false));

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Новый проект</DialogTitle>
          <DialogDescription>Создайте пространство для ваших задач</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((vals) => mutate(vals))} className="space-y-6">
            <ProjectFormFields control={form.control} disabled={isPending} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Отмена</Button>
              <Button type="submit" disabled={isPending} className="min-w-[120px]">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать проект'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}