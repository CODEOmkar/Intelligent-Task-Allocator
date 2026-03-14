import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, User, Department, Team, Skill, Project, Task, TaskAssignment, UtilizationDTO } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiResponse<User[]>> { return this.http.get<ApiResponse<User[]>>('/api/users'); }
  getById(id: number): Observable<ApiResponse<User>> { return this.http.get<ApiResponse<User>>(`/api/users/${id}`); }
  getByDept(deptId: number): Observable<ApiResponse<User[]>> { return this.http.get<ApiResponse<User[]>>(`/api/users/department/${deptId}`); }
  getByTeam(teamId: number): Observable<ApiResponse<User[]>> { return this.http.get<ApiResponse<User[]>>(`/api/users/team/${teamId}`); }
  getPending(): Observable<ApiResponse<User[]>> { return this.http.get<ApiResponse<User[]>>('/api/users/pending'); }
  approve(id: number): Observable<ApiResponse<User>> { return this.http.post<ApiResponse<User>>(`/api/users/${id}/approve`, {}); }
  reject(id: number): Observable<ApiResponse<User>> { return this.http.post<ApiResponse<User>>(`/api/users/${id}/reject`, {}); }
  update(id: number, data: any): Observable<ApiResponse<User>> { return this.http.patch<ApiResponse<User>>(`/api/users/${id}`, data); }
  delete(id: number): Observable<ApiResponse<any>> { return this.http.delete<ApiResponse<any>>(`/api/users/${id}`); }
  getAllUtilization(): Observable<ApiResponse<UtilizationDTO[]>> { return this.http.get<ApiResponse<UtilizationDTO[]>>('/api/users/utilization/all'); }
  getDeptUtilization(deptId: number): Observable<ApiResponse<UtilizationDTO[]>> { return this.http.get<ApiResponse<UtilizationDTO[]>>(`/api/users/utilization/department/${deptId}`); }
  getTeamUtilization(teamId: number): Observable<ApiResponse<UtilizationDTO[]>> { return this.http.get<ApiResponse<UtilizationDTO[]>>(`/api/users/utilization/team/${teamId}`); }
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiResponse<Project[]>> { return this.http.get<ApiResponse<Project[]>>('/api/projects'); }
  getActive(): Observable<ApiResponse<Project[]>> { return this.http.get<ApiResponse<Project[]>>('/api/projects/active'); }
  getById(id: number): Observable<ApiResponse<Project>> { return this.http.get<ApiResponse<Project>>(`/api/projects/${id}`); }
  create(data: any): Observable<ApiResponse<Project>> { return this.http.post<ApiResponse<Project>>('/api/projects', data); }
  update(id: number, data: any): Observable<ApiResponse<Project>> { return this.http.put<ApiResponse<Project>>(`/api/projects/${id}`, data); }
  delete(id: number): Observable<ApiResponse<any>> { return this.http.delete<ApiResponse<any>>(`/api/projects/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}
  getForMe(): Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>('/api/tasks/for-me'); }
  getMyAssignments(): Observable<ApiResponse<TaskAssignment[]>> { return this.http.get<ApiResponse<TaskAssignment[]>>('/api/tasks/my-assignments'); }
  getAll(): Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>('/api/tasks'); }
  getById(id: number): Observable<ApiResponse<Task>> { return this.http.get<ApiResponse<Task>>(`/api/tasks/${id}`); }
  getByProject(pid: number): Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>(`/api/tasks/project/${pid}`); }
  getByDept(deptId: number): Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>(`/api/tasks/department/${deptId}`); }
  getByTeam(teamId: number): Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>(`/api/tasks/team/${teamId}`); }
  create(data: any): Observable<ApiResponse<Task>> { return this.http.post<ApiResponse<Task>>('/api/tasks', data); }
  update(id: number, data: any): Observable<ApiResponse<Task>> { return this.http.put<ApiResponse<Task>>(`/api/tasks/${id}`, data); }
  delete(id: number): Observable<ApiResponse<any>> { return this.http.delete<ApiResponse<any>>(`/api/tasks/${id}`); }
  assign(data: any): Observable<ApiResponse<TaskAssignment>> { return this.http.post<ApiResponse<TaskAssignment>>('/api/tasks/assign', data); }
  updateProgress(assignmentId: number, empId: number, pct: number): Observable<ApiResponse<TaskAssignment>> {
    return this.http.patch<ApiResponse<TaskAssignment>>(`/api/tasks/assignments/${assignmentId}/progress`, { employeeId: empId, completionPercentage: pct });
  }
  removeAssignment(id: number): Observable<ApiResponse<TaskAssignment>> { return this.http.delete<ApiResponse<TaskAssignment>>(`/api/tasks/assignments/${id}`); }
  getSubTasks(taskId: number): Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>(`/api/tasks/${taskId}/subtasks`); }
  getAssignmentsForTask(taskId: number): Observable<ApiResponse<TaskAssignment[]>> { return this.http.get<ApiResponse<TaskAssignment[]>>(`/api/tasks/assignments/task/${taskId}`); }
  getAllAssignmentsForTask(taskId: number): Observable<ApiResponse<TaskAssignment[]>> { return this.http.get<ApiResponse<TaskAssignment[]>>(`/api/tasks/assignments/task/${taskId}/all`); }
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiResponse<Department[]>> { return this.http.get<ApiResponse<Department[]>>('/api/departments'); }
  getById(id: number): Observable<ApiResponse<Department>> { return this.http.get<ApiResponse<Department>>(`/api/departments/${id}`); }
  create(data: any): Observable<ApiResponse<Department>> { return this.http.post<ApiResponse<Department>>('/api/departments', data); }
  update(id: number, data: any): Observable<ApiResponse<Department>> { return this.http.put<ApiResponse<Department>>(`/api/departments/${id}`, data); }
  delete(id: number): Observable<ApiResponse<any>> { return this.http.delete<ApiResponse<any>>(`/api/departments/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiResponse<Team[]>> { return this.http.get<ApiResponse<Team[]>>('/api/teams'); }
  getByDept(deptId: number): Observable<ApiResponse<Team[]>> { return this.http.get<ApiResponse<Team[]>>(`/api/teams/department/${deptId}`); }
  getById(id: number): Observable<ApiResponse<Team>> { return this.http.get<ApiResponse<Team>>(`/api/teams/${id}`); }
  create(data: any): Observable<ApiResponse<Team>> { return this.http.post<ApiResponse<Team>>('/api/teams', data); }
  update(id: number, data: any): Observable<ApiResponse<Team>> { return this.http.put<ApiResponse<Team>>(`/api/teams/${id}`, data); }
  delete(id: number): Observable<ApiResponse<any>> { return this.http.delete<ApiResponse<any>>(`/api/teams/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class SkillService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiResponse<Skill[]>> { return this.http.get<ApiResponse<Skill[]>>('/api/skills'); }
  create(data: any): Observable<ApiResponse<Skill>> { return this.http.post<ApiResponse<Skill>>('/api/skills', data); }
  update(id: number, data: any): Observable<ApiResponse<Skill>> { return this.http.put<ApiResponse<Skill>>(`/api/skills/${id}`, data); }
  delete(id: number): Observable<ApiResponse<any>> { return this.http.delete<ApiResponse<any>>(`/api/skills/${id}`); }
}
