import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  items: any[] = [];  // <-- declare items

  constructor() {
    // Sample data for testing
    this.items = [
      { name: 'Product 1', price: 10 },
      { name: 'Product 2', price: 20 }
    ];
  }
}
