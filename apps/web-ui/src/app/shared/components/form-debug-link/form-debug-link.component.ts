import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormDebugComponent } from '../form-debug/form-debug.component';
import { LocalSettingsService } from '../../../core/services/local-settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-form-debug-link',
  standalone: false,
  templateUrl: './form-debug-link.component.html',
  styleUrls: ['./form-debug-link.component.less'],
})
export class FormDebugLinkComponent {
  @Input() formGroup?: FormGroup;
  @Input() title = 'Form Debug';
  @Input() showValues = true;
  @Input() showErrors = true;
  @Input() showStatus = true;
  @Input() collapsed = false;
  @Input() linkText = 'Debug Form';
  @Input() modalWidth = '800px';

  enableFormDebugInfo$: Observable<boolean>;

  constructor(
    private modal: NzModalService,
    private localSettingsService: LocalSettingsService,
  ) {
    this.enableFormDebugInfo$ = this.localSettingsService.enableFormDebugInfo$;
  }

  openDebugModal(): void {
    this.modal.create({
      nzTitle: this.title,
      nzContent: FormDebugComponent,
      nzData: {
        formGroup: this.formGroup,
        title: this.title,
        showValues: this.showValues,
        showErrors: this.showErrors,
        showStatus: this.showStatus,
        collapsed: this.collapsed,
      },
      nzWidth: this.modalWidth,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: true,
    });
  }
}
