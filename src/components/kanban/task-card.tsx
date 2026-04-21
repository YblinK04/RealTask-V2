'use client';

import { useState } from 'react'; 
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/schemas';
import { cn, getPriorityColor } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MessageSquare, MoreVertical, Trash, Edit, Clock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskComments } from './TaskComments';
import { EditTaskDialog } from './edit-task-dialog'; 
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  projectId?: string;
}

export function TaskCard({ task, isOverlay, projectId }: TaskCardProps) {
  const { deleteTask } = useTaskStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); 
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'Task',
      task,
    }  
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    touchAction: 'none',
  };

  return (
    <>
      <Dialog>
        <div ref={setNodeRef} style={style} className="relative group">
          {/* Меню управления карточкой */}
          <div className="absolute right-2 top-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/50">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDialogOpen(true); 
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Редактировать</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Удалить задачу?')) deleteTask(task.id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Удалить</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DialogTrigger asChild>
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <Card className={cn(
                "relative py-3 mb-1 shadow-none border-none ring-1 ring-border/50 bg-card transition-all hover:ring-primary/30",
                isOverlay && "ring-2 ring-primary shadow-2xl bg-card/95 backdrop-blur-sm"
              )}>
                <CardHeader className="px-3 pb-2 pt-1">
                  <div className={cn("h-1.5 w-7 rounded-full mb-2", getPriorityColor(task.priority).split(' ')[0])} />
                  <CardTitle className="text-sm font-bold tracking-tight pr-6">{task.title}</CardTitle>
                </CardHeader>
                
                {task.description && (
                  <CardContent className="px-3 py-0">
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </CardContent>
                )}

                <CardFooter className="px-3 pt-3 flex flex-col gap-2 border-t mt-2 border-border/20">
                  <div className="flex items-center justify-between w-full text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(task.createdAt), 'dd.MM HH:mm', { locale: ru })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary/80">
                      <MessageSquare className="h-3 w-3" />
                      <span>Обсуждение</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </DialogTrigger>
        </div>

        {/* ИСПРАВЛЕННОЕ СОДЕРЖИМОЕ ДИАЛОГА */}
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 border-b bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
               <div className={cn("h-2 w-8 rounded-full", getPriorityColor(task.priority).split(' ')[0])} />
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                 {task.priority} Priority
               </span>
            </div>
            <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Создано {format(new Date(task.createdAt), 'PPPP', { locale: ru })}
            </DialogDescription>
          </DialogHeader>

          {/* Область комментариев/чата */}
          <div className="flex-1 overflow-hidden p-6">
            <TaskComments taskId={task.id} />
          </div>
        </DialogContent>
      </Dialog>

      <EditTaskDialog 
        task={task} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </>
  );
}