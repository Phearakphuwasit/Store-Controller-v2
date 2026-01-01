import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductStats } from '../../services/product.service';
import { AddProduct } from './add-product/add-product';
import { FilterPipe } from '../../pipes/filter.pipe';
import { HttpClient } from '@angular/common/http';

interface UserProfile {
  profilePicture?: string;
  role?: string;
  location?: {
    city?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddProduct, FilterPipe],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  username: string = '';
  currentUser: UserProfile = {
    location: {},
  };
  private subscription: Subscription = new Subscription();

  notifications: { id: number; message: string; type: 'success' | 'error' }[] = [];

  // Products & stats
  products: Product[] = [];
  stats: ProductStats = {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  };

  showAddProductModal: boolean = false;
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // User info subscription
    this.subscription.add(
      this.authService.currentUser.subscribe((user) => {
        console.log('Current user:', user);
        this.username = user?.fullName || 'Admin';
        this.fetchProfile(user._id);
      })
    );

    // Fetch initial products and stats
    this.loadProducts();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Open/close modal
  openAddProductModal(): void {
    this.showAddProductModal = true;
  }

  closeAddProductModal(): void {
    this.showAddProductModal = false;
  }

  // Fetch products from backend
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Failed to load products:', err),
    });
  }

  // Fetch summary stats from backend
  loadStats(): void {
    this.productService.getStats().subscribe({
      next: (data) => (this.stats = data),
      error: (err) => console.error('Failed to load stats:', err),
    });
  }

  // Called when Add Product modal emits a new product
  onProductAdded(product: Product): void {
    console.log('Product added:', product);
    this.products.push(product); // Update table immediately
    this.loadStats(); // Refresh stats
    this.closeAddProductModal();
  }

  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Method to Delete Product
  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          // Remove from local array
          this.products = this.products.filter((p) => p._id !== id);
          this.addNotification('Product removed from inventory', 'success');
          this.loadStats(); // Refresh numbers
        },
        error: (err) => this.addNotification('Failed to delete product', 'error'),
      });
    }
  }

  // Method to handle notifications
  addNotification(message: string, type: 'success' | 'error') {
    const id = Date.now();
    this.notifications.push({ id, message, type });
    setTimeout(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    }, 4000); // Auto-hide after 4 seconds
  }

  // Method for Edit (usually opens a modal or navigates)
  editProduct(product: any) {
    console.log('Edit product:', product);
    // Implementation for edit modal goes here
  }

  fetchProfile(userId: string): void {
    if (!userId) return;

    this.http.get<any>(`http://54.253.18.25:5000/api/auth/${userId}`).subscribe({
      next: (res) => {
        if (res?.success && res?.user) {
          const latestLocation =
            res.user.locations && res.user.locations.length > 0
              ? res.user.locations[res.user.locations.length - 1]
              : null;

          this.currentUser = {
            ...res.user,

            // ✅ Fix profile picture path
            profilePicture: res.user.profilePicture
              ? `http://54.253.18.25:5000/${res.user.profilePicture}`
              : 'assets/default-avatar.png',

            // ✅ Role fallback
            role: res.user.role || 'user',

            // ✅ Map locations[] → location
            location: {
              city: latestLocation?.city || 'Unknown',
              country: latestLocation?.country || 'Unknown',
            },
          };

          console.log('Profile loaded:', this.currentUser);
        }
      },
      error: (err) => console.error('Profile API Error:', err),
    });
  }
}
