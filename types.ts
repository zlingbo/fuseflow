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
  activePopoverId: string | null; // Track which task has an open popover
  isMobileInputOpen: boolean; // Track if mobile input modal is open
  addTask: (content: string, parentId?: string | null) => void;
  completeTask: (id: string, feeling?: TaskFeeling) => void;
  freezeTask: (id: string) => void;
  unfreezeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskContent: (id: string, content: string) => void;
  updateTaskReflection: (id: string, reflection: string) => void;
  updateTaskFeeling: (id: string, feeling: TaskFeeling) => void;
  splitTask: (id: string) => void;
  setActivePopoverId: (id: string | null) => void;
  setMobileInputOpen: (isOpen: boolean) => void;
}