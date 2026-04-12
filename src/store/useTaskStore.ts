import { create } from 'zustand';
import { Task, TaskStatus } from '@/lib/schemas';

interface TaskState {
  tasks: Task[];
  activeTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setActiveTask: (task: Task | null) => void;
  addTask: (task: Task) => void; 
  updateTask: (taskId: string, data: Partial<Task>) => void;
  moveTask: (taskId: string, status: TaskStatus, order: number) => void;
  deleteTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
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

  moveTask: (taskId, status, order) => set((state) => {
    const updatedTasks = [...state.tasks];
    const idx = updatedTasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      updatedTasks[idx] = { ...updatedTasks[idx], status, order };
    }
    return { tasks: updatedTasks };
  }),

  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId)
  })),
}));
