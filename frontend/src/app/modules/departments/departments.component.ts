import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService, UserService, TeamService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { Department, User, Team } from '../../core/models';

@Component({ selector: 'app-departments', templateUrl: './departments.component.html' })
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  // Head candidates — all users in that dept when editing, all non-PM users when creating
  headCandidates: User[] = [];
  teamMap: Record<number, Team[]> = {};
  loading = true;
  showForm = false;
  showDelConfirm = false;
  formMode: 'create' | 'edit' = 'create';
  selected: Department | null = null;
  saving = false;
  form: any = { name: '', description: '', headId: null };

  constructor(public auth: AuthService, private deptService: DepartmentService,
    private userService: UserService, private teamService: TeamService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.deptService.getAll().subscribe(r => {
      if (r.success) {
        this.departments = r.data;
        r.data.forEach(d => {
          this.teamService.getByDept(d.id).subscribe(tr => {
            if (tr.success) this.teamMap[d.id] = tr.data;
          });
        });
      }
      this.loading = false;
    });
  }

  getTeams(deptId: number): Team[] { return this.teamMap[deptId] || []; }

  loadHeadCandidates(deptId: number | null): void {
    if (deptId) {
      // Show all approved users already in that department
      this.userService.getByDept(deptId).subscribe(r => {
        if (r.success) this.headCandidates = r.data.filter(u => u.approvalStatus === 'APPROVED');
      });
    } else {
      // New dept: show all approved non-PM users
      this.userService.getAll().subscribe(r => {
        if (r.success) this.headCandidates = r.data.filter(u =>
          u.approvalStatus === 'APPROVED' && u.role !== 'PROJECT_MANAGER');
      });
    }
  }

  openCreate(): void {
    this.formMode = 'create';
    this.form = { name: '', description: '', headId: null };
    this.loadHeadCandidates(null);
    this.showForm = true;
  }

  openEdit(d: Department): void {
    this.formMode = 'edit';
    this.selected = d;
    this.form = { name: d.name, description: d.description || '', headId: d.head?.id || null };
    // Load all people in this dept so any can be made head
    this.loadHeadCandidates(d.id);
    this.showForm = true;
  }

  save(): void {
    if (!this.form.name) return;
    this.saving = true;
    const obs = this.formMode === 'create'
      ? this.deptService.create(this.form)
      : this.deptService.update(this.selected!.id, this.form);
    obs.subscribe({
      next: r => {
        this.saving = false;
        if (r.success) { 
          this.showForm = false; this.load(); 
          this.toast.showSuccess(this.formMode === 'create' ? 'Department created successfully' : 'Department updated successfully');
        } else { this.toast.showError(r.message || 'Failed to save department'); }
      },
      error: err => { this.saving = false; this.toast.showError(err.error?.message || 'Error saving department'); }
    });
  }

  confirmDelete(d: Department): void { this.selected = d; this.showDelConfirm = true; }
  doDelete(): void {
    this.deptService.delete(this.selected!.id).subscribe({
      next: r => {
        if (r.success) { 
          this.showDelConfirm = false; this.load(); 
          this.toast.showSuccess('Department deleted successfully');
        } else { this.toast.showError(r.message || 'Failed to delete department'); }
      },
      error: err => this.toast.showError(err.error?.message || 'Error deleting department')
    });
  }
}
