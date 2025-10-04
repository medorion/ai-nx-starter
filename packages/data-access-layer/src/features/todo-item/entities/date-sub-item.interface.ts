export interface DateSubItem {
  type: 'date';
  date: Date;
  timezone?: string;
  metadata?: Record<string, any>;
}
