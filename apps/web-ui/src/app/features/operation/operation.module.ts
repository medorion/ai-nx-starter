import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationRoutingModule } from './operation-routing.module';
import { ModelEditorComponent } from './model-editor/model-editor.component';
import { SnapshotsComponent } from './snapshots/snapshots.component';

@NgModule({
  declarations: [ModelEditorComponent, SnapshotsComponent],
  imports: [CommonModule, OperationRoutingModule],
})
export class OperationModule {}
