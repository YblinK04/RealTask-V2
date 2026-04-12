'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Circle, ListTodo, Timer } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Project, Task } from '@prisma/client';

interface ProjectCardProps {
  project: Project & {
    tasks: Task[];
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
 
  const tasks = project.tasks || [];
  const total = tasks.length;
 
  const completed = project.tasks.filter(t => t.status === 'DONE').length;
  const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;
  const todo = project.tasks.filter(t => t.status === 'TODO').length;
  
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="group relative h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border-none bg-card/60 backdrop-blur-md ring-1 ring-border/50 overflow-hidden">
        <div 
          className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2.5"
          style={{ backgroundColor: project.color }}
        />

        <CardHeader className="pt-8 pb-4">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-black tracking-tight truncate">
              {project.name}
            </CardTitle>
            <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter bg-primary/10 text-primary border-none">
              {project.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium italic">
            {project.description || "Описание проекта не заполнено..."}
          </p>

          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-sm font-black text-foreground">{completed}</span>
              <span className="text-[8px] font-bold uppercase text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-2 w-2" /> Готово
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-sm font-black text-foreground">{inProgress}</span>
              <span className="text-[8px] font-bold uppercase text-blue-500 flex items-center gap-1">
                <Timer className="h-2 w-2" /> В работе
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-sm font-black text-foreground">{todo}</span>
              <span className="text-[8px] font-bold uppercase text-orange-500 flex items-center gap-1">
                <Circle className="h-2 w-2" /> План
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              <span>Общий прогресс</span>
              <span>{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-muted ring-1 ring-border/20" 
              style={{ '--progress-foreground': project.color } as any} // Кастомный цвет прогресса
            />
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-4 border-t border-border/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
          <div className="flex items-center gap-2 text-muted-foreground/70">
            <ListTodo className="h-3.5 w-3.5" />
            <span>Всего задач: {total}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground/70">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}