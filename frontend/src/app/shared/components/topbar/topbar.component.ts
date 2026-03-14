import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  constructor(public auth: AuthService, private sidebarSvc: SidebarService) {}

  toggleSidebar(): void { this.sidebarSvc.toggle(); }

  get initials(): string {
    const a = this.auth.auth;
    return a ? `${a.firstName[0]}${a.lastName[0]}` : 'U';
  }
  get title(): string { return ''; }
  get roleLabel(): string {
    const m: any = { PROJECT_MANAGER:'Project Manager', DEPARTMENT_HEAD:'Dept Head', TEAM_LEAD:'Team Lead', EMPLOYEE:'Employee' };
    return m[this.auth.userRole] || this.auth.userRole;
  }
}
