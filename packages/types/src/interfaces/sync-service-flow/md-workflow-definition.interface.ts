import { IMdActivity } from './md-activity.interface';

export interface IMdWorkflowDefinition {
  displayName: string;
  browsable: boolean;
  payload: string[];
  rootActivity: IMdActivity;
}
