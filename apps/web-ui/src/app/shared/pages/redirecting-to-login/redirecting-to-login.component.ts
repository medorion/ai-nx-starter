import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirecting-to-login',
  standalone: false,
  templateUrl: './redirecting-to-login.component.html',
  styleUrl: './redirecting-to-login.component.less',
})
export class RedirectingToLoginComponent implements OnInit, OnDestroy {
  countdown = 15;
  private intervalId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        clearInterval(this.intervalId);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  redirectNow(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.router.navigate(['/login']);
  }
}
