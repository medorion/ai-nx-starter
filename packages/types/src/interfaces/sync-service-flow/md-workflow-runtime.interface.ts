import { FlowStatus } from '../../enums/features/flow-status.enum';
import { IMDWorkflowContext } from './md-workflow-context.interface';

export interface IMdWorkflowRuntime {
  wfId: string;
  executionOrder: string[];
  context: IMDWorkflowContext;
  status: FlowStatus;
  errors: string[];
}
