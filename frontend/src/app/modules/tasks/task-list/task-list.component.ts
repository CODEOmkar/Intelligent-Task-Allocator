import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService, ProjectService, UserService, DepartmentService, TeamService, SkillService } from '../../../core/services/api.services';
import { ToastService } from '../../../core/services/toast.service';
import { Task, Project, User, Department, Team, Skill, TaskAssignment } from '../../../core/models';

@Component({ selector: 'app-task-list', templateUrl: './task-list.component.html' })
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filtered: Task[] = [];
  loading = true;
  searchTerm = ''; filterStatus = ''; filterPriority = '';

  // Create/Edit
  showForm = false;
  showDelConfirm = false;
  formMode: 'create' | 'edit' | 'subtask' = 'create';
  selected: Task | null = null;
  parentTask: Task | null = null;
  editForm: any = {};
  saving = false;
  get today(): string { return new Date().toISOString().split('T')[0]; }
  utilizationSummary = '';

  // Lists for dropdowns
  projects: Project[] = [];
  departments: Department[] = [];
  teams: Team[] = [];
  skills: Skill[] = [];
  filteredTeams: Team[] = [];

  // Assignment
  showAssign = false;
  assignTask: Task | null = null;
  taskAssignments: TaskAssignment[] = [];
  assignableUsers: User[] = [];
  assignNotes = '';

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private deptService: DepartmentService,
    private teamService: TeamService,
    private skillService: SkillService,
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
    this.projectService.getActive().subscribe(r => { if (r.success) this.projects = r.data; });
    this.deptService.getAll().subscribe(r => { if (r.success) this.departments = r.data; });
    this.teamService.getAll().subscribe(r => { if (r.success) this.teams = r.data; });
    this.skillService.getAll().subscribe(r => { if (r.success) this.skills = r.data; });
  }

  load(): void {
    this.loading = true;
    this.taskService.getForMe().subscribe(r => {
      if (r.success) { this.tasks = r.data; this.applyFilters(); }
      this.loading = false;
    }, () => this.loading = false);
  }

  applyFilters(): void {
    this.filtered = this.tasks.filter(t => {
      const s = this.searchTerm.toLowerCase();
      const matchSearch = !s || t.title.toLowerCase().includes(s) || (t.project?.name || '').toLowerCase().includes(s);
      const matchStatus = !this.filterStatus || t.status === this.filterStatus;
      const matchPriority = !this.filterPriority || t.priority === this.filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }

  // Parent tasks only (for display grouping)
  get parentTasks(): Task[] { return this.filtered.filter(t => !t.parentTask); }
  getSubTasks(parentId: number): Task[] { return this.filtered.filter(t => t.parentTask?.id === parentId); }

  openCreate(): void {
    this.formMode = 'create';
    this.parentTask = null;
    this.editForm = {
      title: '', description: '', projectId: null,
      // PM must pick a dept. Dept heads pre-fill theirs. Team leads shouldn't be creating top-level tasks.
      departmentId: this.auth.isDeptHead ? this.auth.deptId : null,
      teamId: null,
      status: 'PENDING', priority: 'MEDIUM', estimatedHours: 8,
      requiredEmployees: 1, dueDate: '', skillIds: [], parentTaskId: null
    };
    this.updateTeamsForDept();
    this.showForm = true;
  }

  openSubTask(parent: Task): void {
    this.formMode = 'subtask';
    this.parentTask = parent;
    this.editForm = {
      title: '', description: '',
      projectId: parent.project?.id || null,
      parentTaskId: parent.id,
      departmentId: parent.department?.id || (this.auth.isDeptHead ? this.auth.deptId : null),
      // Dept head creating sub-task must pick a team; team lead auto-fills their team
      teamId: this.auth.isTeamLead ? this.auth.teamId : null,
      status: 'PENDING', priority: parent.priority || 'MEDIUM',
      estimatedHours: 8, requiredEmployees: 1, dueDate: '', skillIds: []
    };
    this.updateTeamsForDept();
    this.showForm = true;
  }

  openEdit(t: Task): void {
    this.formMode = 'edit'; this.selected = t; this.parentTask = null;
    this.editForm = {
      title: t.title, description: t.description || '',
      projectId: t.project?.id || null,
      departmentId: t.department?.id || null,
      teamId: t.team?.id || null,
      status: t.status, priority: t.priority,
      estimatedHours: t.estimatedHours || 8,
      requiredEmployees: t.requiredEmployees || 1,
      dueDate: t.dueDate || '', skillIds: (t.requiredSkills || []).map(s => s.id),
      parentTaskId: t.parentTask?.id || null
    };
    this.updateTeamsForDept();
    this.fetchUtilizationSummary();
    this.showForm = true;
  }

  fetchUtilizationSummary(): void {
    const obs = this.auth.isDeptHead ? this.userService.getDeptUtilization(this.auth.deptId) :
                this.auth.isTeamLead ? this.userService.getTeamUtilization(this.auth.teamId) : null;
    if (obs) {
      obs.subscribe(r => {
        if (r.success) {
           const o = r.data.filter(u => u.utilizationStatus === 'OVERLOADED').length;
           const op = r.data.filter(u => u.utilizationStatus === 'OPTIMAL').length;
           const u = r.data.filter(u => u.utilizationStatus === 'UNDERUTILIZED').length;
           this.utilizationSummary = `Available Capacity: ${u} Underutilized, ${op} Optimal, ${o} Overloaded`;
        }
      });
    }
  }

  onDeptChange(): void {
    this.editForm.teamId = null;
    this.updateTeamsForDept();
  }

  updateTeamsForDept(): void {
    if (this.editForm.departmentId) {
      this.filteredTeams = this.teams.filter(t => t.department?.id === +this.editForm.departmentId);
    } else {
      this.filteredTeams = this.auth.isDeptHead
        ? this.teams.filter(t => t.department?.id === this.auth.deptId)
        : this.teams;
    }
  }

  toggleSkill(id: number): void {
    const idx = this.editForm.skillIds.indexOf(id);
    if (idx >= 0) this.editForm.skillIds.splice(idx, 1); else this.editForm.skillIds.push(id);
  }

  save(): void {
    if (!this.editForm.title) return;
    if (this.auth.isPM && this.formMode !== 'subtask' && !this.editForm.departmentId) {
      this.toast.showError('Please select a department to assign this task to.');
      return;
    }
    this.saving = true;
    const payload = {
      ...this.editForm,
      projectId: this.editForm.projectId ? +this.editForm.projectId : null,
      departmentId: this.editForm.departmentId ? +this.editForm.departmentId : null,
      // PM never sets team on top-level tasks
      teamId: (this.auth.isPM && this.formMode !== 'subtask') ? null
            : (this.editForm.teamId ? +this.editForm.teamId : null),
      parentTaskId: this.editForm.parentTaskId || null,
      requiredSkillIds: this.editForm.skillIds
    };
    const obs = this.formMode === 'edit'
      ? this.taskService.update(this.selected!.id, payload)
      : this.taskService.create(payload);
    obs.subscribe({
      next: r => {
        this.saving = false;
        if (r.success) { 
          this.showForm = false; this.load(); 
          this.toast.showSuccess(this.formMode === 'edit' ? 'Task updated successfully' : 'Task created successfully');
        } else { this.toast.showError(r.message || 'Failed to save task'); }
      },
      error: err => { this.saving = false; this.toast.showError(err.error?.message || 'Error saving task'); }
    });
  }

  confirmDelete(t: Task): void { this.selected = t; this.showDelConfirm = true; }
  doDelete(): void {
    this.taskService.delete(this.selected!.id).subscribe({
      next: r => {
        if (r.success) { 
          this.showDelConfirm = false; this.load(); 
          this.toast.showSuccess('Task deleted successfully');
        } else { this.toast.showError(r.message || 'Failed to delete task'); }
      },
      error: err => this.toast.showError(err.error?.message || 'Error deleting task')
    });
  }

  openAssign(t: Task): void {
    this.assignTask = t; this.showAssign = true; this.assignNotes = '';
    this.taskAssignments = [];
    this.taskService.getAssignmentsForTask(t.id).subscribe(r => { if (r.success) this.taskAssignments = r.data; });

    // Scoped assignee list:
    // PM → does NOT directly assign people (dept heads do that)
    // Dept Head → team leads in their dept (so they can delegate sub-tasks to teams)
    // Team Lead → approved employees in their team
    this.userService.getAll().subscribe(r => {
      if (!r.success) return;
      let users = r.data;
      if (this.auth.isDeptHead) {
        users = users.filter(u =>
          u.approvalStatus === 'APPROVED' &&
          u.role === 'TEAM_LEAD' &&
          u.department?.id === this.auth.deptId);
      } else if (this.auth.isTeamLead) {
        users = users.filter(u =>
          u.approvalStatus === 'APPROVED' &&
          (u.role === 'EMPLOYEE' || u.id === this.auth.userId) &&
          u.team?.id === this.auth.teamId);
      } else if (this.auth.isPM) {
        users = users.filter(u =>
          u.approvalStatus === 'APPROVED' &&
          u.role === 'DEPARTMENT_HEAD');
      }
      
      const deptId = t.department?.id;
      const estimatedHours = t.estimatedHours || 0;
      this.assignableUsers = users.filter(u => {
        const inDept = deptId ? u.department?.id === deptId : true;
        const canTakeTask = ((u.allocatedHours || 0) + estimatedHours) <= (u.maxCapacityHours || 45);
        return inDept && canTakeTask;
      });
    });
  }

  isAssigned(userId: number): boolean { return this.taskAssignments.some(a => a.employee?.id === userId); }

  getUtilPercent(u: User): number {
    const max = u.maxCapacityHours || 45;
    const cur = u.allocatedHours || 0;
    return Math.min(Math.round((cur / max) * 100), 150);
  }

  getProjectedUtilPercent(u: User): number {
    const max = u.maxCapacityHours || 45;
    const cur = u.allocatedHours || 0;
    const est = this.assignTask?.estimatedHours || 0;
    return Math.min(Math.round(((cur + est) / max) * 100), 150);
  }

  getUtilColor(pct: number): string {
    if (pct <= 70) return 'var(--success)';
    if (pct <= 100) return 'var(--warning)';
    return 'var(--danger)';
  }

  assignUser(u: User): void {
    if (this.isAssigned(u.id)) return;
    this.taskService.assign({
      taskId: this.assignTask!.id, employeeId: u.id,
      assignedById: this.auth.userId, notes: this.assignNotes
    }).subscribe({
      next: r => {
        if (r.success) {
          this.toast.showSuccess('Task assigned successfully');
          u.allocatedHours = (u.allocatedHours || 0) + (this.assignTask?.estimatedHours || 0); // instant UI update
          this.taskService.getAssignmentsForTask(this.assignTask!.id).subscribe(ar => {
            if (ar.success) this.taskAssignments = ar.data;
          });
        } else { this.toast.showError(r.message || 'Failed to assign task'); }
      },
      error: err => {
        this.toast.showError('Assignment failed: ' + (err.error?.message || err.message || 'Unknown error'));
      }
    });
  }

  removeAssignment(a: TaskAssignment): void {
    this.taskService.removeAssignment(a.id).subscribe({
      next: r => {
        if (r.success) {
          this.toast.showSuccess('Assignment removed successfully');
          const u = this.assignableUsers.find(user => user.id === a.employee?.id);
          if (u) {
             u.allocatedHours = Math.max(0, (u.allocatedHours || 0) - (this.assignTask?.estimatedHours || 0)); // instant UI update
          }
          this.taskService.getAssignmentsForTask(this.assignTask!.id).subscribe(ar => {
            if (ar.success) this.taskAssignments = ar.data;
          });
        } else { this.toast.showError(r.message || 'Failed to remove assignment'); }
      },
      error: err => this.toast.showError(err.error?.message || 'Error removing assignment')
    });
  }

  // Can current user create a sub-task under this task?
  canCreateSubTask(t: Task): boolean {
    if (this.auth.isDeptHead) return t.department?.id === this.auth.deptId;
    if (this.auth.isTeamLead) return t.team?.id === this.auth.teamId;
    return false;
  }

  // Is the parent of this sub-task already visible in the current filtered view?
  hasParentInView(t: Task): boolean {
    if (!t.parentTask) return false;
    return this.parentTasks.some(p => p.id === t.parentTask?.id);
  }

  getTaskBadge(s: string): string {
    const m: any = { PENDING:'badge-yellow', IN_PROGRESS:'badge-blue', REVIEW:'badge-purple', COMPLETED:'badge-green', CANCELLED:'badge-gray' };
    return m[s] || 'badge-gray';
  }
  getPrBadge(s: string): string {
    const m: any = { LOW:'badge-gray', MEDIUM:'badge-blue', HIGH:'badge-yellow', CRITICAL:'badge-red' };
    return m[s] || 'badge-gray';
  }
}
