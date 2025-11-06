import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirecting-to-login',
  standalone: false,
  templateUrl: './redirecting-to-login.component.html',
  styleUrl: './redirecting-to-login.component.less',
})
export class RedirectingToLoginComponent implements OnInit, OnDestroy {
  private timeoutId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.timeoutId = setTimeout(() => {
      this.router.navigate(['/login']);
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  redirectNow(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.router.navigate(['/login']);
  }
}
