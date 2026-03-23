import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from './shared/components/toast/toast.component';
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
import { CountByStatusPipe } from './shared/pipes/count-by-status.pipe';
import { LandingComponent } from './core/components/landing/landing.component';

@NgModule({
  declarations: [
    AppComponent, LoginComponent, RegisterComponent,
    SidebarComponent, TopbarComponent, ConfirmDialogComponent, ToastComponent,
    DashboardComponent, ProjectsComponent, ProjectDetailComponent,
    TaskListComponent, MyTasksComponent,
    EmployeeListComponent, EmployeeProfileComponent,
    UtilizationComponent, ApprovalsComponent,
    TeamsComponent, DepartmentsComponent, SkillsComponent,
    CountByStatusPipe,
    LandingComponent,
  ],
  imports: [BrowserModule, CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule, AppRoutingModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    DecimalPipe, DatePipe, SlicePipe, TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
