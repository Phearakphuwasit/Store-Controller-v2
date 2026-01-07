import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin, firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ProductService, Product, ProductStats, Category } from '../../services/product.service';
import { LocationService } from '../../services/LocationService';
import { AddProductComponent } from './add-product/add-product.component';
import { NotificationComponent } from '../../components/notifications/notifications.component';
import { ExportButtonComponent } from '../../components/export-button/export-button.component';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddProductComponent,
    NotificationComponent,
    ExportButtonComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // --- INJECTIONS ---
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private http = inject(HttpClient);
  private locationService = inject(LocationService);
  private cd = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);

  // --- STATE ---
  today: Date = new Date();
  username: string = 'Admin';
  currentUser: any = {
    location: { city: '', country: '' },
    role: 'User',
    profilePicture: '',
  };

  products: Product[] = [];
  filteredProducts: Product[] = [];
  stats: ProductStats = { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
  categories: Category[] = [];

  showAddProductModal: boolean = false;
  searchTerm: string = '';

  private sub = new Subscription();
  private baseUrl = 'http://localhost:5000';

  ngOnInit(): void {
    this.fetchProfile(); // Fetch JWT-based profile
    this.loadDashboardData();
    this.loadCategories();

    const timer = setInterval(() => {
      this.today = new Date();
      this.cd.markForCheck();
    }, 1000);
    this.sub.add(() => clearInterval(timer));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ---------------- PROFILE WITH JWT ----------------
  fetchProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.alertService.show('Low stock warning', 'warning');
      return;
    }

    this.sub.add(
      this.authService.getProfile(token).subscribe({
        next: (user) => {
          const timestamp = Date.now();
          let profileUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName || 'Unknown'
          )}&background=6366f1&color=fff`;

          if (user.profilePicture) {
            const cleanPath = user.profilePicture.replace(/^\/+/, '');
            profileUrl = user.profilePicture.startsWith('http')
              ? user.profilePicture
              : `${this.baseUrl}/${cleanPath}?t=${timestamp}`;
          }

          this.currentUser = {
            ...user,
            profilePicture: profileUrl,
            location: user.locations?.length > 0 ? user.locations[user.locations.length - 1] : null,
          };

          this.username = user.fullName || 'Admin';
          this.cd.markForCheck();

          if (!this.currentUser.location) {
            this.syncLocation();
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Profile Fetch Error:', err);
          this.alertService.show(err.error?.message || 'Failed to fetch profile', 'error');
        },
      })
    );
  }

  // ---------------- SYNC LOCATION ----------------
  async syncLocation() {
    try {
      const coords = await this.locationService.getPosition();
      const address = await firstValueFrom(this.locationService.getAddress(coords.lat, coords.lng));

      this.sub.add(
        this.authService
          .updateLocation(coords.lat, coords.lng, address.city, address.country)
          .subscribe({
            next: (res) => {
              if (res.success && res.location) {
                this.currentUser.location = res.location;
                this.cd.markForCheck();
              }
            },
            error: (err: HttpErrorResponse) => {
              console.error('Location update failed:', err);
              this.alertService.show(err.error?.message || 'Failed to update location', 'error');
            },
          })
      );
    } catch (err) {
      console.warn('Location sync skipped:', err);
      this.alertService.show('Low stock warning', 'warning');
    }
  }

  // ---------------- DASHBOARD DATA ----------------
  loadDashboardData(): void {
    this.sub.add(
      forkJoin({
        products: this.productService.getProducts(),
        stats: this.productService.getStats(),
      }).subscribe({
        next: ({ products, stats }) => {
          this.products = products;
          this.filteredProducts = [...products];
          this.stats = stats;
          this.cd.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Dashboard load error:', err);
          this.alertService.show(err.error?.message || 'Failed to load dashboard', 'error');
        },
      })
    );
  }

  loadCategories(): void {
    this.sub.add(
      this.productService.getCategories().subscribe({
        next: (cats) => {
          this.categories = cats;
          this.cd.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Category load error:', err);
          this.alertService.show(err.error?.message || 'Failed to load categories', 'error');
        },
      })
    );
  }

  // ---------------- FILTER ----------------
  applyFilter(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredProducts = !search
      ? [...this.products]
      : this.products.filter(
          (p) =>
            p.name?.toLowerCase().includes(search) ||
            (typeof p.category === 'object' ? p.category.name : p.category)
              ?.toLowerCase()
              .includes(search)
        );
    this.cd.markForCheck();
  }

  // ---------------- DELETE PRODUCT ----------------
  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.sub.add(
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.alertService.show('Product removed successfully', 'info');
          this.products = this.products.filter((p) => p._id !== id);
          this.filteredProducts = this.filteredProducts.filter((p) => p._id !== id);
          this.stats.totalProducts--;
          this.cd.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Delete product error:', err);
          this.alertService.show(err.error?.message || 'Failed to delete product', 'error');
        },
      })
    );
  }

  // ---------------- ADD PRODUCT ----------------
  onProductAdded(p: Product): void {
    this.alertService.show('New product added!', 'success');
    this.loadDashboardData();
    this.closeAddProductModal();
  }

  openAddProductModal(): void {
    this.showAddProductModal = true;
    this.cd.markForCheck();
  }

  closeAddProductModal(): void {
    this.showAddProductModal = false;
    this.cd.markForCheck();
  }

  onImageError(event: any): void {
    event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.username
    )}&background=6366f1&color=fff`;
  }
}
