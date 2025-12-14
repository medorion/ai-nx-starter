import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersService } from '../../services/users.service';
import { ClientUserDto, CreateUserDto, UpdateUserDto, Role } from '@ai-nx-starter/types';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.less'],
})
export class UserFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  submitting = false;

  // Role options
  roleOptions = [
    { label: 'Root', value: Role.Root },
    { label: 'Admin', value: Role.Admin },
    { label: 'User', value: Role.User },
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [Role.Admin, [Validators.required]],
      phone: [''],
      picture: [''],
    });
  }

  private checkEditMode(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode && this.userId) {
      // In edit mode, password is optional
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();

      this.loadUser(this.userId);
    }
  }

  private loadUser(id: string): void {
    this.loading = true;
    this.usersService
      .getUserById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: ClientUserDto) => {
          this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            picture: user.picture,
          });
          this.loading = false;
        },
        error: (error: any) => {
          this.message.error('Failed to load user');
          console.error('Error loading user:', error);
          this.loading = false;
          this.navigateToList();
        },
      });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;

    if (this.isEditMode && this.userId) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    const createUserDto: CreateUserDto = this.userForm.value;

    this.usersService
      .createUser(createUserDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('User created successfully');
          this.navigateToList();
        },
        error: (error: any) => {
          this.message.error(error?.error?.message || 'Failed to create user');
          console.error('Error creating user:', error);
          this.submitting = false;
        },
      });
  }

  private updateUser(): void {
    const updateUserDto: UpdateUserDto = { ...this.userForm.value };

    // Remove password if empty (not updating password)
    if (!updateUserDto.password) {
      delete updateUserDto.password;
    }

    this.usersService
      .updateUser(this.userId!, updateUserDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('User updated successfully');
          this.navigateToList();
        },
        error: (error: any) => {
          this.message.error(error?.error?.message || 'Failed to update user');
          console.error('Error updating user:', error);
          this.submitting = false;
        },
      });
  }

  onCancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/backoffice/users']);
  }

  // Helper method to check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Get form data as JSON for debugging
  get formDataJson(): string {
    return JSON.stringify(this.userForm.value, null, 2);
  }
}
