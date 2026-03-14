import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TeamService, DepartmentService, UserService } from '../../core/services/api.services';
import { Team, Department, User } from '../../core/models';

@Component({ selector: 'app-teams', templateUrl: './teams.component.html' })
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  departments: Department[] = [];
  // Users shown in the lead picker — changes based on selected dept
  leadCandidates: User[] = [];
  loading = true;
  showForm = false;
  showDelConfirm = false;
  formMode: 'create' | 'edit' = 'create';
  selected: Team | null = null;
  saving = false;
  form: any = { name: '', departmentId: null, teamLeadId: null, description: '' };

  constructor(public auth: AuthService, private teamService: TeamService,
    private deptService: DepartmentService, private userService: UserService) {}

  ngOnInit(): void {
    this.load();
    this.deptService.getAll().subscribe(r => { if (r.success) this.departments = r.data; });
  }

  load(): void {
    this.loading = true;
    const obs = this.auth.isDeptHead
      ? this.teamService.getByDept(this.auth.deptId)
      : this.teamService.getAll();
    obs.subscribe(r => {
      if (r.success) this.teams = r.data;
      this.loading = false;
    });
  }

  // When dept changes in the form, reload the lead candidates from that dept
  onDeptChange(): void {
    this.form.teamLeadId = null;
    this.loadLeadCandidates(this.form.departmentId);
  }

  loadLeadCandidates(deptId: number | null): void {
    if (!deptId) {
      // No dept selected — show all approved non-PM users
      this.userService.getAll().subscribe(r => {
        if (r.success) this.leadCandidates = r.data.filter(u =>
          u.approvalStatus === 'APPROVED' && u.role !== 'PROJECT_MANAGER');
      });
    } else {
      // Show all approved users in that dept
      this.userService.getByDept(deptId).subscribe(r => {
        if (r.success) this.leadCandidates = r.data.filter(u => u.approvalStatus === 'APPROVED');
      });
    }
  }

  openCreate(): void {
    this.formMode = 'create';
    this.form = {
      name: '', description: '',
      departmentId: this.auth.isDeptHead ? this.auth.deptId : null,
      teamLeadId: null
    };
    this.loadLeadCandidates(this.form.departmentId);
    this.showForm = true;
  }

  openEdit(t: Team): void {
    this.formMode = 'edit';
    this.selected = t;
    this.form = {
      name: t.name,
      description: t.description || '',
      departmentId: t.department?.id || null,
      teamLeadId: t.teamLead?.id || null
    };
    // Load all users from this team's dept as lead candidates
    this.loadLeadCandidates(this.form.departmentId);
    this.showForm = true;
  }

  save(): void {
    if (!this.form.name) return;
    this.saving = true;
    const payload = { ...this.form };
    const obs = this.formMode === 'create'
      ? this.teamService.create(payload)
      : this.teamService.update(this.selected!.id, payload);
    obs.subscribe(r => {
      this.saving = false;
      if (r.success) { this.showForm = false; this.load(); }
    });
  }

  confirmDelete(t: Team): void { this.selected = t; this.showDelConfirm = true; }
  doDelete(): void {
    this.teamService.delete(this.selected!.id).subscribe(r => {
      if (r.success) { this.showDelConfirm = false; this.load(); }
    });
  }

  getDeptName(t: Team): string { return t.department?.name || '—'; }
  getLeadName(t: Team): string {
    return t.teamLead ? `${t.teamLead.firstName} ${t.teamLead.lastName}` : 'Unassigned';
  }
}
