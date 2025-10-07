import { Component, signal, OnInit, Inject } from "@angular/core";
import { UIAppContextService } from "./core/services/ui-app-context.service";
import { LoggerService } from "./core/services/logger.service";
import { MessageService } from "./core/services/message.service";
import {
  UI_APP_CONTEXT,
  UIAppContext,
} from "./core/intefaces/ui-app-context.interface";

@Component({
  selector: "app-root",
  standalone: false,
  templateUrl: "./app.html",
  styleUrl: "./app.less",
})
export class AppComponent implements OnInit {
  protected readonly title = signal("example-app");

  constructor(
    @Inject(UI_APP_CONTEXT) private readonly uiAppContextService: UIAppContext,
    private readonly logger: LoggerService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Initialize the UI app context and subscribe to handle the response
    this.messageService.initializeHttpErrorHandling();
    // Mainly used for dev modeß
    this.uiAppContextService.init();
    // this.uiAppContextService.init().subscribe({
    //   next: (_context) => {
    //     this.logger.info(
    //       "Medorion started succesfully.UI App Context initialized"
    //     );
    //   },
    //   error: (error) => {
    //     this.logger.error("Failed to initialize UI App Context:", error);
    //     this.messageService.error("Failed to initialize UI App Context");
    //   },
    // });
  }
}
