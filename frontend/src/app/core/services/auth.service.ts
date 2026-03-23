import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse, AuthState } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _auth$ = new BehaviorSubject<AuthState | null>(this.loadFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<ApiResponse<AuthState>> {
    return this.http.post<ApiResponse<AuthState>>('/api/auth/login', { email, password }).pipe(
      tap(res => { if (res.success) this.save(res.data); })
    );
  }

  register(data: any): Observable<ApiResponse<AuthState>> {
    return this.http.post<ApiResponse<AuthState>>('/api/auth/register', data).pipe(
      tap(res => { if (res.success) this.save(res.data); })
    );
  }

  logout(): void {
    sessionStorage.removeItem('ita_auth');
    localStorage.removeItem('ita_auth'); // Clean up old lingering login
    this._auth$.next(null);
    this.router.navigate(['/login']);
  }

  private save(auth: AuthState): void {
    sessionStorage.setItem('ita_auth', JSON.stringify(auth));
    this._auth$.next(auth);
  }

  private loadFromStorage(): AuthState | null {
    try { 
      localStorage.removeItem('ita_auth'); // Clear any permanent logins
      const s = sessionStorage.getItem('ita_auth'); 
      return s ? JSON.parse(s) : null; 
    }
    catch { return null; }
  }

  get auth(): AuthState | null { return this._auth$.value; }
  get auth$(): Observable<AuthState | null> { return this._auth$.asObservable(); }
  get token(): string { return this.auth?.token || ''; }
  get userId(): number { return this.auth?.id || 0; }
  get userRole(): string { return this.auth?.role || ''; }
  get deptId(): number { return this.auth?.departmentId || 0; }
  get teamId(): number { return this.auth?.teamId || 0; }
  get isLoggedIn(): boolean { return !!this.auth; }
  get isPM(): boolean { return this.userRole === 'PROJECT_MANAGER'; }
  get isDeptHead(): boolean { return this.userRole === 'DEPARTMENT_HEAD'; }
  get isTeamLead(): boolean { return this.userRole === 'TEAM_LEAD'; }
  get isEmployee(): boolean { return this.userRole === 'EMPLOYEE'; }
  get isApproved(): boolean { return this.auth?.approvalStatus === 'APPROVED'; }

  hasRole(...roles: string[]): boolean { return roles.includes(this.userRole); }
  canManageTasks(): boolean { return this.hasRole('DEPARTMENT_HEAD', 'TEAM_LEAD'); }
  canManageProjects(): boolean { return this.hasRole('PROJECT_MANAGER'); }

  // Update stored approval status after PM approval
  updateApprovalStatus(status: string): void {
    const auth = this.auth;
    if (auth) { auth.approvalStatus = status; this.save(auth); }
  }

  // Update stored profile data after user edits their profile
  updateProfileData(firstName: string, lastName: string, email: string): void {
    const current = this.auth;
    if (current) {
      const updated = { ...current, firstName, lastName, email };
      this.save(updated);
    }
  }
}
