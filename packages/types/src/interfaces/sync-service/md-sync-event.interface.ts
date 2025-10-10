import { SyncEventType } from '../../enums/features/sync-event-type.enum';

export interface IMdSyncEvent {
  userId?: string;
  data: string | object;
  flowId?: string;
  type: SyncEventType;
}
