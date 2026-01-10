import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        <div class="p-8">
          <div [ngClass]="{
            'bg-rose-50 text-rose-600 dark:bg-rose-900/30': type === 'danger',
            'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30': type === 'primary'
          }" class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
            <ng-icon [name]="type === 'danger' ? 'heroExclamationTriangle' : 'heroCheckBadge'" size="28"></ng-icon>
          </div>

          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ title }}</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {{ message }}
          </p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 flex gap-3">
          <button (click)="onCancel()" 
            class="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white transition active:scale-95">
            Cancel
          </button>
          
          <button (click)="onConfirm()" 
            [ngClass]="{
              'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20': type === 'danger',
              'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20': type === 'primary'
            }"
            class="flex-1 px-4 py-3.5 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-lg transition active:scale-95">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() type: 'danger' | 'primary' = 'primary'; // Toggle between red and blue styles

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}