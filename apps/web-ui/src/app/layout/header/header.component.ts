import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ClientUserDto, IdCodeNameDto, IdNameDto } from '@ai-nx-starter/types';
import { MessageService } from '../../core/services/message.service';
import { UiAppContextService } from '../../core/services/ui-app-context.service';
import { AuthService } from '../../core/services/auth.service';
interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.less',
})
export class HeaderComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private destroy$ = new Subject<void>();

  // Store solutions data for breadcrumb lookup
  private solutions: IdNameDto[] = [];

  // Observables for template
  currentUser$: Observable<ClientUserDto | null>;
  isLoading$: Observable<boolean>;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messageService: MessageService,
    private readonly uiAppContextService: UiAppContextService,
    private readonly authService: AuthService,
  ) {
    // Initialize observables
    this.currentUser$ = this.uiAppContextService.currentUser$;
    this.isLoading$ = this.uiAppContextService.isLoading$;
  }

  ngOnInit(): void {
    // Listen to route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
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
    let url = '';

    // Traverse the route tree to build breadcrumbs
    while (route) {
      if (route.snapshot.url.length > 0) {
        const routeUrl = route.snapshot.url.map((segment) => segment.path).join('/');
        url += '/' + routeUrl;

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
  }

  private getBreadcrumbData(route: ActivatedRoute, routeUrl: string): { label: string; isLast: boolean } | null {
    // Check if this is the last route in the chain
    const isLast = !route.firstChild || route.firstChild.snapshot.url.length === 0;

    // Get label from route data first, then fallback to path mapping
    let label = route.snapshot.data['breadcrumb'];

    // Handle solutions route - override label for specific solution IDs
    const currentUrl = this.router.url;
    const isSolutionRoute = currentUrl.startsWith('/solutions/') && routeUrl !== 'solutions';

    // Check if this is a solution ID route (regardless of existing label)
    if (isSolutionRoute && route.parent?.snapshot.url[0]?.path === 'solutions') {
      // This is a solution ID route - find the solution name
      const solutionId = routeUrl;
      const solution = this.solutions.find((s) => s.id === solutionId);
      if (solution) {
        label = solution.name; // Override the "Solutions" label with actual solution name
      }
    }
    return label ? { label, isLast } : null;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/redirecting-to-login']);
  }
}
