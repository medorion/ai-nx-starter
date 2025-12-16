import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TeamsService } from '../../services/teams.service';
import { UsersService } from '../../../users/services/users.service';
import { ClientTeamDto, ClientUserDto, CreateTeamDto, UpdateTeamDto } from '@ai-nx-starter/types';

interface ModalData {
  team: ClientTeamDto | null;
}

@Component({
  selector: 'app-team-form',
  standalone: false,
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.less'],
})
export class TeamFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  readonly modalData: ModalData = inject(NZ_MODAL_DATA);

  teamForm: FormGroup;
  loading = false;
  isEditMode = false;
  team: ClientTeamDto | null = null;

  // Member management
  availableUsers: ClientUserDto[] = [];
  selectedUserForAdd: string | null = null;

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService,
    private usersService: UsersService,
    private message: NzMessageService,
    private modalRef: NzModalRef,
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.team = this.modalData.team;
    this.isEditMode = !!this.team;

    if (this.isEditMode && this.team) {
      this.teamForm.patchValue({
        name: this.team.name,
        description: this.team.description,
      });
    }

    this.loadAvailableUsers();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToLoading(): void {
    this.teamsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.loading = loading));
  }

  private loadAvailableUsers(): void {
    this.usersService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: ClientUserDto[]) => {
          // Filter out users that are already members (if editing)
          if (this.isEditMode && this.team) {
            this.availableUsers = users.filter((user) => !this.team?.memberIds.includes(user.id));
          } else {
            this.availableUsers = users;
          }
        },
        error: (error: any) => {
          this.message.error('Failed to load users');
          console.error('Error loading users:', error);
        },
      });
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      Object.values(this.teamForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const formValue = this.teamForm.value;

    if (this.isEditMode && this.team) {
      this.updateTeam(formValue);
    } else {
      this.createTeam(formValue);
    }
  }

  private createTeam(formValue: any): void {
    const createTeamDto: CreateTeamDto = {
      name: formValue.name,
      description: formValue.description || undefined,
    };

    this.teamsService
      .createTeam(createTeamDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Team created successfully');
          this.modalRef.close(true);
        },
        error: (error: Error) => {
          this.message.error('Failed to create team');
          console.error('Error creating team:', error);
        },
      });
  }

  private updateTeam(formValue: any): void {
    if (!this.team) return;

    const updateTeamDto: UpdateTeamDto = {
      name: formValue.name !== this.team.name ? formValue.name : undefined,
      description: formValue.description !== this.team.description ? formValue.description : undefined,
    };

    this.teamsService
      .updateTeam(this.team.id, updateTeamDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTeam) => {
          this.message.success('Team updated successfully');
          this.team = updatedTeam;
          this.modalRef.close(true);
        },
        error: (error: Error) => {
          this.message.error('Failed to update team');
          console.error('Error updating team:', error);
        },
      });
  }

  onAddMember(): void {
    if (!this.selectedUserForAdd || !this.team) return;

    this.teamsService
      .addMember(this.team.id, this.selectedUserForAdd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTeam) => {
          this.message.success('Member added successfully');
          this.team = updatedTeam;
          this.selectedUserForAdd = null;
          this.loadAvailableUsers(); // Refresh available users
        },
        error: (error: Error) => {
          this.message.error('Failed to add member');
          console.error('Error adding member:', error);
        },
      });
  }

  onRemoveMember(member: ClientUserDto): void {
    if (!this.team) return;

    // Prevent removing the owner
    if (member.id === this.team.ownerId) {
      this.message.warning('Cannot remove the team owner');
      return;
    }

    this.teamsService
      .removeMember(this.team.id, member.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTeam) => {
          this.message.success('Member removed successfully');
          this.team = updatedTeam;
          this.loadAvailableUsers(); // Refresh available users
        },
        error: (error: Error) => {
          this.message.error('Failed to remove member');
          console.error('Error removing member:', error);
        },
      });
  }

  onCancel(): void {
    this.modalRef.close(false);
  }
}
