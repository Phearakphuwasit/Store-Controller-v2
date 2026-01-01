import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { ProductService, Product, ProductStats } from '../../services/product.service';
import { AddProduct } from './add-product/add-product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddProduct],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  username: string = '';
  private subscription: Subscription = new Subscription();

  // Products & stats
  products: Product[] = [];
  stats: ProductStats = {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  };

  showAddProductModal: boolean = false;
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // User info subscription
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        console.log('Current user:', user);
        this.username = user?.fullName || 'Admin';
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
      next: data => this.products = data,
      error: err => console.error('Failed to load products:', err)
    });
  }

  // Fetch summary stats from backend
  loadStats(): void {
    this.productService.getStats().subscribe({
      next: data => this.stats = data,
      error: err => console.error('Failed to load stats:', err)
    });
  }

  // Called when Add Product modal emits a new product
  onProductAdded(product: Product): void {
    console.log('Product added:', product);
    this.products.push(product);  // Update table immediately
    this.loadStats();              // Refresh stats
    this.closeAddProductModal();
  }
}
