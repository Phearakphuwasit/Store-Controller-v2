import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div class="p-6">
          <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 mb-4">
            <ng-icon name="heroExclamationTriangle" size="24"></ng-icon>
          </div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">{{ title }}</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {{ message }}
          </p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 flex gap-3">
          <button (click)="onCancel()" 
            class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white transition">
            Cancel
          </button>
          <button (click)="onConfirm()" 
            class="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition active:scale-95">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}