import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SolutionsService } from '../solutions.service';
import { SolutionDto } from '@medorion/types';
import { FormGroupService } from '../../../../core/services/form-group.service';
import { UIAppContextService } from '../../../../core/services/ui-app-context.service';

@Component({
  selector: 'app-solution-form',
  standalone: false,
  templateUrl: './solution-form.component.html',
  styleUrls: ['./solution-form.component.less'],
})
export class SolutionFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  solutionForm!: FormGroup;
  loading = false;
  isEditMode = false;
  solutionId: string | null = null;
  currentOrgCode: string | null = null;

  // Collapsible panels state
  communicationPanelsActive = {
    email: false,
    sms: false,
    slack: false,
    ivr: false,
    facebook: false,
    googleAnalytics: false,
    journey: false,
    externalBucket: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private solutionsService: SolutionsService,
    private message: NzMessageService,
    private formGroupService: FormGroupService,
    private uiAppContextService: UIAppContextService,
  ) {}

  ngOnInit(): void {
    this.currentOrgCode = this.uiAppContextService.currentOrganization?.code || null;

    if (!this.currentOrgCode) {
      this.message.error('No organization selected');
      this.navigateToList();
      return;
    }

    this.initializeForm();
    this.checkRouteParams();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.solutionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      appCode: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      isActive: [true, [Validators.required]],
      allowedUserIds: [[]],
      creationUserId: ['', [Validators.required]],
      // Communication settings - all optional
      emailSettings: this.fb.group({
        enabled: [false],
        // Add email-specific fields here
      }),
      smsSettings: this.fb.group({
        enabled: [false],
        // Add SMS-specific fields here
      }),
      slackSettings: this.fb.group({
        enabled: [false],
        // Add Slack-specific fields here
      }),
      ivrSettings: this.fb.group({
        enabled: [false],
        // Add IVR-specific fields here
      }),
      facebookSettings: this.fb.group({
        enabled: [false],
        // Add Facebook-specific fields here
      }),
      googleAnalyticsSettings: this.fb.group({
        enabled: [false],
        // Add Google Analytics-specific fields here
      }),
      journeySettings: this.fb.group({
        enabled: [false],
        // Add Journey-specific fields here
      }),
      externalBucketSettings: this.fb.group({
        enabled: [false],
        // Add External Bucket-specific fields here
      }),
    });
  }

  private checkRouteParams(): void {
    this.solutionId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.solutionId;

    if (this.isEditMode && this.solutionId) {
      this.loadSolution(this.solutionId);
    } else {
      // Set current user as creation user for new solutions
      const currentUser = this.uiAppContextService.currentUser;
      if (currentUser?.id) {
        this.solutionForm.patchValue({
          creationUserId: currentUser.id,
        });
      }

      // Force form validation
      this.solutionForm.markAllAsTouched();
      this.solutionForm.updateValueAndValidity();
    }
  }

  private subscribeToLoading(): void {
    this.solutionsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  private loadSolution(id: string): void {
    this.solutionsService
      .getSolutionById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (solution) => {
          if (solution) {
            this.populateForm(solution);
          } else {
            this.message.error('Solution not found');
            this.navigateToList();
          }
        },
        error: (error) => {
          this.message.error('Failed to load solution');
          console.error('Error loading solution:', error);
          this.navigateToList();
        },
      });
  }

  private populateForm(solution: SolutionDto): void {
    this.solutionForm.patchValue({
      name: solution.name,
      appCode: solution.appCode,
      description: solution.description,
      isActive: solution.isActive,
      allowedUserIds: solution.allowedUserIds,
      creationUserId: solution.creationUserId,
    });

    // Populate communication settings if they exist
    if (solution.defaultCommunicationSettings) {
      // TODO: Populate individual settings based on the structure
    }

    // Disable appCode field in edit mode since it's a unique identifier
    const appCodeControl = this.solutionForm.get('appCode');
    if (appCodeControl) {
      appCodeControl.disable();
    }
  }

  onSubmit(): void {
    if (this.solutionForm.valid) {
      const formValue = this.solutionForm.getRawValue();

      // Build communication settings object
      const defaultCommunicationSettings = this.buildCommunicationSettings(formValue);

      const solutionData: SolutionDto = {
        name: formValue.name,
        orgCode: this.currentOrgCode!,
        appCode: formValue.appCode,
        description: formValue.description,
        isActive: formValue.isActive,
        allowedUserIds: formValue.allowedUserIds || [],
        creationUserId: formValue.creationUserId,
        defaultCommunicationSettings: defaultCommunicationSettings as any,
      };

      if (this.isEditMode && this.solutionId) {
        this.updateSolution(this.solutionId, solutionData);
      } else {
        this.createSolution(solutionData);
      }
    } else {
      this.markFormGroupTouched();
      this.message.warning('Please fill in all required fields correctly');
    }
  }

  private buildCommunicationSettings(formValue: any): any {
    // Build the communication settings object from form values
    // Only include settings that are enabled
    return {
      email: formValue.emailSettings?.enabled ? formValue.emailSettings : undefined,
      sms: formValue.smsSettings?.enabled ? formValue.smsSettings : undefined,
      slack: formValue.slackSettings?.enabled ? formValue.slackSettings : undefined,
      ivr: formValue.ivrSettings?.enabled ? formValue.ivrSettings : undefined,
      facebook: formValue.facebookSettings?.enabled ? formValue.facebookSettings : undefined,
      googleAnalytics: formValue.googleAnalyticsSettings?.enabled ? formValue.googleAnalyticsSettings : undefined,
      journeySettings: formValue.journeySettings?.enabled ? formValue.journeySettings : undefined,
      externalBucketSettings: formValue.externalBucketSettings?.enabled ? formValue.externalBucketSettings : undefined,
    };
  }

  private createSolution(solutionData: SolutionDto): void {
    this.solutionsService
      .createSolution(solutionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.message.success(`Solution "${created.name}" created successfully`);
          this.navigateToList();
        },
        error: (error) => {
          this.message.error('Failed to create solution');
          console.error('Error creating solution:', error);
        },
      });
  }

  private updateSolution(id: string, solutionData: Partial<SolutionDto>): void {
    this.solutionsService
      .updateSolution(id, solutionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.message.success(`Solution "${updated.name}" updated successfully`);
          this.navigateToList();
        },
        error: (error) => {
          this.message.error('Failed to update solution');
          console.error('Error updating solution:', error);
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.solutionForm.controls).forEach((key) => {
      const control = this.solutionForm.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  onCancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/backoffice/solutions']);
  }

  // Helper methods for form validation display
  isFieldInvalid(fieldName: string): boolean {
    return !this.formGroupService.isControlValid(fieldName, this.solutionForm);
  }

  getFieldError(fieldName: string): string {
    return this.formGroupService.getControlError(fieldName, this.solutionForm);
  }
}
