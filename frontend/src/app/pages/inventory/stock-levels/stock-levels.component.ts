import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService, Product, ProductStats } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { FilterPipe } from '../../../pipes/filter.pipe';

@Component({
  selector: 'app-stock-levels',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './stock-levels.component.html',
})
export class StockLevelsComponent implements OnInit, OnDestroy {
  // Data Properties
  products: Product[] = [];
  currentUser: any = null;
  username: string = '';
  searchTerm: string = '';
  
  // Stats specifically for Stock Monitoring
  stats: ProductStats = {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  };

  private subscription: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Get User Context for Header
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.username = user.fullName || 'Admin';
        }
      })
    );

    // 2. Load Initial Data
    this.loadStockData();
  }

  loadStockData(): void {
    // Fetch Products
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => console.error('Error loading stock:', err)
    });

    // Fetch Stats for the Gauges
    this.productService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  // Helper to calculate "Healthy" items for the UI
  get healthyCount(): number {
    return this.stats.totalProducts - (this.stats.lowStock + this.stats.outOfStock);
  }

  // Helper for Asset Turnover logic (Example calculation)
  get stockEfficiency(): number {
    if (this.stats.totalProducts === 0) return 0;
    const efficiency = (this.healthyCount / this.stats.totalProducts) * 100;
    return Math.round(efficiency);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Action Method for the "Order Units" button
  initiateRestock(product: Product): void {
    console.log(`Initiating restock for: ${product.name}`);
    // Logic for opening a restock modal or sending an API request goes here
  }
}