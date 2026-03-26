import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  credentials = [
    { role: 'Project Manager', email: 'projectmanager@mail.com', pass: 'projectmanager123', color: '#a78bfa' },
    { role: 'Dev Dept Head', email: 'development@mail.com', pass: 'development123', color: '#60a5fa' },
    { role: 'Backend Lead', email: 'teamleadbackend@mail.com', pass: 'teamleadbackend123', color: '#fbbf24' },
    { role: 'Employee', email: 'd@mail.com', pass: 'Aa123456#', color: '#94a3b8' },
  ];

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/dashboard']);
  }

  fill(email: string, pass: string): void { this.email = email; this.password = pass; }

  login(): void {
    if (!this.email && !this.password) {
      this.error = 'Invalid email and password';
      return;
    }
    if (!this.email) {
      this.error = 'Invalid email';
      return;
    }
    if (!this.password) {
      this.error = 'Invalid password';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) { this.error = 'Invalid email'; return; }
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: r => { this.loading = false; if (r.success) this.router.navigate(['/dashboard']); else this.error = r.message; },
      error: e => { this.loading = false; this.error = e.error?.message || 'Invalid email or password'; }
    });
  }
}
