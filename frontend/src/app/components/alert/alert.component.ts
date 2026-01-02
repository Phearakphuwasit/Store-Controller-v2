import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="fixed top-5 right-5 w-80 p-4 rounded-xl shadow-lg flex items-start gap-3 text-white animate-in fade-in duration-300"
      [ngClass]="{
        'bg-green-600': type === 'success',
        'bg-red-600': type === 'error',
        'bg-blue-600': type === 'info',
        'bg-yellow-500 text-black': type === 'warning'
      }"
    >
      <div class="flex-1">
        <p class="font-semibold">{{ message }}</p>
      </div>
      <button (click)="close()" class="ml-2 text-white hover:text-gray-200">
        &times;
      </button>
    </div>
  `,
})
export class AlertComponent {
  @Input() message: string = 'This is an alert!';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() duration: number = 3000;
  @Output() closed = new EventEmitter<void>();

  visible = true;

  ngOnInit() {
    if (this.duration > 0) {
      setTimeout(() => this.close(), this.duration);
    }
  }

  close() {
    this.visible = false;
    this.closed.emit();
  }
}
