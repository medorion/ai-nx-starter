import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoggerService } from './core/services/logger.service';
import { MessageService } from './core/services/message.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UiAppContextService } from './core/services/ui-app-context.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  showLayout = true;

  constructor(
    private readonly uiAppContextService: UiAppContextService,
    private readonly logger: LoggerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize the UI app context and subscribe to handle the response
    this.messageService.initializeHttpErrorHandling();

    this.subscription = this.uiAppContextService.error$.subscribe((error) => {
      // Initial value is null
      if (error) {
        this.logger.error(`Application error, ${error}`);
        this.messageService.error(`Application error, ${error}`);
      }
    });

    // Hide header/footer on login and redirecting-to-login pages
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const hideLayoutRoutes = ['/login', '/redirecting-to-login'];
      this.showLayout = !hideLayoutRoutes.includes(event.urlAfterRedirects);
    });

    // Set initial state
    const hideLayoutRoutes = ['/login', '/redirecting-to-login'];
    this.showLayout = !hideLayoutRoutes.includes(this.router.url);

    // Mainly used for dev mode
    this.uiAppContextService.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
