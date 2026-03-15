import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/api.services';
import { User } from '../../core/models';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html'
})
export class ApprovalsComponent implements OnInit {
  pending: User[] = [];
  loading = true;
  processing: number | null = null;

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getPending().subscribe(r => {
      if (r.success) this.pending = r.data;
      this.loading = false;
    });
  }

  approve(user: User): void {
    this.processing = user.id;
    this.userService.approve(user.id).subscribe(r => {
      this.processing = null;
      if (r.success) {
        this.pending = this.pending.filter(u => u.id !== user.id);
        this.userService.pendingCountChanged.next();
      }
    });
  }

  reject(user: User): void {
    this.processing = user.id;
    this.userService.reject(user.id).subscribe(r => {
      this.processing = null;
      if (r.success) {
        this.pending = this.pending.filter(u => u.id !== user.id);
        this.userService.pendingCountChanged.next();
      }
    });
  }

  formatRole(r: string): string {
    const m: any = { PROJECT_MANAGER:'Project Manager', DEPARTMENT_HEAD:'Dept Head', TEAM_LEAD:'Team Lead', EMPLOYEE:'Employee' };
    return m[r] || r;
  }
}
