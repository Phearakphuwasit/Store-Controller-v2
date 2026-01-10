import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService, Product, ProductStats } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroClock,
  heroExclamationTriangle,
  heroBanknotes,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-stock-levels',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, NgIconComponent],
  templateUrl: './stock-levels.component.html',
  viewProviders: [
    provideIcons({
      heroClock,
      heroExclamationTriangle,
      heroBanknotes,
      heroMagnifyingGlass,
    }),
  ],
})
export class StockLevelsComponent implements OnInit, OnDestroy {
  isEditModalOpen: boolean = false;
  selectedProduct: Product | null = null;
  newStockValue: number = 0;
  products: Product[] = [];
  filteredProducts: Product[] = []; // Used for the search bar
  currentUser: any = null;
  username: string = '';
  searchTerm: string = '';

  stats: ProductStats = {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  };

  private subscription: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cd: ChangeDetectorRef // Added for UI updates
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser.subscribe((user) => {
        if (user) {
          this.currentUser = user;
          this.username = user.fullName || 'Admin';
        }
      })
    );

    this.loadProducts(); // Call the renamed method
  }

  // RENAMED: Changed from loadStockData to loadProducts to match HTML
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data; // Set initial filtered list
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error loading stock:', err),
    });

    this.productService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  // ADDED: Logic to handle search bar input
  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();

    if (search === 'low stock') {
      this.filteredProducts = this.products.filter((p) => p.stock <= 5);
    } else if (!search) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.category?.toString().toLowerCase().includes(search)
      );
    }
    this.cd.markForCheck();
  }

  get healthyCount(): number {
    return this.stats.totalProducts - (this.stats.lowStock + this.stats.outOfStock);
  }

  get stockEfficiency(): number {
    if (this.stats.totalProducts === 0) return 0;
    return Math.round((this.healthyCount / this.stats.totalProducts) * 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initiateRestock(product: Product): void {
    console.log(`Initiating restock for: ${product.name}`);
  }

openEditModal(product: Product): void {
  console.log('Opening modal for:', product.name);
  this.selectedProduct = product;
  this.newStockValue = product.stock;
  this.isEditModalOpen = true;

  // This forces the UI to re-render immediately
  this.cd.detectChanges(); 
}

closeModal(): void {
  this.isEditModalOpen = false;
  this.cd.markForCheck();
}

  saveStockUpdate(): void {
    if (!this.selectedProduct) return;

    const formData = new FormData();

    // Mandatory fields for your Backend/Database
    formData.append('stock', this.newStockValue.toString());
    formData.append('name', this.selectedProduct.name);
    formData.append('price', this.selectedProduct.price.toString());

    // Handle Category (Object vs String)
    const catId =
      typeof this.selectedProduct.category === 'object'
        ? this.selectedProduct.category?._id
        : this.selectedProduct.category;

    if (catId) formData.append('category', catId);

    this.productService.updateProduct(this.selectedProduct._id, formData).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local UI immediately
          if (this.selectedProduct) {
            this.selectedProduct.stock = this.newStockValue;
          }
          this.isEditModalOpen = false;

          // stats are automatically refreshed by the 'tap' in your service!
          this.cd.markForCheck();
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Error updating stock level.');
      },
    });
  }

  
}
