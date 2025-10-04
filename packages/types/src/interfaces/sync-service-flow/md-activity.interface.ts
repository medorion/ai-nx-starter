import { FlowStatus } from '../../enums/features/flow-status.enum';
import { JobOptions } from 'bull';

export interface IMdActivity {
  id: string;
  dynamicWfActivityId?: string;
  options: JobOptions;
  name: string;
  params: any;
  activityId: string;
  expression: string;
  status: FlowStatus;
  errors: string[];
  logs?: string[];
  children: IMdActivity[];
  finalizeActivity: IMdActivity;
}
