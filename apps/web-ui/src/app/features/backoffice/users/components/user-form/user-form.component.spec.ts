import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, tap } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserFormComponent } from './user-form.component';
import { UsersService } from '../../services/users.service';
import { ClientUserDto, Role } from '@ai-nx-starter/types';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let usersService: jest.Mocked<UsersService>;
  let router: jest.Mocked<Router>;
  let route: jest.Mocked<ActivatedRoute>;
  let messageService: jest.Mocked<NzMessageService>;

  const mockUser: ClientUserDto = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: Role.Admin,
    picture: 'https://example.com/pic.jpg',
    createdAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const mockUsersService = {
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn(),
        },
      },
    };

    const mockMessageService = {
      success: jest.fn(),
      error: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NzMessageService, useValue: mockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    usersService = TestBed.inject(UsersService) as jest.Mocked<UsersService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    route = TestBed.inject(ActivatedRoute) as jest.Mocked<ActivatedRoute>;
    messageService = TestBed.inject(NzMessageService) as jest.Mocked<NzMessageService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form in create mode when no userId in route', () => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue(null);

      component.ngOnInit();

      expect(component.isEditMode).toBe(false);
      expect(component.userId).toBeNull();
      expect(component.userForm).toBeDefined();
      expect(component.userForm.get('password')?.hasError('required')).toBe(true);
    });

    it('should initialize form with required validators in create mode', () => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue(null);

      component.ngOnInit();

      const form = component.userForm;
      expect(form.get('firstName')?.hasError('required')).toBe(true);
      expect(form.get('lastName')?.hasError('required')).toBe(true);
      expect(form.get('email')?.hasError('required')).toBe(true);
      expect(form.get('password')?.hasError('required')).toBe(true);
      expect(form.get('role')?.value).toBe(Role.Admin);
    });

    it('should initialize form in edit mode when userId in route', () => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue('user-123');
      usersService.getUserById.mockReturnValue(of(mockUser));

      component.ngOnInit();

      expect(component.isEditMode).toBe(true);
      expect(component.userId).toBe('user-123');
      expect(usersService.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should remove required validator from password in edit mode', () => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue('user-123');
      usersService.getUserById.mockReturnValue(of(mockUser));

      component.ngOnInit();

      const passwordControl = component.userForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(false);
    });

    it('should keep minLength validator on password in edit mode', () => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue('user-123');
      usersService.getUserById.mockReturnValue(of(mockUser));

      component.ngOnInit();

      const passwordControl = component.userForm.get('password');
      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBe(true);
    });
  });

  describe('Load User (Edit Mode)', () => {
    beforeEach(() => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue('user-123');
    });

    it('should load user data and populate form', (done) => {
      usersService.getUserById.mockReturnValue(of(mockUser));

      component.ngOnInit();

      setTimeout(() => {
        expect(component.userForm.value.firstName).toBe(mockUser.firstName);
        expect(component.userForm.value.lastName).toBe(mockUser.lastName);
        expect(component.userForm.value.email).toBe(mockUser.email);
        expect(component.userForm.value.role).toBe(mockUser.role);
        expect(component.userForm.value.phone).toBe(mockUser.phone);
        expect(component.userForm.value.picture).toBe(mockUser.picture);
        expect(component.loading).toBe(false);
        done();
      }, 10);
    });

    it('should set loading to true while fetching user', (done) => {
      let loadingBeforeComplete = false;
      usersService.getUserById.mockReturnValue(
        of(mockUser).pipe(
          tap(() => {
            loadingBeforeComplete = component.loading;
          }),
        ),
      );

      component.ngOnInit();

      setTimeout(() => {
        expect(loadingBeforeComplete).toBe(true);
        done();
      }, 10);
    });

    it('should handle error when loading user fails', (done) => {
      const error = { message: 'User not found' };
      usersService.getUserById.mockReturnValue(throwError(() => error));

      component.ngOnInit();

      setTimeout(() => {
        expect(messageService.error).toHaveBeenCalledWith('Failed to load user');
        expect(component.loading).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/backoffice/users']);
        done();
      }, 10);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      component.ngOnInit();
    });

    it('should validate required firstName', () => {
      const firstNameControl = component.userForm.get('firstName');
      firstNameControl?.setValue('');
      expect(firstNameControl?.hasError('required')).toBe(true);

      firstNameControl?.setValue('John');
      expect(firstNameControl?.hasError('required')).toBe(false);
    });

    it('should validate required lastName', () => {
      const lastNameControl = component.userForm.get('lastName');
      lastNameControl?.setValue('');
      expect(lastNameControl?.hasError('required')).toBe(true);

      lastNameControl?.setValue('Doe');
      expect(lastNameControl?.hasError('required')).toBe(false);
    });

    it('should validate email format', () => {
      const emailControl = component.userForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate password minLength', () => {
      const passwordControl = component.userForm.get('password');

      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should allow optional phone field', () => {
      const phoneControl = component.userForm.get('phone');
      phoneControl?.setValue('');
      expect(phoneControl?.valid).toBe(true);

      phoneControl?.setValue('+1234567890');
      expect(phoneControl?.valid).toBe(true);
    });

    it('should allow optional picture field', () => {
      const pictureControl = component.userForm.get('picture');
      pictureControl?.setValue('');
      expect(pictureControl?.valid).toBe(true);

      pictureControl?.setValue('https://example.com/pic.jpg');
      expect(pictureControl?.valid).toBe(true);
    });
  });

  describe('Create User', () => {
    beforeEach(() => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      component.ngOnInit();
    });

    it('should create user when form is valid', (done) => {
      usersService.createUser.mockReturnValue(of(mockUser));

      component.userForm.patchValue({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'password123',
        role: Role.Admin,
      });

      component.onSubmit();

      setTimeout(() => {
        expect(usersService.createUser).toHaveBeenCalledWith(component.userForm.value);
        expect(messageService.success).toHaveBeenCalledWith('User created successfully');
        expect(router.navigate).toHaveBeenCalledWith(['/backoffice/users']);
        done();
      }, 10);
    });

    it('should not submit when form is invalid', () => {
      component.userForm.patchValue({
        firstName: '',
        email: 'invalid-email',
      });

      component.onSubmit();

      expect(usersService.createUser).not.toHaveBeenCalled();
      expect(component.submitting).toBe(false);
    });

    it('should mark all invalid fields as dirty when submitting invalid form', () => {
      component.userForm.patchValue({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(component.userForm.get('firstName')?.dirty).toBe(true);
      expect(component.userForm.get('lastName')?.dirty).toBe(true);
      expect(component.userForm.get('email')?.dirty).toBe(true);
      expect(component.userForm.get('password')?.dirty).toBe(true);
    });

    it('should set submitting flag during creation', () => {
      usersService.createUser.mockReturnValue(of(mockUser));

      component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: Role.Admin,
      });

      component.onSubmit();

      expect(component.submitting).toBe(true);
    });

    it('should handle error when creating user fails', (done) => {
      const error = { error: { message: 'Email already exists' } };
      usersService.createUser.mockReturnValue(throwError(() => error));

      component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(messageService.error).toHaveBeenCalledWith('Email already exists');
        expect(component.submitting).toBe(false);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should use default error message when error has no message', (done) => {
      usersService.createUser.mockReturnValue(throwError(() => ({})));

      component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(messageService.error).toHaveBeenCalledWith('Failed to create user');
        done();
      }, 10);
    });
  });

  describe('Update User', () => {
    beforeEach(() => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue('user-123');
      usersService.getUserById.mockReturnValue(of(mockUser));
      component.ngOnInit();
    });

    it('should update user when form is valid', (done) => {
      usersService.updateUser.mockReturnValue(of(mockUser));

      component.userForm.patchValue({
        firstName: 'Updated',
        lastName: 'Name',
      });

      setTimeout(() => {
        component.onSubmit();

        setTimeout(() => {
          expect(usersService.updateUser).toHaveBeenCalledWith(
            'user-123',
            expect.objectContaining({ firstName: 'Updated', lastName: 'Name' }),
          );
          expect(messageService.success).toHaveBeenCalledWith('User updated successfully');
          expect(router.navigate).toHaveBeenCalledWith(['/backoffice/users']);
          done();
        }, 10);
      }, 10);
    });

    it('should remove empty password when updating', (done) => {
      usersService.updateUser.mockReturnValue(of(mockUser));

      setTimeout(() => {
        component.userForm.patchValue({
          firstName: 'Updated',
          password: '',
        });

        component.onSubmit();

        setTimeout(() => {
          const updateDto = usersService.updateUser.mock.calls[0][1];
          expect(updateDto.password).toBeUndefined();
          done();
        }, 10);
      }, 10);
    });

    it('should include password when provided during update', (done) => {
      usersService.updateUser.mockReturnValue(of(mockUser));

      setTimeout(() => {
        component.userForm.patchValue({
          password: 'newpassword123',
        });

        component.onSubmit();

        setTimeout(() => {
          const updateDto = usersService.updateUser.mock.calls[0][1];
          expect(updateDto.password).toBe('newpassword123');
          done();
        }, 10);
      }, 10);
    });

    it('should handle error when updating user fails', (done) => {
      const error = { error: { message: 'Update failed' } };
      usersService.updateUser.mockReturnValue(throwError(() => error));

      setTimeout(() => {
        component.onSubmit();

        setTimeout(() => {
          expect(messageService.error).toHaveBeenCalledWith('Update failed');
          expect(component.submitting).toBe(false);
          done();
        }, 10);
      }, 10);
    });
  });

  describe('Cancel and Navigation', () => {
    beforeEach(() => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      component.ngOnInit();
    });

    it('should navigate to users list when cancel is clicked', () => {
      component.onCancel();

      expect(router.navigate).toHaveBeenCalledWith(['/backoffice/users']);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      route.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      component.ngOnInit();
    });

    it('should check if field is invalid - dirty field', () => {
      const firstNameControl = component.userForm.get('firstName');
      firstNameControl?.setValue('');
      firstNameControl?.markAsDirty();

      expect(component.isFieldInvalid('firstName')).toBe(true);
    });

    it('should check if field is invalid - touched field', () => {
      const firstNameControl = component.userForm.get('firstName');
      firstNameControl?.setValue('');
      firstNameControl?.markAsTouched();

      expect(component.isFieldInvalid('firstName')).toBe(true);
    });

    it('should return false when field is valid', () => {
      const firstNameControl = component.userForm.get('firstName');
      firstNameControl?.setValue('John');
      firstNameControl?.markAsDirty();

      expect(component.isFieldInvalid('firstName')).toBe(false);
    });

    it('should return false when field is invalid but not dirty or touched', () => {
      const firstNameControl = component.userForm.get('firstName');
      firstNameControl?.setValue('');

      expect(component.isFieldInvalid('firstName')).toBe(false);
    });

    it('should return form data as JSON string', () => {
      component.userForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      });

      const json = component.formDataJson;
      const parsed = JSON.parse(json);

      expect(parsed.firstName).toBe('Test');
      expect(parsed.lastName).toBe('User');
      expect(parsed.email).toBe('test@example.com');
    });
  });

  describe('Role Options', () => {
    it('should have Root, Admin, and User role options', () => {
      expect(component.roleOptions).toHaveLength(3);
      expect(component.roleOptions[0]).toEqual({ label: 'Root', value: Role.Root });
      expect(component.roleOptions[1]).toEqual({ label: 'Admin', value: Role.Admin });
      expect(component.roleOptions[2]).toEqual({ label: 'User', value: Role.User });
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
