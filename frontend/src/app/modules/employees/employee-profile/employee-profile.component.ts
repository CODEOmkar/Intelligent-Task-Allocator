import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, TaskService, DepartmentService, TeamService, SkillService } from '../../../core/services/api.services';
import { ToastService } from '../../../core/services/toast.service';
import { User, TaskAssignment, Department, Team, Skill } from '../../../core/models';

@Component({ selector: 'app-employee-profile', templateUrl: './employee-profile.component.html' })
export class EmployeeProfileComponent implements OnInit {
  user: User | null = null;
  assignments: TaskAssignment[] = [];
  loading = true;
  isOwnProfile = false;
  editMode = false;
  saving = false;
  saveError = '';

  departments: Department[] = [];
  teams: Team[] = [];
  skills: Skill[] = [];

  editForm: any = {};
  selectedSkillIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private userService: UserService,
    private taskService: TaskService,
    private deptService: DepartmentService,
    private teamService: TeamService,
    private skillService: SkillService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => this.load(+p['id']));
    this.loadLookups();
  }

  load(id: number): void {
    this.loading = true;
    this.isOwnProfile = id === this.auth.userId;
    this.userService.getById(id).subscribe(r => {
      if (r.success) {
        this.user = r.data;
        this.resetEditForm();
        this.loadAssignments(id);
      } else this.loading = false;
    });
  }

  loadAssignments(userId: number): void {
    this.taskService.getUserAssignments(userId).subscribe({
      next: r => {
        if (r.success) this.assignments = r.data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        console.error('Failed to load assignments', err);
      }
    });
  }

  loadLookups(): void {
    this.deptService.getAll().subscribe(r => { if (r.success) this.departments = r.data; });
    this.teamService.getAll().subscribe(r => { if (r.success) this.teams = r.data; });
    this.skillService.getAll().subscribe(r => { if (r.success) this.skills = r.data; });
  }

  resetEditForm(): void {
    if (!this.user) return;
    this.editForm = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      bio: this.user.bio || '',
      experienceYears: this.user.experienceYears || 0,
      maxCapacityHours: this.user.maxCapacityHours || 40,
      departmentId: this.user.department?.id || null,
      teamId: this.user.team?.id || null,
    };
    this.selectedSkillIds = (this.user.skills || []).map(s => s.id);
  }

  toggleSkill(id: number): void {
    const idx = this.selectedSkillIds.indexOf(id);
    if (idx === -1) this.selectedSkillIds.push(id);
    else this.selectedSkillIds.splice(idx, 1);
  }

  isSkillSelected(id: number): boolean { return this.selectedSkillIds.includes(id); }

  save(): void {
    this.saveError = '';
    if (!this.user) return;

    if (!this.editForm.firstName || !this.editForm.lastName || !this.editForm.email) {
      this.saveError = 'Name and Email are required.';
      return;
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(this.editForm.firstName) || !nameRegex.test(this.editForm.lastName)) {
      this.saveError = 'Name must contain only letters.';
      return;
    }
    if (this.editForm.firstName.length < 2 || this.editForm.lastName.length < 2) {
      this.saveError = 'Name must be at least 2 characters.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editForm.email)) {
      this.saveError = 'Invalid email format.';
      return;
    }

    this.saving = true;
    const data: any = { ...this.editForm, skillIds: this.selectedSkillIds, selfEdit: this.isOwnProfile && !this.auth.isPM };
    this.userService.update(this.user.id, data).subscribe({
      next: r => {
        this.saving = false;
        if (r.success) { 
          this.user = r.data; 
          this.editMode = false;
          this.toast.showSuccess('Profile updated successfully');
          if (this.isOwnProfile) {
            this.auth.updateProfileData(this.user.firstName, this.user.lastName, this.user.email);
          }
        }
        else { this.saveError = r.message || 'Failed to update'; this.toast.showError(this.saveError); }
      },
      error: err => {
        this.saving = false;
        this.saveError = err.error?.message || 'Failed to update profile';
      }
    });
  }

  getUtilPct(): number {
    if (!this.user || !this.user.maxCapacityHours) return 0;
    return Math.min(((this.user.allocatedHours || 0) / this.user.maxCapacityHours) * 100, 150);
  }

  getUtilClass(): string {
    const pct = this.getUtilPct();
    return pct > 100 ? 'overload' : pct >= 70 ? 'optimal' : 'underutil';
  }

  getUtilLabel(): string {
    const pct = this.getUtilPct();
    return pct > 100 ? 'Overloaded' : pct >= 70 ? 'Optimal' : 'Underutilized';
  }

  getStatusBadge(s: string): string {
    const m: any = { ASSIGNED:'badge-yellow', IN_PROGRESS:'badge-blue', COMPLETED:'badge-green' };
    return m[s] || 'badge-gray';
  }

  canEdit(): boolean {
    return this.isOwnProfile || this.auth.isPM || this.auth.isDeptHead || this.auth.isTeamLead;
  }
}
