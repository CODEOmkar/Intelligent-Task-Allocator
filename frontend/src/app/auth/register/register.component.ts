import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentService, TeamService, SkillService } from '../../core/services/api.services';
import { Department, Team, Skill } from '../../core/models';

@Component({ selector: 'app-register', templateUrl: './register.component.html' })
export class RegisterComponent implements OnInit {
  step = 1;
  form: any = {
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    role: 'EMPLOYEE', departmentId: null, teamId: null,
    skillIds: [], experienceYears: 0, maxCapacityHours: 40, bio: ''
  };
  departments: Department[] = [];
  teams: Team[] = [];
  skills: Skill[] = [];
  error = ''; loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private deptService: DepartmentService,
    private teamService: TeamService,
    private skillService: SkillService
  ) {}

  ngOnInit(): void {
    this.deptService.getAll().subscribe(r => { if (r.success) this.departments = r.data; });
    this.skillService.getAll().subscribe(r => { if (r.success) this.skills = r.data; });
  }

  onDeptChange(): void {
    this.form.teamId = null;
    if (this.form.departmentId) {
      this.teamService.getByDept(this.form.departmentId).subscribe(r => { if (r.success) this.teams = r.data; });
    }
  }

  toggleSkill(id: number): void {
    const idx = this.form.skillIds.indexOf(id);
    if (idx >= 0) this.form.skillIds.splice(idx, 1);
    else this.form.skillIds.push(id);
  }

  hasSkill(id: number): boolean { return this.form.skillIds.includes(id); }

  nextStep(): void {
    if (this.step === 1) {
      if (!this.form.email || !this.form.firstName || !this.form.lastName) {
        this.error = 'Please fill all required fields'; return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Passwords do not match'; return;
      }
      if (this.form.password.length < 6) {
        this.error = 'Password must be at least 6 characters'; return;
      }
    }
    this.error = '';
    this.step++;
  }

  register(): void {
    this.loading = true; this.error = '';
    const payload = { ...this.form };
    delete payload.confirmPassword;
    this.auth.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.router.navigate(['/dashboard']);
        else this.error = res.message;
      },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Registration failed'; }
    });
  }

  get roleLabel(): string {
    const map: any = { PROJECT_MANAGER: 'Project Manager', DEPARTMENT_HEAD: 'Department Head', TEAM_LEAD: 'Team Lead', EMPLOYEE: 'Employee' };
    return map[this.form.role] || this.form.role;
  }

  get skillCategories(): string[] {
    return [...new Set(this.skills.map(s => s.category || 'Other'))];
  }

  getSkillsByCategory(cat: string): Skill[] {
    return this.skills.filter(s => (s.category || 'Other') === cat);
  }
}
