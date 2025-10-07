import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-page-not-found",
  standalone: false,
  templateUrl: "./page-not-found.component.html",
  styleUrl: "./page-not-found.component.less",
})
export class PageNotFoundComponent {
  constructor(private readonly router: Router) {}

  goHome(): void {
    // navigate default route not backoffice
    this.router.navigate(["/"]);
  }
}
