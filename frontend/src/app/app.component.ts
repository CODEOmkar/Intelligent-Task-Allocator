import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="auth.isLoggedIn; else authPages">
      <div class="app-layout">
        <app-sidebar></app-sidebar>
        <div class="main-area">
          <app-topbar></app-topbar>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-container>
    <ng-template #authPages>
      <router-outlet></router-outlet>
    </ng-template>
    <app-toast></app-toast>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
