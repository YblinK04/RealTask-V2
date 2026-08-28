'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/lib/schemas'; 
import { TaskCard } from './task-card';
import { useDndStore } from '@/store/dnd-store'; 
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: TaskStatus; 
  title: string;
  tasks: Task[];
  projectId: string; 
}

export function KanbanColumn({ id, title, tasks, projectId }: KanbanColumnProps) {
  const { targetColumn, draggedTask } = useDndStore();

  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'Column'
    }
  });

  const isCurrentTarget = targetColumn === id || (isOver && !!draggedTask);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex w-80 shrink-0 flex-col rounded-2xl p-2 min-h-[650px] border transition-all duration-200 bg-muted/20 border-transparent",
        isCurrentTarget && "bg-primary/5 border-primary/20 border-dashed shadow-inner scale-[1.01]"
      )}
    >
      <div className="flex items-center justify-between p-3 mb-2">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
          {title}
        </h3>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full bg-background border shadow-sm text-muted-foreground transition-transform",
          isCurrentTarget && "scale-110 text-primary border-primary/30"
        )}>
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 h-full flex-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              projectId={projectId} 
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className={cn(
            "flex-1 min-h-[150px] rounded-2xl border-2 border-dashed border-muted-foreground/5 flex items-center justify-center transition-colors",
            isCurrentTarget && "border-primary/20 bg-primary/[0.02]"
          )}>
             <p className={cn(
               "text-[10px] text-muted-foreground/20 font-bold uppercase tracking-tighter transition-colors",
               isCurrentTarget && "text-primary/40"
             )}>
               Перетащите сюда
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
