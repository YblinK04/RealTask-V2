'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { Task, TaskStatus } from '@/lib/schemas';
import { useTaskStore } from '@/store/useTaskStore';
import { useKanbanDnd } from '@/store/useKanbanDnd';
import { createPortal } from 'react-dom';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'К исполнению' },
  { id: 'IN_PROGRESS', title: 'В работе' },
  { id: 'REVIEW', title: 'На проверке' },
  { id: 'DONE', title: 'Готово' },
];

export function KanbanBoard({ initialTasks, projectId }: { initialTasks: Task[], projectId: string }) {
  const { setTasks } = useTaskStore();
  const [mounted, setMounted] = useState(false);

  const { tasks, activeTask, sensors, onDragStart, onDragOver, onDragEnd } = useKanbanDnd();

  useEffect(() => {
    setMounted(true);
    setTasks(initialTasks);
  }, [initialTasks, setTasks]);

  if (!mounted) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-scrollbar">
        <div className="flex h-full gap-4 md:gap-6 min-w-max px-4 md:px-6">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks
                .filter((t) => t.status === col.id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))}
              projectId={projectId}
            />
          ))}
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeTask ? (
              <div className="w-[280px] md:w-[320px] cursor-grabbing opacity-90 rotate-3">
                <TaskCard task={activeTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
