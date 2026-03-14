import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/api.services';
import { TaskAssignment } from '../../../core/models';

@Component({ selector: 'app-my-tasks', templateUrl: './my-tasks.component.html' })
export class MyTasksComponent implements OnInit {
  assignments: TaskAssignment[] = [];
  loading = true;
  saving: number | null = null;
  progressMap: Record<number, number> = {};
  filterStatus = '';

  constructor(public auth: AuthService, private taskService: TaskService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.taskService.getMyAssignments().subscribe(r => {
      if (r.success) {
        this.assignments = r.data;
        r.data.forEach(a => { this.progressMap[a.id] = a.completionPercentage ?? 0; });
      }
      this.loading = false;
    });
  }

  get filtered(): TaskAssignment[] {
    if (!this.filterStatus) return this.assignments;
    return this.assignments.filter(a => a.status === this.filterStatus);
  }

  get active(): TaskAssignment[] { return this.assignments.filter(a => a.status !== 'COMPLETED' && a.status !== 'REMOVED'); }
  get completed(): TaskAssignment[] { return this.assignments.filter(a => a.status === 'COMPLETED'); }

  saveProgress(a: TaskAssignment): void {
    const pct = this.progressMap[a.id] ?? 0;
    this.saving = a.id;
    this.taskService.updateProgress(a.id, this.auth.userId, pct).subscribe({
      next: r => {
        this.saving = null;
        if (r.success) {
          const idx = this.assignments.findIndex(x => x.id === a.id);
          if (idx !== -1) { this.assignments[idx] = r.data; }
          if (pct >= 100) this.load();
        }
      },
      error: () => { this.saving = null; }
    });
  }

  getStatusBadge(s: string): string {
    const m: any = { ASSIGNED:'badge-yellow', IN_PROGRESS:'badge-blue', COMPLETED:'badge-green', REMOVED:'badge-gray' };
    return m[s] || 'badge-gray';
  }
  getPriorityBadge(s: string): string {
    const m: any = { LOW:'badge-gray', MEDIUM:'badge-blue', HIGH:'badge-yellow', CRITICAL:'badge-red' };
    return m[s] || 'badge-gray';
  }
  progressColor(pct: number): string {
    if (pct >= 100) return 'var(--success)';
    if (pct >= 70) return 'var(--accent)';
    if (pct >= 40) return 'var(--warning)';
    return 'var(--underutil)';
  }
}
