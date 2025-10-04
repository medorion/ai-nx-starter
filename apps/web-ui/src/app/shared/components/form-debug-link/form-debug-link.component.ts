import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { FormDebugComponent } from '../form-debug/form-debug.component';
import { LocalSettingsService } from '../../../core/services/local-settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-form-debug-link',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule, NzModalModule],
  templateUrl: './form-debug-link.component.html',
  styleUrls: ['./form-debug-link.component.less'],
})
export class FormDebugLinkComponent {
  @Input() formGroup?: FormGroup;
  @Input() title: string = 'Form Debug';
  @Input() showValues: boolean = true;
  @Input() showErrors: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() collapsed: boolean = false;
  @Input() linkText: string = 'Debug Form';
  @Input() modalWidth: string = '800px';

  enableFormDebugInfo$: Observable<boolean>;

  constructor(
    private modal: NzModalService,
    private localSettingsService: LocalSettingsService
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
