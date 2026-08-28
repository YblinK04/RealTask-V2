import { create } from 'zustand';
import { Task, TaskStatus } from '@/lib/schemas';
import { api } from '@/lib/react-query'; 

interface TaskState {
  tasks: Task[];
  activeTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setActiveTask: (task: Task | null) => void;
  addTask: (task: Task) => void; 
  updateTask: (taskId: string, data: Partial<Task>) => void;
  moveTaskServer: (taskId: string, targetStatus: TaskStatus, targetOrder: number) => Promise<void>;
  deleteTaskServer: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTask: null,
  
  setTasks: (tasks) => set({ tasks }),
  setActiveTask: (task) => set({ activeTask: task }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks] 
  })),

  updateTask: (taskId, data) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...data } : t)
  })),

  moveTaskServer: async (taskId, targetStatus, targetOrder) => {
    const previousTasks = get().tasks;

    set((state) => {
      const currentTask = state.tasks.find(t => t.id === taskId);
      if (!currentTask) return { tasks: state.tasks };

      const otherTasks = state.tasks.filter(t => t.id !== taskId);

      const targetColumnTasks = otherTasks
        .filter(t => t.status === targetStatus)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      
      const restTasks = otherTasks.filter(t => t.status !== targetStatus);

      targetColumnTasks.splice(targetOrder, 0, { ...currentTask, status: targetStatus });

      const updatedTargetTasks = targetColumnTasks.map((task, index) => ({
        ...task,
        order: index
      }));

      return { tasks: [...restTasks, ...updatedTargetTasks] };
    });

    try {
      await api.patch(`/api/tasks/${taskId}`, { 
        taskId, 
        newStatus: targetStatus, 
        newOrder: targetOrder 
      });
    } catch (error) {
      console.error('Ошибка при перемещении задачи:', error);
      set({ tasks: previousTasks });
    }
  },

  deleteTaskServer: async (taskId) => {
    const previousTasks = get().tasks;

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));

    try {
      await api.delete(`/api/tasks/${taskId}`);
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      set({ tasks: previousTasks });
    }
  },
}));
