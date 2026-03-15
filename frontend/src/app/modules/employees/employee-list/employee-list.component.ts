import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/api.services';
import { User } from '../../../core/models';

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

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const obs = this.auth.isDeptHead ? this.userService.getByDept(this.auth.deptId)
      : this.auth.isTeamLead ? this.userService.getByTeam(this.auth.teamId)
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
