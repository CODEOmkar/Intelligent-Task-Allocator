import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/api.services';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({ selector: 'app-sidebar', templateUrl: './sidebar.component.html' })
export class SidebarComponent implements OnInit, OnDestroy {
  currentRoute = '';
  pendingCount = 0;
  isOpen = false;
  private sub = new Subscription();

  navSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', icon: '⊞', route: '/dashboard', roles: [] as string[] }
      ]
    },
    {
      title: 'Work',
      items: [
        { label: 'My Tasks', icon: '✓', route: '/my-tasks', roles: ['EMPLOYEE'] },
        { label: 'Tasks', icon: '✓', route: '/tasks', roles: ['PROJECT_MANAGER', 'DEPARTMENT_HEAD', 'TEAM_LEAD'] },
        { label: 'Projects', icon: '◈', route: '/projects', roles: [] as string[] },
      ]
    },
    {
      title: 'People',
      items: [
        { label: 'Employees', icon: '◉', route: '/employees', roles: [] as string[] },
        { label: 'Utilization', icon: '◎', route: '/utilization', roles: ['PROJECT_MANAGER', 'DEPARTMENT_HEAD', 'TEAM_LEAD'] },
        { label: 'Teams', icon: '⬡', route: '/teams', roles: ['PROJECT_MANAGER', 'DEPARTMENT_HEAD'] },
        { label: 'Departments', icon: '⬢', route: '/departments', roles: ['PROJECT_MANAGER'] },
      ]
    },
    {
      title: 'Admin',
      items: [
        { label: 'Approvals', icon: '✓', route: '/approvals', roles: ['PROJECT_MANAGER'], badge: true },
        { label: 'Skills', icon: '◆', route: '/skills', roles: ['PROJECT_MANAGER'] },
      ]
    }
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService,
    private sidebarSvc: SidebarService
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.sub.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.currentRoute = e.urlAfterRedirects;
      })
    );
    this.sub.add(
      this.sidebarSvc.open$.subscribe(open => this.isOpen = open)
    );
    if (this.auth.isPM) {
      this.loadPendingCount();
      this.sub.add(
        this.userService.pendingCountChanged.subscribe(() => this.loadPendingCount())
      );
    }
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  loadPendingCount(): void {
    this.userService.getPending().subscribe(r => {
      if (r.success) this.pendingCount = r.data.length;
    });
  }

  getSections() {
    return this.navSections.map(s => ({
      ...s,
      items: s.items.filter((i: any) => !i.roles.length || this.auth.hasRole(...i.roles))
    })).filter(s => s.items.length > 0);
  }

  onNavClick(): void { this.sidebarSvc.close(); }
  close(): void { this.sidebarSvc.close(); }
  isActive(route: string): boolean { return this.currentRoute.startsWith(route); }

  get initials(): string {
    const a = this.auth.auth;
    return a ? (a.firstName[0] + a.lastName[0]).toUpperCase() : 'U';
  }

  get displayName(): string {
    const a = this.auth.auth;
    return a ? `${a.firstName} ${a.lastName}` : '';
  }

  get roleLabel(): string {
    const m: any = { PROJECT_MANAGER: 'Project Manager', DEPARTMENT_HEAD: 'Dept Head', TEAM_LEAD: 'Team Lead', EMPLOYEE: 'Employee' };
    return m[this.auth.userRole] || this.auth.userRole;
  }

  goToProfile(): void { this.router.navigate(['/employees', this.auth.userId]); }
  logout(): void { this.auth.logout(); }
}
