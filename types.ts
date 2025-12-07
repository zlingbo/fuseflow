export type TaskStatus = 'active' | 'completed' | 'frozen';

export type TaskFeeling = '😐' | '🙂' | '🤩';

export interface SparkNode {
  id: string;
  content: string;
  status: TaskStatus;
  parentId: string | null;
  feeling?: TaskFeeling;
  reflection?: string;
  createdAt: number;
  completedAt?: number;
}

export interface SparkState {
  tasks: SparkNode[];
  addTask: (content: string, parentId?: string | null) => void;
  completeTask: (id: string, feeling?: TaskFeeling) => void;
  freezeTask: (id: string) => void;
  unfreezeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskContent: (id: string, content: string) => void;
  updateTaskReflection: (id: string, reflection: string) => void;
  splitTask: (id: string) => void;
}