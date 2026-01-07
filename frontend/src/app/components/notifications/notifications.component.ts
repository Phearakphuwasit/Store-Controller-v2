import { Component, HostListener, ElementRef, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
}

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
  private token = localStorage.getItem('token');

  // UI states
  isDropdownOpen = false;
  selectedNotification: Notification | null = null;

  notifications: Notification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    this.fetchNotifications();
  }

  toggleDropdown(): void {
    if (this.selectedNotification) this.selectedNotification = null;
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.fetchNotifications();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.cd.markForCheck();
    }
  }

  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.token || ''}` }) };
  }

  fetchNotifications(): void {
    if (!this.token) return;

    this.http.get<{ user: any }>(`${this.baseUrl}/profile`, this.getHeaders())
      .subscribe({
        next: (res: any) => {
          this.notifications = res.user?.notifications || [];
          this.unreadCount = this.notifications.filter(n => !n.read).length;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Failed to fetch notifications:', err);
          this.alertService.show('Unable to load notifications', 'error');
        }
      });
  }

  markAllAsRead(): void {
    if (!this.token || this.unreadCount === 0) return;

    this.http.put(`${this.baseUrl}/notifications/read`, {}, this.getHeaders())
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.read = true);
          this.unreadCount = 0;
          this.alertService.show('All caught up!', 'success');
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Failed to mark notifications as read:', err);
          this.alertService.show('Failed to sync notifications', 'error');
        }
      });
  }

  openNotification(notification: Notification, event: MouseEvent): void {
    event.stopPropagation();
    this.isDropdownOpen = false;
    this.selectedNotification = notification;
  }

  closeNotification(): void {
    this.selectedNotification = null;
  }
}