// Global types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TaskWithRelations {
  id: string;
  projectId: string;
  teamId: string;
  name: string;
  description?: string | null;
  status: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
  startDate: Date;
  endDate: Date;
  estimatedDays?: number | null;
  notes?: string | null;
  isMilestone: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  team?: {
    id: string;
    name: string;
    contactName?: string | null;
    contactPhone?: string | null;
  };
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  description?: string | null;
  status: 'planned' | 'in_progress' | 'done' | 'milestone' | 'blocked';
  startDate: Date;
  endDate: Date;
  sortOrder: number;
}

export interface DiaryEntryWithMedia {
  id: string;
  projectId: string;
  taskId: string;
  entryDate: Date;
  title?: string | null;
  notes?: string | null;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  task?: {
    id: string;
    name: string;
    status: string;
  };
  media?: DiaryMediaItem[];
}

export interface DiaryMediaItem {
  id: string;
  entryId: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  caption?: string | null;
  sortOrder: number;
}

export interface NotificationData {
  taskName: string;
  projectName: string;
  teamName: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}
