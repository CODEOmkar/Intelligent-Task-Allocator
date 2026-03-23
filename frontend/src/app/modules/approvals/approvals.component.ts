import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html'
})
export class ApprovalsComponent implements OnInit {
  pending: User[] = [];
  loading = true;
  processing: number | null = null;
  showApproveConfirm = false;
  showRejectConfirm = false;
  selectedUser: User | null = null;

  constructor(public auth: AuthService, private userService: UserService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getPending().subscribe(r => {
      if (r.success) this.pending = r.data;
      this.loading = false;
    });
  }

  confirmApprove(user: User): void {
    this.selectedUser = user;
    this.showApproveConfirm = true;
  }

  confirmReject(user: User): void {
    this.selectedUser = user;
    this.showRejectConfirm = true;
  }

  approve(): void {
    if (!this.selectedUser) return;
    this.processing = this.selectedUser.id;
    this.userService.approve(this.selectedUser.id).subscribe({
      next: r => {
        this.processing = null;
        this.showApproveConfirm = false;
        if (r.success) {
          this.pending = this.pending.filter(u => u.id !== this.selectedUser!.id);
          this.userService.pendingCountChanged.next();
          this.toast.showSuccess(`Successfully approved ${this.selectedUser!.firstName} ${this.selectedUser!.lastName}`);
          this.selectedUser = null;
        } else {
          this.toast.showError(r.message || 'Failed to approve user');
        }
      },
      error: err => {
        this.processing = null;
        this.showApproveConfirm = false;
        this.toast.showError(err.error?.message || 'Error approving user');
      }
    });
  }

  reject(): void {
    if (!this.selectedUser) return;
    this.processing = this.selectedUser.id;
    this.userService.reject(this.selectedUser.id).subscribe({
      next: r => {
        this.processing = null;
        this.showRejectConfirm = false;
        if (r.success) {
          this.pending = this.pending.filter(u => u.id !== this.selectedUser!.id);
          this.userService.pendingCountChanged.next();
          this.toast.showSuccess(`Successfully rejected ${this.selectedUser!.firstName} ${this.selectedUser!.lastName}`);
          this.selectedUser = null;
        } else {
          this.toast.showError(r.message || 'Failed to reject user');
        }
      },
      error: err => {
        this.processing = null;
        this.showRejectConfirm = false;
        this.toast.showError(err.error?.message || 'Error rejecting user');
      }
    });
  }

  formatRole(r: string): string {
    const m: any = { PROJECT_MANAGER:'Project Manager', DEPARTMENT_HEAD:'Dept Head', TEAM_LEAD:'Team Lead', EMPLOYEE:'Employee' };
    return m[r] || r;
  }
}
