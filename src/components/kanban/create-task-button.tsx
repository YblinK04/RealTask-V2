'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from '../projects/create-task-dialog';

export function CreateTaskButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        size="sm" 
        className="gap-2 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Добавить задачу</span>
      </Button>

      <CreateTaskDialog 
        projectId={projectId} 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}