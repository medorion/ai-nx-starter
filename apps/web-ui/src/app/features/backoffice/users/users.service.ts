import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { finalize } from "rxjs/operators";
import { ApiUsersService } from "@medorion/api-client";
import { ClientUserDto, ResetPasswordDto } from "@medorion/types";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(private readonly apiUsersService: ApiUsersService) {}

  getUsers(): Observable<ClientUserDto[]> {
    this._loading$.next(true);
    return this.apiUsersService
      .getUsers()
      .pipe(finalize(() => this._loading$.next(false)));
  }

  resetPassword(email: string): Observable<void> {
    this._loading$.next(true);
    const resetPasswordDto: ResetPasswordDto = { email };
    return this.apiUsersService
      .resetUserPassword(resetPasswordDto)
      .pipe(finalize(() => this._loading$.next(false)));
  }
}
