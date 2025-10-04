import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrganizationsService } from '../organizations.service';
import { OrganizationDto, OrganizationStatus, UpdateOrganizationDataDto } from '@medorion/types';
import { FormGroupService } from '../../../../core/services/form-group.service';

@Component({
  selector: 'app-organization-form',
  standalone: false,
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.less'],
})
export class OrganizationFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  organizationForm!: FormGroup;
  loading = false;
  isEditMode = false;
  organizationId: string | null = null;

  // Status options for select
  statusOptions = [
    { label: 'Active', value: OrganizationStatus.Active },
    { label: 'Suspended', value: OrganizationStatus.Suspended },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationsService: OrganizationsService,
    private message: NzMessageService,
    private formGroupService: FormGroupService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkRouteParams();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Use the FormGroupService to create form with validators based on OrganizationDto decorators
    this.organizationForm = this.formGroupService.createFormGroup(OrganizationDto);

    // Set default status to Active for new organizations
    if (!this.isEditMode) {
      this.organizationForm.patchValue({
        status: OrganizationStatus.Active,
      });
    }
  }

  private checkRouteParams(): void {
    this.organizationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.organizationId;

    if (this.isEditMode && this.organizationId) {
      this.loadOrganization(this.organizationId);
    } else {
      // Force form validation to display error messages when creating new item
      this.organizationForm.markAllAsTouched();
      this.organizationForm.updateValueAndValidity();
    }
  }

  private subscribeToLoading(): void {
    this.organizationsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  private loadOrganization(id: string): void {
    this.organizationsService
      .getOrganizationById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organization) => {
          this.populateForm(organization);
        },
        error: (error) => {
          this.message.error('Failed to load organization');
          console.error('Error loading organization:', error);
          this.navigateToList();
        },
      });
  }

  private populateForm(organization: OrganizationDto): void {
    this.organizationForm.patchValue({
      name: organization.name,
      code: organization.code,
      status: organization.status,
    });

    // Disable code field in edit mode since it's a unique identifier
    const codeControl = this.organizationForm.get('code');
    if (codeControl) {
      codeControl.disable();
    }
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      const formValue = this.organizationForm.getRawValue();
      if (this.isEditMode && this.organizationId) {
        const updateData: UpdateOrganizationDataDto = {
          name: formValue.name,
          status: formValue.status,
        };
        this.updateOrganization(this.organizationId, updateData);
      } else {
        const createOrganizationData: OrganizationDto = {
          name: formValue.name,
          code: formValue.code,
          status: formValue.status,
        };
        this.createOrganization(createOrganizationData);
      }
    } else {
      this.markFormGroupTouched();
      this.message.warning('Please fill in all required fields correctly');
    }
  }

  private createOrganization(organizationData: OrganizationDto): void {
    this.organizationsService
      .createOrganization(organizationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.message.success(`Organization "${created.name}" created successfully`);
          this.navigateToList();
        },
        error: (error) => {
          this.message.error('Failed to create organization');
          console.error('Error creating organization:', error);
        },
      });
  }

  private updateOrganization(id: string, organizationData: UpdateOrganizationDataDto): void {
    this.organizationsService
      .updateOrganization(id, organizationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.message.success(`Organization "${updated.name}" updated successfully`);
          this.navigateToList();
        },
        error: (error) => {
          this.message.error('Failed to update organization');
          console.error('Error updating organization:', error);
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.organizationForm.controls).forEach((key) => {
      const control = this.organizationForm.get(key);
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
    this.router.navigate(['/backoffice/organizations']);
  }

  // Helper methods for form validation display
  isFieldInvalid(fieldName: string): boolean {
    return !this.formGroupService.isControlValid(fieldName, this.organizationForm);
  }

  getFieldError(fieldName: string): string {
    return this.formGroupService.getControlError(fieldName, this.organizationForm);
  }
}
