import { Component, inject, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-view.component.html',
})
export class NotificationViewComponent {
  private alertService = inject(AlertService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef);

  @Input() notification: any;   // Notification object from parent
  @Input() isOpen: boolean = false;

  baseUrl = 'http://localhost:5000/api/auth';

  close() {
    this.isOpen = false;
    this.cd.markForCheck();
  }

  markAsRead() {
    if (!this.notification || this.notification.read) return;

    // Call backend to mark as read
    this.http.put(`${this.baseUrl}/notifications/read`, {}).subscribe({
      next: () => {
        this.notification.read = true;
        this.alertService.show('Notification marked as read', 'success');
        this.cd.markForCheck();
      },
      error: () => this.alertService.show('Failed to mark notification as read', 'error')
    });
  }

  open() {
    this.isOpen = true;
    this.markAsRead();
  }
}
