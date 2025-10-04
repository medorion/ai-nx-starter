export interface IMDWorkflowContext<Output = any> {
  workflowId?: string;
  output: Output;
  [key: string]: any;
}
