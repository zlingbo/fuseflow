import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SparkState, SparkNode, TaskFeeling } from '../types';
import { generateId } from '../utils';

export const useSparkStore = create<SparkState>()(
  persist(
    (set) => ({
      tasks: [],
      activePopoverId: null,
      isMobileInputOpen: false,

      addTask: (content: string, parentId: string | null = null) => {
        const newTask: SparkNode = {
          id: generateId(),
          content,
          status: 'active',
          parentId: parentId || null,
          createdAt: Date.now()
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      completeTask: (id: string, feeling?: TaskFeeling) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: 'completed', completedAt: Date.now(), feeling }
              : task
          ),
        }));
      },

      freezeTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status: 'frozen' } : task
          ),
        }));
      },

      unfreezeTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status: 'active', parentId: null } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      updateTaskContent: (id: string, content: string) => {
         set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, content } : task
          ),
        }));
      },

      updateTaskReflection: (id: string, reflection: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, reflection } : task
          ),
        }));
      },

      updateTaskFeeling: (id: string, feeling: TaskFeeling) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, feeling } : task
          ),
        }));
      },

      splitTask: (id: string) => {
        set((state) => {
          // New Logic: Just add a child task. Do NOT re-parent the current task.
          // This prevents the visual jumping of the parent task.

          const newTask: SparkNode = {
            id: generateId(),
            content: '', // Empty content triggers edit mode in UI
            status: 'active',
            parentId: id, // It becomes a child of the current task
            createdAt: Date.now(),
          };

          return {
            tasks: [...state.tasks, newTask],
          };
        });
      },

      setActivePopoverId: (id: string | null) => {
        set(() => ({ activePopoverId: id }));
      },

      setMobileInputOpen: (isOpen: boolean) => {
        set(() => ({ isMobileInputOpen: isOpen }));
      }
    }),
    {
      name: 'spark-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
