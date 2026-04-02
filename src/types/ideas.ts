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
}

export type IdeaFormData = Omit<Idea, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
