import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationComponent implements OnInit {
  private http = inject(HttpClient);
  private eRef = inject(ElementRef);
  private cd = inject(ChangeDetectorRef);

  private baseUrl = 'http://54.253.18.25:5000/api/auth';
  private token = localStorage.getItem('token');

  notifications: Notification[] = [];
  unreadCount = 0;

  isDropdownOpen = false;
  selectedNotification: Notification | null = null;

  ngOnInit(): void {
    this.loadNotifications();
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      })
    };
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.cd.markForCheck();
    }
  }

  loadNotifications(): void {
    if (!this.token) return;

    this.http
      .get<any>(`${this.baseUrl}/profile`, this.getHeaders())
      .subscribe(res => {
        this.notifications = res.user.notifications || [];
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        this.cd.markForCheck();
      });
  }

  // 🔥 CLICK ONE NOTIFICATION
  openNotification(n: Notification, event: MouseEvent): void {
    event.stopPropagation();

    this.selectedNotification = n;
    this.isDropdownOpen = false;

    // Mark read locally (instant UI update)
    if (!n.isRead) {
      n.isRead = true;
      this.unreadCount--;

      // Sync with backend
      this.http.put(
        `${this.baseUrl}/notifications/${n._id}/read`,
        {},
        this.getHeaders()
      ).subscribe();
    }

    this.cd.markForCheck();
  }

  closeNotification(): void {
    this.selectedNotification = null;
    this.cd.markForCheck();
  }

  // 🔥 MARK ALL
  markAllAsRead(): void {
    if (!this.token || this.unreadCount === 0) return;

    this.http.put(
      `${this.baseUrl}/notifications/read`,
      {},
      this.getHeaders()
    ).subscribe(() => {
      this.notifications.forEach(n => (n.isRead = true));
      this.unreadCount = 0;
      this.cd.markForCheck();
    });
  }
}
