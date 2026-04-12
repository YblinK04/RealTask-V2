'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/lib/schemas';
import { TaskCard } from './task-card';


interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  projectId: string; 
}

export function KanbanColumn({ id, title, tasks, projectId }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id,
    data: {
      type: 'Column'
    }
   });

  return (
    <div 
      ref={setNodeRef}
      className="flex w-80 shrink-0 flex-col rounded-2xl bg-muted/20 p-2 min-h-[650px] border border-transparent transition-colors duration-200"
    >
      <div className="flex items-center justify-between p-3 mb-2">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
          {title}
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background border shadow-sm text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 h-full">
        <SortableContext items={tasks.map((t: Task) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              projectId={projectId} 
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 min-h-[150px] rounded-2xl border-2 border-dashed border-muted-foreground/5 flex items-center justify-center">
             <p className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-tighter">Перетащите сюда</p>
          </div>
        )}
      </div>
    </div>
  );
}