'use client';

import { useTransition } from 'react';
import { ProjectStatus } from '@prisma/client';
import { updateProjectStatus } from '@/app/(dashboard)/projects/actions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectStatusToggleProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export function ProjectStatusToggle({ projectId, currentStatus }: ProjectStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newStatus = currentStatus === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    
    startTransition(async () => {
      const result = await updateProjectStatus(projectId, newStatus);
      if (result.success) {
        toast.success(newStatus === 'COMPLETED' ? 'Проект завершен!' : 'Проект возвращен в работу');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button 
      variant={currentStatus === 'COMPLETED' ? "outline" : "default"} 
      size="sm" 
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2 shadow-sm"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : currentStatus === 'COMPLETED' ? (
        <>
          <RotateCcw className="h-4 w-4" />
          <span>Вернуть в работу</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>Завершить проект</span>
        </>
      )}
    </Button>
  );
}