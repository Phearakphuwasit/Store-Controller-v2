import { Component, inject, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-notification-view',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './notification-view.component.html',
  styleUrls: ['./notification-view.component.css'],
  viewProviders: [provideIcons({ heroXMark })]
})
export class NotificationViewComponent {
  private alertService = inject(AlertService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cd = inject(ChangeDetectorRef);

  @Input() notification: any;
  @Input() isOpen: boolean = false;

  baseUrl = 'http://16.176.174.48:5000/api/auth';

  close() {
    this.isOpen = false;
    this.cd.markForCheck();
  }

  markAsRead() {
    if (!this.notification || this.notification.read) return;
    const notificationId = this.notification._id;
    this.http.put(`${this.baseUrl}/notifications/read/${notificationId}`, {}).subscribe({
      next: () => {
        this.notification.read = true;
        this.cd.markForCheck();
      },
      error: () => this.alertService.show('Failed to sync read status', 'error')
    });
  }

  getIconName(type: string): string {
  switch (type) {
    case 'success': return 'heroCheckCircle';
    case 'warning': return 'heroExclamationTriangle';
    case 'error': return 'heroXCircle';
    default: return 'heroInformationCircle';
  }
}
}