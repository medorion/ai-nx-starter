import { Component, signal, OnInit } from '@angular/core';
import { UIAppContextService } from './core/services/ui-app-context.service';
import { LoggerService } from './core/services/logger.service';
import { MessageService } from './core/services/message.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.less',
})
export class App implements OnInit {
  protected readonly title = signal('example-app');

  constructor(
    private readonly uiAppContextService: UIAppContextService,
    private readonly logger: LoggerService,
    private readonly messageService: MessageService, // Initialize MessageService to set up HTTP error handling
  ) {}

  ngOnInit(): void {
    // Initialize the UI app context and subscribe to handle the response
    this.uiAppContextService.init().subscribe({
      next: (_context) => {
        this.logger.info('Medorion started succesfully.UI App Context initialized');
      },
      error: (error) => {
        this.logger.error('Failed to initialize UI App Context:', error);
      },
    });
  }
}
