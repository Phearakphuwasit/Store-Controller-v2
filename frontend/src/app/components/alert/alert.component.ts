import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
  private alertService = inject(AlertService);
  private cd = inject(ChangeDetectorRef);
  
  alerts: any[] = [];

  ngOnInit() {
    this.alertService.alert$.subscribe(alert => {
      const id = Date.now();
      const newAlert = { ...alert, id };
      this.alerts.push(newAlert);
      this.cd.markForCheck();

      // Trigger the progress bar animation after a tiny delay
      setTimeout(() => {
        const bar = document.querySelector(`[style*="width: 0%"]`);
        if (bar) (bar as HTMLElement).style.width = '100%';
      }, 50);

      // Auto-remove
      setTimeout(() => this.remove(id), 4000);
    });
  }

  remove(id: number) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.cd.markForCheck();
  }
}