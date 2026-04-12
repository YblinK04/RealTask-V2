'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { Task, TaskStatus } from '@/lib/schemas';
import { useTaskStore } from '@/store/useTaskStore';
import { createPortal } from 'react-dom';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'К исполнению' },
  { id: 'IN_PROGRESS', title: 'В работе' },
  { id: 'REVIEW', title: 'На проверке' },
  { id: 'DONE', title: 'Готово' },
];

export function KanbanBoard({ initialTasks, projectId }: { initialTasks: Task[], projectId: string }) {
  const { tasks, setTasks, moveTask, activeTask, setActiveTask } = useTaskStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTasks(initialTasks);
  }, [initialTasks, setTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, 
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  if (!mounted) return null;

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (tasks[activeIndex].status !== tasks[overIndex].status) {
        moveTask(String(activeId), tasks[overIndex].status, overIndex);
      }
    }

    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveATask && isOverAColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      if (tasks[activeIndex].status !== overId) {
        moveTask(String(activeId), overId as TaskStatus, 0);
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

  }

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
              tasks={tasks.filter((t) => t.status === col.id)}
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