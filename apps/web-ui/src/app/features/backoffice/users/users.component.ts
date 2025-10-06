import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";
import { UsersService } from "./users.service";
import { ClientUserDto } from "@medorion/types";

@Component({
  selector: "app-users",
  standalone: false,
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.less",
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users: ClientUserDto[] = [];
  filteredUsers: ClientUserDto[] = [];
  loading = false;
  searchQuery = "";

  // Table configuration
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  constructor(
    private usersService: UsersService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.subscribeToLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.usersService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applySearch();
        },
        error: (error) => {
          this.message.error("Failed to load users");
          console.error("Error loading users:", error);
        },
      });
  }

  private subscribeToLoading(): void {
    this.usersService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }
    this.total = this.filteredUsers.length;
    this.pageIndex = 1; // Reset to first page
  }

  onResetPassword(user: ClientUserDto): void {
    this.modal.confirm({
      nzTitle: "Reset Password",
      nzContent: `Are you sure you want to send a password reset email to <strong>${user.email}</strong>?`,
      nzOkText: "Send Reset Email",
      nzOkType: "primary",
      nzCancelText: "Cancel",
      nzOnOk: () => this.confirmResetPassword(user),
    });
  }

  private confirmResetPassword(user: ClientUserDto): void {
    this.usersService
      .resetPassword(user.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success(`Password reset email sent to ${user.email}`);
        },
        error: (error: Error) => {
          this.message.error("Failed to send password reset email");
          console.error("Error resetting password:", error);
        },
      });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1; // Reset to first page when page size changes
  }

  // Get paginated data for current page
  get paginatedUsers(): ClientUserDto[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  getUserDisplayName(user: ClientUserDto): string {
    if (user.displayName) {
      return `${user.displayName}`;
    }
    return user.email || "Unknown User";
  }
}
