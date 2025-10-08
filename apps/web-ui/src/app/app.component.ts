import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { LoggerService } from './core/services/logger.service';
import { MessageService } from './core/services/message.service';
import { UI_APP_CONTEXT, UIAppContext } from './core/intefaces/ui-app-context.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(
    @Inject(UI_APP_CONTEXT) private readonly uiAppContextService: UIAppContext,
    private readonly logger: LoggerService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Initialize the UI app context and subscribe to handle the response
    this.messageService.initializeHttpErrorHandling();
    // Mainly used for dev mode
    this.uiAppContextService.init();

    this.subscription = this.uiAppContextService.error$.subscribe((error) => {
      // Initial value is null
      if (error) {
        this.logger.error(`Application error, ${error}`);
        this.messageService.error(`Application error, ${error}`);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
