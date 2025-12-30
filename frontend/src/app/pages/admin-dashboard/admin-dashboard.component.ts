import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { AddProduct } from './add-product/add-product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AddProduct],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  username: string = '';
  private subscription: Subscription = new Subscription();
  showAddProductModal: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.currentUser.subscribe(user => {
      console.log('Current user:', user);
      this.username = user?.fullName || 'Admin';
      console.log('Username set to:', this.username);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openAddProductModal(): void {
    this.showAddProductModal = true;
  }

  closeAddProductModal(): void {
    this.showAddProductModal = false;
  }

  onProductAdded(product: any): void {
    console.log('Product added:', product);
    // Here you would typically refresh the product list or show a success message
    this.closeAddProductModal();
  }
}
