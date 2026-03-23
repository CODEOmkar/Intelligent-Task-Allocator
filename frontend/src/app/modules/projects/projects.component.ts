import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/api.services';
import { Project } from '../../core/models';

@Component({ selector: 'app-projects', templateUrl: './projects.component.html' })
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filtered: Project[] = [];
  loading = true;
  searchTerm = '';
  filterStatus = '';
  showForm = false;
  showDelConfirm = false;
  selected: Project | null = null;
  editForm: any = {};
  formMode: 'create' | 'edit' = 'create';
  get today(): string { return new Date().toISOString().split('T')[0]; }

  constructor(public auth: AuthService, private projectService: ProjectService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.projectService.getAll().subscribe(r => {
      if (r.success) { this.projects = r.data; this.applyFilters(); }
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filtered = this.projects.filter(p => {
      const matchSearch = !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  openCreate(): void {
    this.formMode = 'create';
    this.editForm = { name: '', description: '', status: 'PLANNING', priority: 'MEDIUM', startDate: '', deadline: '' };
    this.showForm = true;
  }

  openEdit(p: Project): void {
    this.formMode = 'edit';
    this.selected = p;
    this.editForm = { name: p.name, description: p.description || '', status: p.status, priority: p.priority, startDate: p.startDate || '', deadline: p.deadline || '' };
    this.showForm = true;
  }

  save(): void {
    if (!this.editForm.name) return;
    const payload = { ...this.editForm, createdById: this.auth.userId };
    const obs = this.formMode === 'create' ? this.projectService.create(payload) : this.projectService.update(this.selected!.id, payload);
    obs.subscribe(r => { if (r.success) { this.showForm = false; this.load(); } });
  }

  confirmDelete(p: Project): void { this.selected = p; this.showDelConfirm = true; }

  doDelete(): void {
    this.projectService.delete(this.selected!.id).subscribe(r => {
      if (r.success) { this.showDelConfirm = false; this.load(); }
    });
  }

  getBadge(s: string): string {
    const m: any = { PLANNING:'badge-blue', ACTIVE:'badge-green', ON_HOLD:'badge-yellow', COMPLETED:'badge-gray', CANCELLED:'badge-red' };
    return m[s] || 'badge-gray';
  }

  getPrBadge(s: string): string {
    const m: any = { LOW:'badge-gray', MEDIUM:'badge-blue', HIGH:'badge-yellow', CRITICAL:'badge-red' };
    return m[s] || 'badge-gray';
  }
}
