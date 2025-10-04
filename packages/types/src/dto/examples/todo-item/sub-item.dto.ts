import { TextSubItemDto } from './text-sub-item.dto';
import { NumberSubItemDto } from './number-sub-item.dto';
import { ChecklistSubItemDto } from './checklist-sub-item.dto';
import { LinkSubItemDto } from './link-sub-item.dto';
import { DateSubItemDto } from './date-sub-item.dto';

export type SubItemDto = TextSubItemDto | NumberSubItemDto | ChecklistSubItemDto | LinkSubItemDto | DateSubItemDto;
