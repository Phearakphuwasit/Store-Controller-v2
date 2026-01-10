import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  path: string;
  badge?: number;
  icon?: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  currentUser: any = null;
  private subscriptions = new Subscription();
  imageTimestamp: number = Date.now();
  private previousProfilePicture: string = '';

  inventoryMenu: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zM8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path></svg>`,
    },
    {
      label: 'Products',
      path: '/inventory/products',
      badge: 12,
      roles: ['admin'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`,
    },
    {
      label: 'Categories',
      path: '/inventory/categories',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
    },
    {
      label: 'Stock Levels',
      path: '/inventory/stock',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`,
    },
  ];

  logisticsMenu: MenuItem[] = [
    {
      label: 'Purchase Orders',
      path: '/logistics/purchase-orders',
      roles: ['admin'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
    },
    {
      label: 'Deliveries',
      path: '/logistics/deliveries',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`,
    },
  ];

  reportMenu: MenuItem[] = [
    {
      label: 'Sales Report',
      path: '/reports/sales',
      roles: ['admin'],
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>`,
    },
  ];

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser.subscribe((user) => {
        this.currentUser = user;
        if (user?.profilePicture !== this.previousProfilePicture) {
          this.imageTimestamp = Date.now();
          this.previousProfilePicture = user?.profilePicture || '';
        }
      })
    );
  }

  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Helpers
  canAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    const userRole = this.currentUser?.role?.toLowerCase();
    return !!userRole && item.roles.includes(userRole);
  }

  getSafeIcon(svg: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg || '');
  }

  getProfilePicture(): string {
    if (!this.currentUser?.profilePicture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.currentUser?.fullName || 'User'
      )}`;
    }

    const path = this.currentUser.profilePicture;

    // If the database already stored the full URL, just use it
    if (path.startsWith('http')) {
      return `${path}?t=${this.imageTimestamp}`;
    }

    // Otherwise, attach your EC2 IP manually
    return `http://16.176.174.48:5000/${path}?t=${this.imageTimestamp}`;
  }

  onImageError(event: any): void {
    event.target.src = `https://ui-avatars.com/api/?name=User&background=2563eb&color=fff`;
  }

  logout(): void {
    this.authService.logout();
  }
}
