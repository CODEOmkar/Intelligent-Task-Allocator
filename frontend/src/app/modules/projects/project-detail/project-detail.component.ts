import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService, TaskService, UserService, DepartmentService, TeamService } from '../../../core/services/api.services';
import { Project, Task, TaskAssignment, Department, Team, UtilizationDTO } from '../../../core/models';

@Component({ selector: 'app-project-detail', templateUrl: './project-detail.component.html' })
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  assignments: Map<number, TaskAssignment[]> = new Map();
  loading = true;
  showTaskForm = false;
  showAssignForm = false;
  editingTask: Task | null = null;
  assigningTask: Task | null = null;
  showDeleteConfirm = false;
  deletingTask: Task | null = null;

  departments: Department[] = [];
  teams: Team[] = [];
  filteredTeams: Team[] = [];

  taskForm: any = {
    title: '', description: '', priority: 'MEDIUM', estimatedHours: 8,
    requiredEmployees: 1, dueDate: '', status: 'PENDING',
    departmentId: null, teamId: null
  };
  availableEmployees: UtilizationDTO[] = [];
  selectedEmployeeId: number | null = null;
  assignNotes = '';
  savingTask = false;
  savingAssign = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public auth: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private deptService: DepartmentService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => this.load(+p['id']));
    this.deptService.getAll().subscribe(r => { if (r.success) this.departments = r.data; });
    this.teamService.getAll().subscribe(r => { if (r.success) this.teams = r.data; });
  }

  load(id: number): void {
    this.loading = true;
    this.projectService.getById(id).subscribe(r => {
      if (r.success) { this.project = r.data; this.loadTasks(); }
      else this.loading = false;
    });
  }

  loadTasks(): void {
    this.taskService.getByProject(this.project!.id).subscribe(r => {
      if (r.success) { this.tasks = r.data; this.loadAssignments(); }
      this.loading = false;
    });
  }

  loadAssignments(): void {
    this.tasks.forEach(t => {
      this.taskService.getAssignmentsForTask(t.id).subscribe(r => {
        if (r.success) this.assignments.set(t.id, r.data);
      });
    });
  }

  getAssignments(taskId: number): TaskAssignment[] { return this.assignments.get(taskId) || []; }

  onDeptChange(): void {
    this.taskForm.teamId = null;
    this.filteredTeams = this.teams.filter(t => t.department?.id === +this.taskForm.departmentId);
  }

  openTaskForm(task?: Task): void {
    this.editingTask = task || null;
    if (task) {
      this.taskForm = {
        title: task.title, description: task.description || '',
        priority: task.priority, estimatedHours: task.estimatedHours || 8,
        requiredEmployees: task.requiredEmployees || 1,
        dueDate: task.dueDate || '', status: task.status,
        departmentId: task.department?.id || null,
        teamId: task.team?.id || null
      };
    } else {
      this.taskForm = {
        title: '', description: '', priority: 'MEDIUM', estimatedHours: 8,
        requiredEmployees: 1, dueDate: '', status: 'PENDING',
        // PM must select a dept; dept heads pre-fill their own dept
        departmentId: this.auth.isDeptHead ? this.auth.deptId : null,
        teamId: this.auth.isTeamLead ? this.auth.teamId : null
      };
    }
    if (this.taskForm.departmentId) {
      this.filteredTeams = this.teams.filter(t => t.department?.id === +this.taskForm.departmentId);
    } else {
      this.filteredTeams = [];
    }
    this.showTaskForm = true;
  }

  saveTask(): void {
    if (!this.taskForm.title) return;
    // PM must assign to a department
    if (this.auth.isPM && !this.taskForm.departmentId) {
      alert('Please select a department to assign this task to.');
      return;
    }
    this.savingTask = true;
    const data: any = {
      ...this.taskForm,
      projectId: this.project!.id,
      departmentId: this.taskForm.departmentId ? +this.taskForm.departmentId : null,
      // PM does not set team — dept head does that via sub-tasks
      teamId: this.auth.isPM ? null : (this.taskForm.teamId ? +this.taskForm.teamId : null)
    };
    const obs = this.editingTask
      ? this.taskService.update(this.editingTask.id, data)
      : this.taskService.create(data);
    obs.subscribe(r => {
      this.savingTask = false;
      if (r.success) { this.showTaskForm = false; this.loadTasks(); }
    }, () => this.savingTask = false);
  }

  openAssign(task: Task): void {
    this.assigningTask = task;
    this.selectedEmployeeId = null;
    this.assignNotes = '';
    const utilObs = this.auth.isPM ? this.userService.getAllUtilization()
      : this.auth.isDeptHead ? this.userService.getDeptUtilization(this.auth.deptId)
      : this.userService.getTeamUtilization(this.auth.teamId);
    utilObs.subscribe(r => {
      if (r.success) this.availableEmployees = r.data;
    });
    this.showAssignForm = true;
  }

  saveAssign(): void {
    if (!this.selectedEmployeeId) return;
    this.savingAssign = true;
    this.taskService.assign({
      taskId: this.assigningTask!.id, employeeId: this.selectedEmployeeId,
      assignedById: this.auth.userId, notes: this.assignNotes
    }).subscribe(r => {
      this.savingAssign = false;
      if (r.success) { this.showAssignForm = false; this.loadAssignments(); }
    }, () => this.savingAssign = false);
  }

  confirmDeleteTask(task: Task): void { this.deletingTask = task; this.showDeleteConfirm = true; }
  deleteTask(): void {
    if (!this.deletingTask) return;
    this.taskService.delete(this.deletingTask.id).subscribe(r => {
      this.showDeleteConfirm = false;
      if (r.success) this.loadTasks();
    });
  }

  removeAssignment(assignId: number): void {
    this.taskService.removeAssignment(assignId).subscribe(r => {
      if (r.success) this.loadAssignments();
    });
  }

  deleteProject(): void {
    if (!this.project) return;
    this.projectService.delete(this.project.id).subscribe(r => {
      if (r.success) this.router.navigate(['/projects']);
    });
  }

  getTaskBadge(s: string): string {
    const m: any = { PENDING:'badge-yellow', IN_PROGRESS:'badge-blue', REVIEW:'badge-purple', COMPLETED:'badge-green', CANCELLED:'badge-gray' };
    return m[s] || 'badge-gray';
  }
  getPriorityBadge(s: string): string {
    const m: any = { LOW:'badge-gray', MEDIUM:'badge-blue', HIGH:'badge-yellow', CRITICAL:'badge-red' };
    return m[s] || 'badge-gray';
  }
  getUtilClass(s: string): string {
    return s === 'OVERLOADED' ? 'overload' : s === 'OPTIMAL' ? 'optimal' : 'underutil';
  }
}
