import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts; let i = index" class="toast-message" [ngClass]="t.type">
        <span>{{ t.message }}</span>
        <button class="toast-close" (click)="remove(i)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
    .toast-message {
      padding: 12px 20px; border-radius: 8px; color: white; display: flex; align-items: center; justify-content: space-between; gap: 16px;
      min-width: 250px; font-weight: 500; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    }
    .toast-message.success { background-color: var(--success); }
    .toast-message.error { background-color: var(--danger); }
    .toast-message.info { background-color: var(--primary); }
    .toast-close { background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.8; }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe(t => {
      this.toasts.push(t);
      setTimeout(() => this.remove(0), 4000); // auto-remove after 4s
    });
  }

  remove(index: number): void {
    if (index > -1 && index < this.toasts.length) this.toasts.splice(index, 1);
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
