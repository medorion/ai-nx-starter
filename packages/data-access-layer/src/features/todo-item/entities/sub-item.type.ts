import { TextSubItem } from './text-sub-item.interface';
import { NumberSubItem } from './number-sub-item.interface';
import { ChecklistSubItem } from './checklist-sub-item.interface';
import { LinkSubItem } from './link-sub-item.interface';
import { DateSubItem } from './date-sub-item.interface';

export type SubItem = TextSubItem | NumberSubItem | ChecklistSubItem | LinkSubItem | DateSubItem;
