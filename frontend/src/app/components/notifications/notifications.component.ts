import { Component, HostListener, ElementRef, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationComponent implements OnInit {
  private eRef = inject(ElementRef);
  private cd = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private baseUrl = 'http://localhost:5000/api/auth';
  
  isOpen = false;
  notifications: any[] = [];
  unreadCount = 0;

  ngOnInit() {
    this.fetchNotifications();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.fetchNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.cd.markForCheck();
    }
  }

  fetchNotifications() {
    this.http.get<{notifications: any[]}>(`${this.baseUrl}/profile`).subscribe({
      next: (res: any) => {
        this.notifications = res.notifications || [];
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.cd.markForCheck();
      }
    });
  }

  markAsRead() {
    if (this.unreadCount === 0) return;

    // Matches the PUT route we fixed in your backend earlier
    this.http.put(`${this.baseUrl}/notifications/read`, {}).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.alertService.show('All caught up!', 'success');
        this.cd.markForCheck();
      },
      error: () => this.alertService.show('Failed to sync notifications', 'error')
    });
  }
}