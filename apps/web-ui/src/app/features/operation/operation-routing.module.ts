import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SnapshotsComponent } from './snapshots/snapshots.component';
import { ModelEditorComponent } from './model-editor/model-editor.component';

const routes: Routes = [
  {
    path: 'snapshots',
    component: SnapshotsComponent,
    data: { breadcrumb: 'Snapshots' },
  },
  {
    path: 'model-editor',
    component: ModelEditorComponent,
    data: { breadcrumb: 'Model Editor' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationRoutingModule {}
