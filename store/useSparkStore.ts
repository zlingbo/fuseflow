import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SparkState, SparkNode, TaskFeeling } from '../types';
import { generateId } from '../utils';

export const useSparkStore = create<SparkState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (content: string, parentId: string | null = null) => {
        const newTask: SparkNode = {
          id: generateId(),
          content,
          status: 'active',
          parentId: parentId || null,
          createdAt: Date.now(),
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

      splitTask: (id: string) => {
        set((state) => {
          const targetTask = state.tasks.find((t) => t.id === id);
          if (!targetTask) return state;

          const newTask: SparkNode = {
            id: generateId(),
            content: '', // Empty content triggers edit mode in UI
            status: 'active',
            parentId: targetTask.parentId, // Take the place of the target
            createdAt: Date.now(),
          };

          // Re-link: Target becomes child of New Task
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === id) {
              return { ...task, parentId: newTask.id };
            }
            return task;
          });

          return {
            tasks: [...updatedTasks, newTask],
          };
        });
      },
    }),
    {
      name: 'spark-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);