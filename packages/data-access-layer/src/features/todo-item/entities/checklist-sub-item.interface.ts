export interface ChecklistSubItem {
  type: 'checklist';
  items: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  metadata?: Record<string, any>;
}
