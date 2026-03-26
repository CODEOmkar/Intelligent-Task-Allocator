import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, TeamService } from '../../../core/services/api.services';
import { ToastService } from '../../../core/services/toast.service';
import { User, Team } from '../../../core/models';

@Component({ selector: 'app-employee-list', templateUrl: './employee-list.component.html' })
export class EmployeeListComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  loading = true;
  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  currentPage = 1;
  pageSize = 5;

  showDelConfirm = false;
  showTeamModal = false;
  teams: Team[] = [];
  targetTeamId: number = 0;
  selectedUser: User | null = null;

  constructor(
    public auth: AuthService, 
    private userService: UserService, 
    private teamService: TeamService,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    // PM sees everyone; DeptHead sees their dept; TeamLead + Employee see their team only
    if (this.auth.isEmployee && !this.auth.teamId) {
      this.users = []; this.filtered = []; this.loading = false; return;
    }
    const obs = this.auth.isDeptHead ? this.userService.getByDept(this.auth.deptId)
      : (this.auth.isTeamLead || this.auth.isEmployee) ? this.userService.getByTeam(this.auth.teamId)
      : this.userService.getAll();
    obs.subscribe(r => {
      if (r.success) { this.users = r.data; this.applyFilters(); }
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.users];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u => u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    if (this.filterRole) result = result.filter(u => u.role === this.filterRole);
    if (this.filterStatus) result = result.filter(u => u.approvalStatus === this.filterStatus);
    this.filtered = result;
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  get paginated(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filtered.length) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  confirmDelete(u: User): void { this.selectedUser = u; this.showDelConfirm = true; }
  doDelete(): void {
    if (!this.selectedUser) return;
    this.userService.delete(this.selectedUser.id).subscribe({
      next: r => {
        if (r.success) {
          this.showDelConfirm = false;
          this.toast.showSuccess(`${this.selectedUser!.firstName} ${this.selectedUser!.lastName} removed successfully`);
          this.selectedUser = null;
          this.load();
        } else { this.toast.showError(r.message || 'Failed to remove user'); }
      },
      error: err => this.toast.showError(err.error?.message || 'Error removing user')
    });
  }

  openTeamModal(u: User): void {
    this.selectedUser = u;
    this.targetTeamId = u.team?.id || 0;
    this.showTeamModal = true;
    
    // Fetch teams for the current department (if manager)
    const deptId = u.department?.id || (this.auth.isDeptHead ? this.auth.deptId : 0);
    if (deptId) {
      this.teamService.getByDept(deptId).subscribe(r => {
        if (r.success) this.teams = r.data;
      });
    } else {
      this.teamService.getAll().subscribe(r => {
        if (r.success) this.teams = r.data;
      });
    }
  }

  doAssignTeam(): void {
    if (!this.selectedUser) return;
    this.userService.update(this.selectedUser.id, { teamId: this.targetTeamId || null }).subscribe({
      next: r => {
        if (r.success) {
          this.showTeamModal = false;
          this.toast.showSuccess(`Team updated for ${this.selectedUser!.firstName}`);
          this.selectedUser = null;
          this.load();
        } else { this.toast.showError(r.message || 'Failed to update team'); }
      },
      error: err => this.toast.showError(err.error?.message || 'Error updating team')
    });
  }

  getRoleBadge(r: string): string {
    const m: any = { PROJECT_MANAGER:'badge-purple', DEPARTMENT_HEAD:'badge-blue', TEAM_LEAD:'badge-yellow', EMPLOYEE:'badge-gray' };
    return m[r] || 'badge-gray';
  }
  getStatusBadge(s: string): string {
    const m: any = { APPROVED:'badge-green', PENDING:'badge-yellow', REJECTED:'badge-red' };
    return m[s] || 'badge-gray';
  }
  getUtilClass(u: User): string {
    const pct = u.maxCapacityHours ? ((u.allocatedHours || 0) / u.maxCapacityHours) * 100 : 0;
    return pct > 100 ? 'overload' : pct >= 70 ? 'optimal' : 'underutil';
  }
  getUtilPct(u: User): number {
    return u.maxCapacityHours ? Math.min(((u.allocatedHours || 0) / u.maxCapacityHours) * 100, 150) : 0;
  }
  formatRole(r: string): string {
    const m: any = { PROJECT_MANAGER:'Project Manager', DEPARTMENT_HEAD:'Dept Head', TEAM_LEAD:'Team Lead', EMPLOYEE:'Employee' };
    return m[r] || r;
  }
}
