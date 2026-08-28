import { useState } from 'react';
import { 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { Task, TaskStatus } from '@/lib/schemas';
import { useTaskStore } from '@/store/useTaskStore';
import { useDndStore } from '@/store/dnd-store'; 

export function useKanbanDnd() {
  const { tasks, updateTask, moveTaskServer, activeTask, setActiveTask } = useTaskStore();
  
  const { setDraggedTask, setTargetColumn, reset } = useDndStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      const task = event.active.data.current.task as Task;
      setActiveTask(task);
      setDraggedTask(task);
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

    if (isOverATask) {
      const activeTaskItem = tasks.find((t) => t.id === activeId);
      const overTaskItem = tasks.find((t) => t.id === overId);

      if (activeTaskItem && overTaskItem && activeTaskItem.status !== overTaskItem.status) {
        updateTask(String(activeId), { status: overTaskItem.status });
        setTargetColumn(overTaskItem.status);
      }
    }

    const isOverAColumn = over.data.current?.type === 'Column';
    if (isOverAColumn) {
      const activeTaskItem = tasks.find((t) => t.id === activeId);
      const targetStatus = overId as TaskStatus;

      if (activeTaskItem && activeTaskItem.status !== targetStatus) {
        updateTask(String(activeId), { status: targetStatus });
        setTargetColumn(targetStatus);
      }
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    
    reset();

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id).trim();
    const overId = String(over.id).trim();

    const activeTaskItem = tasks.find((t) => String(t.id).trim() === activeId);
    if (!activeTaskItem) return;

    const targetStatus = activeTaskItem.status;

    const currentColumnTasks = tasks
      .filter((t) => t.status === targetStatus && String(t.id).trim() !== activeId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let targetOrder = 0;
    const isOverATask = over.data.current?.type === 'Task';
    
    if (isOverATask) {
      const overIndexInColumn = currentColumnTasks.findIndex((t) => String(t.id).trim() === overId);
      if (overIndexInColumn !== -1) {
        targetOrder = overIndexInColumn;
      } else {
        targetOrder = currentColumnTasks.length;
      }
    } else {
      targetOrder = currentColumnTasks.length;
    }

    await moveTaskServer(activeId, targetStatus, targetOrder);
  }

  return {
    tasks,
    activeTask,
    sensors,
    onDragStart,
    onDragOver,
    onDragEnd
  };
}
