import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductStats } from '../../services/product.service';
import { FilterPipe } from '../../pipes/filter.pipe';
import { LocationService } from '../../services/LocationService';
import { AddProductComponent } from './add-product/add-product.component';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddProductComponent, FilterPipe],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  username: string = 'Admin';
  currentUser: any = {
    location: { city: 'Loading...', country: '' },
    role: 'User',
    profilePicture: '',
  };

  products: Product[] = [];
  stats: ProductStats = { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
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
    private locationService: LocationService // Added this back
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.authService.currentUser.subscribe((user) => {
        if (user && user._id) {
          this.username = user.fullName || 'Admin';
          // Load existing profile first
          this.fetchProfile(user._id);
          // Then try to update their location automatically
          this.syncLocation(user._id);
        }
      })
    );
    this.loadProducts();
    this.loadStats();
  }

  // --- Location Logic ---

  async syncLocation(userId: string) {
    try {
      // 1. Get raw coordinates
      const coords = await this.locationService.getPosition();

      // 2. Convert coordinates to City/Country names
      const address = await this.locationService.getAddress(coords.lat, coords.lng);

      // 3. Save to Backend
      this.http
        .post(`${this.baseUrl}/api/auth/update-location`, {
          userId: userId,
          city: address.city,
          country: address.country,
          lat: coords.lat,
          lng: coords.lng,
        })
        .subscribe({
          next: () => {
            // 4. Update UI immediately
            this.currentUser.location = address;
            console.log('Location synced successfully:', address.city);
          },
          error: (err) => console.error('Failed to save location to DB', err),
        });
    } catch (err) {
      console.warn('Location synchronization skipped:', err);
      // Don't alert the user, just leave the "City not set" from fetchProfile
    }
  }

  // --- Core Methods ---

  fetchProfile(userId: string): void {
    if (!userId) return;
    this.http.get<any>(`${this.baseUrl}/api/auth/${userId}`).subscribe({
      next: (res) => {
        if (res?.success && res?.user) {
          const u = res.user;
          const hasLocation = u.locations && Array.isArray(u.locations) && u.locations.length > 0;
          const lastLoc = hasLocation ? u.locations[u.locations.length - 1] : null;

          this.currentUser = {
            ...u,
            profilePicture: u.profilePicture
              ? u.profilePicture.startsWith('http')
                ? u.profilePicture
                : `${this.baseUrl}/${u.profilePicture}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  u.fullName
                )}&background=6366f1&color=fff`,

            location: {
              city: lastLoc?.city || 'City not set',
              country: lastLoc?.country || '',
            },
          };
        }
      },
      error: (err) => console.error('Fetch Profile Error:', err),
    });
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;
    const search = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        (typeof p.category === 'object' ? p.category.name : p.category)
          ?.toLowerCase()
          .includes(search)
    );
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Product load error', err),
    });
  }

  loadStats(): void {
    this.productService.getStats().subscribe({
      next: (data) => (this.stats = data),
      error: (err) => console.error('Stats load error', err),
    });
  }

  onImageError(event: any): void {
    event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.username
    )}&background=6366f1&color=fff`;
  }

  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.showAddProductModal = true;
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.products = this.products.filter((p) => p._id !== id);
        this.loadStats();
        this.addNotification('Product deleted', 'success');
      });
    }
  }

onProductAdded(event?: any) {
  this.loadProducts();
  this.loadStats();
  this.closeAddProductModal();
  this.addNotification('Inventory updated', 'success');
}

  addNotification(message: string, type: 'success' | 'error') {
    const id = Date.now();
    this.notifications.push({ id, message, type });
    setTimeout(() => (this.notifications = this.notifications.filter((n) => n.id !== id)), 3000);
  }

  openAddProductModal() {
    this.selectedProduct = null;
    this.showAddProductModal = true;
  }
  closeAddProductModal() {
    this.showAddProductModal = false;
    this.selectedProduct = null;
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
