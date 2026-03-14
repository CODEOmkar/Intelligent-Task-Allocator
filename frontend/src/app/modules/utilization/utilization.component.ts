import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/api.services';
import { UtilizationDTO } from '../../core/models';

@Component({
  selector: 'app-utilization',
  templateUrl: './utilization.component.html'
})
export class UtilizationComponent implements OnInit {
  metrics: UtilizationDTO[] = [];
  filtered: UtilizationDTO[] = [];
  loading = true;
  filterStatus = '';
  searchTerm = '';

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const obs = this.auth.isPM ? this.userService.getAllUtilization()
      : this.auth.isDeptHead ? this.userService.getDeptUtilization(this.auth.deptId)
      : this.userService.getTeamUtilization(this.auth.teamId);
    obs.subscribe(r => {
      if (r.success) { this.metrics = r.data; this.applyFilters(); }
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.metrics];
    if (this.filterStatus) result = result.filter(u => u.utilizationStatus === this.filterStatus);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(t) || (u.teamName || '').toLowerCase().includes(t));
    }
    this.filtered = result;
  }

  get underutilized(): number { return this.metrics.filter(u => u.utilizationStatus === 'UNDERUTILIZED').length; }
  get optimal(): number { return this.metrics.filter(u => u.utilizationStatus === 'OPTIMAL').length; }
  get overloaded(): number { return this.metrics.filter(u => u.utilizationStatus === 'OVERLOADED').length; }

  getUtilClass(s: string): string {
    return s === 'OVERLOADED' ? 'overload' : s === 'OPTIMAL' ? 'optimal' : 'underutil';
  }
  getBarWidth(pct: number): string { return Math.min(pct, 100) + '%'; }
}
