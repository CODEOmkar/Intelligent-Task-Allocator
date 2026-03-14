import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm',
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="cancel.emit()">
      <div class="modal" style="max-width:380px" (click)="$event.stopPropagation()">
        <div class="modal-body" style="text-align:center;padding:32px 24px">
          <div style="font-size:32px;margin-bottom:12px">⚠️</div>
          <div style="font-size:16px;font-weight:700;margin-bottom:8px">{{ title }}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:24px">{{ message }}</div>
          <div style="display:flex;gap:10px;justify-content:center">
            <button class="btn btn-secondary" (click)="cancel.emit()">Cancel</button>
            <button class="btn btn-danger" style="background:var(--danger);color:white" (click)="confirm.emit()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() show = false;
  @Input() title = 'Confirm Delete';
  @Input() message = 'This action cannot be undone.';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
