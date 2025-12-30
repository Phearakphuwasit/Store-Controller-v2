import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  products: any[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.productService.getProducts()
      .subscribe(data => this.products = data);
  }

  addToCart(product: any) {
    this.cartService.add(product);
  }
}
