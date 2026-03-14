import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService, TaskService, UserService } from '../../core/services/api.services';
import { Project, Task, TaskAssignment, UtilizationDTO } from '../../core/models';

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  loading = true;
  projects: Project[] = [];
  tasks: Task[] = [];
  myAssignments: TaskAssignment[] = [];
  utilization: UtilizationDTO[] = [];

  stats = { totalProjects: 0, activeProjects: 0, totalTasks: 0, pendingTasks: 0, completedTasks: 0, totalEmployees: 0, optimalEmployees: 0, overloadedEmployees: 0 };

  constructor(
    public auth: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    let loaded = 0;
    const done = () => { if (++loaded >= 3) this.loading = false; };

    this.projectService.getActive().subscribe(r => {
      if (r.success) {
        this.projects = r.data.slice(0, 5);
        this.stats.totalProjects = r.data.length;
        this.stats.activeProjects = r.data.filter(p => p.status === 'ACTIVE').length;
      }
      done();
    }, () => done());

    // Load ALL tasks (not sliced) — the template slices to 5 for display
    this.taskService.getForMe().subscribe(r => {
      if (r.success) {
        this.tasks = r.data; // keep all, template uses slice pipe for display
        this.stats.totalTasks = r.data.length;
        this.stats.pendingTasks = r.data.filter(t => t.status === 'PENDING').length;
        this.stats.completedTasks = r.data.filter(t => t.status === 'COMPLETED').length;
      }
      done();
    }, () => done());

    if (this.auth.isEmployee) {
      this.taskService.getMyAssignments().subscribe(r => {
        if (r.success) this.myAssignments = r.data.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS');
        done();
      }, () => done());
    } else {
      const utilObs = this.auth.isPM ? this.userService.getAllUtilization()
        : this.auth.isDeptHead ? this.userService.getDeptUtilization(this.auth.deptId)
        : this.userService.getTeamUtilization(this.auth.teamId);

      utilObs.subscribe(r => {
        if (r.success) {
          this.utilization = r.data.slice(0, 6);
          this.stats.totalEmployees = r.data.length;
          this.stats.optimalEmployees = r.data.filter(u => u.utilizationStatus === 'OPTIMAL').length;
          this.stats.overloadedEmployees = r.data.filter(u => u.utilizationStatus === 'OVERLOADED').length;
        }
        done();
      }, () => done());
    }
  }

  getProjectBadge(s: string): string {
    const m: any = { PLANNING:'badge-blue', ACTIVE:'badge-green', ON_HOLD:'badge-yellow', COMPLETED:'badge-gray', CANCELLED:'badge-red' };
    return m[s] || 'badge-gray';
  }
  getTaskBadge(s: string): string {
    const m: any = { PENDING:'badge-yellow', IN_PROGRESS:'badge-blue', REVIEW:'badge-purple', COMPLETED:'badge-green', CANCELLED:'badge-gray' };
    return m[s] || 'badge-gray';
  }
  getUtilClass(status: string): string {
    return status === 'OVERLOADED' ? 'overload' : status === 'OPTIMAL' ? 'optimal' : 'underutil';
  }
  getUtilBarWidth(pct: number): string { return Math.min(pct, 100) + '%'; }
}
