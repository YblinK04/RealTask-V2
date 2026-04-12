import { create } from 'zustand';
import { type Task} from '@/lib/schemas';


interface DnDState {
    draggedTask: Task | null;

    targetColumn: string | null;


    setDraggedTask: (task: Task | null) => void;
    setTargetColumn: (column: string | null) => void;
    reset: () => void;
} 

export const useDndStore = create<DnDState>((set) => ({
    draggedTask: null,
    targetColumn: null,

    setDraggedTask: (task) => set({ draggedTask: task}),
    setTargetColumn: (column) => set({ targetColumn: column}),

    reset: () => set({ draggedTask: null, targetColumn: null})
}));

