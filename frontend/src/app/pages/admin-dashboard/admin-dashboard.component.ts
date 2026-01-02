import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductStats, Category } from '../../services/product.service';
import { LocationService } from '../../services/LocationService';
import { AddProductComponent } from './add-product/add-product.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddProductComponent], // removed FilterPipe
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  username: string = 'Admin';
  currentUser: any = {
    location: { city: 'Loading...', country: '' },
    role: 'User',
    profilePicture: '',
  };

  products: Product[] = [];
  filteredProducts: Product[] = [];
  stats: ProductStats = { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
  categories: Category[] = [];

  showAddProductModal: boolean = false;
  selectedProduct: Product | null = null;
  searchTerm: string = '';
  notifications: any[] = [];

  private sub = new Subscription();
  private baseUrl = 'http://54.253.18.25:5000';

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private http: HttpClient,
    private locationService: LocationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleAuth();
    this.loadDashboardData();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // --- AUTH & LOCATION ---
  handleAuth(): void {
    this.sub.add(
      this.authService.currentUser.subscribe((user) => {
        if (!user?._id) return;
        this.username = user.fullName || 'Admin';
        this.fetchProfile(user._id);

        if (!localStorage.getItem('locationSynced')) {
          this.syncLocation(user._id);
          localStorage.setItem('locationSynced', 'true');
        }
      })
    );
  }

  async syncLocation(userId: string) {
    try {
      const coords = await this.locationService.getPosition();
      const address = await this.locationService.getAddress(coords.lat, coords.lng);

      this.http
        .post(`${this.baseUrl}/api/auth/update-location`, {
          userId,
          city: address.city,
          country: address.country,
          lat: coords.lat,
          lng: coords.lng,
        })
        .subscribe({
          next: () => {
            this.currentUser.location = address;
            this.cd.markForCheck();
          },
          error: (err) => console.error('Failed to save location', err),
        });
    } catch (err) {
      console.warn('Location sync skipped:', err);
    }
  }

fetchProfile(userId: string): void {
  if (!userId) return;
  this.http.get<any>(`${this.baseUrl}/api/auth/${userId}`).subscribe({
    next: (res) => {
      if (res?.success && res?.user) {
        const u = res.user;
        const lastLoc = u.locations?.[u.locations.length - 1] || null;

        let profileUrl = '';

        if (u.profilePicture) {
          // If already full URL, use it
          profileUrl = u.profilePicture.startsWith('http')
            ? u.profilePicture
            : `${this.baseUrl}/${u.profilePicture.replace(/^\/+/, '')}`; // remove leading slash
        } else {
          // fallback to avatar
          profileUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            u.fullName || 'Admin'
          )}&background=6366f1&color=fff`;
        }

        this.currentUser = {
          ...u,
          profilePicture: profileUrl,
          location: {
            city: lastLoc?.city || 'City not set',
            country: lastLoc?.country || '',
          },
        };

        this.cd.markForCheck();
      }
    },
    error: (err) => console.error('Fetch Profile Error:', err),
  });
}


  // --- PRODUCTS & STATS ---
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
        error: (err) => console.error('Dashboard load error', err),
      })
    );
  }

  loadCategories(): void {
    this.sub.add(
      this.productService.getCategories().subscribe({
        next: (data) => {
          this.categories = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Categories load error', err),
      })
    );
  }

  // --- FILTER ---
  applyFilter(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredProducts = !search
      ? [...this.products]
      : this.products.filter(
          (p) =>
            p.name?.toLowerCase().includes(search) ||
            (typeof p.category === 'object' ? p.category.name : p.category)?.toLowerCase().includes(search)
        );
    this.cd.markForCheck();
  }

  // --- ADD PRODUCT MODAL ---
  openAddProductModal(): void {
    this.selectedProduct = null;
    this.showAddProductModal = true;
    this.cd.markForCheck();
  }

  closeAddProductModal(): void {
    this.showAddProductModal = false;
    this.selectedProduct = null;
    this.cd.markForCheck();
  }

  onProductAdded(product: Product): void { // ✅ fixed type to Product
    if (product) {
      this.products.unshift(product);
      this.filteredProducts.unshift(product);
      this.stats.totalProducts++;
    } else {
      this.loadDashboardData();
    }
    this.closeAddProductModal();
    this.addNotification('Inventory updated', 'success');
  }

  // --- DELETE ---
  deleteProduct(id: string): void {
    if (!confirm('Are you sure?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p._id !== id);
        this.filteredProducts = this.filteredProducts.filter((p) => p._id !== id);
        this.stats.totalProducts--;
        this.addNotification('Product deleted', 'success');
        this.cd.markForCheck();
      },
      error: (err) => console.error('Delete product failed', err),
    });
  }

  // --- NOTIFICATIONS ---
  addNotification(message: string, type: 'success' | 'error'): void {
    const id = Date.now();
    this.notifications.push({ id, message, type });
    this.cd.markForCheck();
    setTimeout(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
      this.cd.markForCheck();
    }, 3000);
  }

  // --- IMAGE FALLBACK ---
  onImageError(event: any): void {
    event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.username
    )}&background=6366f1&color=fff`;
  }

  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.showAddProductModal = true;
    this.cd.markForCheck();
  }
}
