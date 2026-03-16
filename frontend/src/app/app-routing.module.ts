import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { ProjectDetailComponent } from './modules/projects/project-detail/project-detail.component';
import { TaskListComponent } from './modules/tasks/task-list/task-list.component';
import { MyTasksComponent } from './modules/tasks/my-tasks/my-tasks.component';
import { EmployeeListComponent } from './modules/employees/employee-list/employee-list.component';
import { EmployeeProfileComponent } from './modules/employees/employee-profile/employee-profile.component';
import { UtilizationComponent } from './modules/utilization/utilization.component';
import { ApprovalsComponent } from './modules/approvals/approvals.component';
import { TeamsComponent } from './modules/teams/teams.component';
import { DepartmentsComponent } from './modules/departments/departments.component';
import { SkillsComponent } from './modules/skills/skills.component';

import { LandingComponent } from './core/components/landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'tasks', component: TaskListComponent },
      { path: 'my-tasks', component: MyTasksComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/:id', component: EmployeeProfileComponent },
      { path: 'utilization', component: UtilizationComponent },
      { path: 'approvals', component: ApprovalsComponent },
      { path: 'teams', component: TeamsComponent },
      { path: 'departments', component: DepartmentsComponent },
      { path: 'skills', component: SkillsComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
