import { IMdActivity } from './md-activity.interface';
import { IMdWorkflowRuntime } from './md-workflow-runtime.interface';

export interface IMdWorkflow {
  name: string;
  runtime: IMdWorkflowRuntime;
  rootActivity: IMdActivity;
  // Used to connect with streaming message
  messageId: string;
  eventId: string;
  payload: any;
}
