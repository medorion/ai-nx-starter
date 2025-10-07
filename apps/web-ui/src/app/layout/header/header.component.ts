import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { Subject, Observable } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import {
  UI_APP_CONTEXT,
  UIAppContext,
} from "../../core/intefaces/ui-app-context.interface";
import { ClientUserDto, IdCodeNameDto, IdNameDto } from "@medorion/types";

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: "app-header",
  standalone: false,
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.less",
})
export class HeaderComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private destroy$ = new Subject<void>();

  // Store solutions data for breadcrumb lookup
  private solutions: IdNameDto[] = [];

  // Observables for template
  currentUser$: Observable<ClientUserDto | null>;
  currentOrganization$: Observable<IdCodeNameDto | null>;
  availableSolutions$: Observable<IdNameDto[]>;
  isLoading$: Observable<boolean>;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    @Inject(UI_APP_CONTEXT) private readonly uiAppContextService: UIAppContext
  ) {
    // Initialize observables
    this.currentUser$ = this.uiAppContextService.currentUser$;
    this.currentOrganization$ = this.uiAppContextService.currentOrganization$;
    this.availableSolutions$ = this.uiAppContextService.availableSolutions$;
    this.isLoading$ = this.uiAppContextService.isLoading$;
  }

  ngOnInit(): void {
    // Subscribe to solutions data for breadcrumb lookup
    this.availableSolutions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((solutions) => {
        this.solutions = solutions;
        this.buildBreadcrumbs(); // Rebuild breadcrumbs when solutions change
      });

    // Listen to route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.buildBreadcrumbs();
      });

    // Build initial breadcrumbs
    this.buildBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildBreadcrumbs(): void {
    this.breadcrumbs = [];
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let url = "";

    // Always start with Home
    this.breadcrumbs.push({ label: "Home", url: "/" });

    // Traverse the route tree to build breadcrumbs
    while (route) {
      if (route.snapshot.url.length > 0) {
        const routeUrl = route.snapshot.url
          .map((segment) => segment.path)
          .join("/");
        url += "/" + routeUrl;

        // Get breadcrumb data from route configuration
        const breadcrumbData = this.getBreadcrumbData(route, routeUrl);
        if (breadcrumbData) {
          this.breadcrumbs.push({
            label: breadcrumbData.label,
            url: breadcrumbData.isLast ? undefined : url,
          });
        }
      }

      // Move to the first child route
      route = route.firstChild;
    }

    // Handle special case for empty route (redirects to examples)
    if (this.router.url === "/" || this.router.url === "") {
      this.breadcrumbs.push({ label: "Examples", url: "/examples" });
      this.breadcrumbs.push({ label: "Shell" });
    }
  }

  private getBreadcrumbData(
    route: ActivatedRoute,
    routeUrl: string
  ): { label: string; isLast: boolean } | null {
    // Check if this is the last route in the chain
    const isLast =
      !route.firstChild || route.firstChild.snapshot.url.length === 0;

    // Get label from route data first, then fallback to path mapping
    let label = route.snapshot.data["breadcrumb"];

    // Handle solutions route - override label for specific solution IDs
    const currentUrl = this.router.url;
    const isSolutionRoute =
      currentUrl.startsWith("/solutions/") && routeUrl !== "solutions";

    // Check if this is a solution ID route (regardless of existing label)
    if (
      isSolutionRoute &&
      route.parent?.snapshot.url[0]?.path === "solutions"
    ) {
      // This is a solution ID route - find the solution name
      const solutionId = routeUrl;
      const solution = this.solutions.find((s) => s.id === solutionId);
      if (solution) {
        label = solution.name; // Override the "Solutions" label with actual solution name
      }
    }

    // If no label found and this is examples root, check if it's shell
    if (!label && routeUrl === "examples" && isLast) {
      label = "Shell"; // Default component for examples root
    }

    return label ? { label, isLast } : null;
  }

  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  logout(): void {
    this.uiAppContextService.logOut();
  }
}
