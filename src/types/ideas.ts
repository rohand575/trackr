export type IdeaColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export type IdeaKanbanStatus = 'todo' | 'in-progress' | 'done';

export interface Idea {
  id: string;
  userId: string;
  title: string;
  body: string;
  color: IdeaColor;
  pinned: boolean;
  checklist: ChecklistItem[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  kanbanStatus: IdeaKanbanStatus;
  section: 'ideas' | 'documents';
  documentFolderId: string | null;
}

export type IdeaFormData = Omit<Idea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
