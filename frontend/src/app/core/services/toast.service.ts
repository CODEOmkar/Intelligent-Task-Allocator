import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast$ = new Subject<ToastMessage>();

  showSuccess(message: string): void { this.toast$.next({ message, type: 'success' }); }
  showError(message: string): void { this.toast$.next({ message, type: 'error' }); }
  showInfo(message: string): void { this.toast$.next({ message, type: 'info' }); }
}
