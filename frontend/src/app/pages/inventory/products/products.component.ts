import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';


interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

@Component({
  selector: 'app-products',
  standalone: true,
   imports: [CommonModule, NgIconComponent],
  templateUrl: './products.component.html'
})

export class ProductsComponent {
  products: Product[] = [
    {
      id: '1',
      name: 'Wireless Ergonomic Mouse',
      sku: 'LOG-MX-2024',
      category: 'Peripherals',
      price: 89.99,
      stock: 42,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&h=400&fit=crop',
      status: 'In Stock'
    },
    {
      id: '2',
      name: 'Mechanical Gaming Keyboard',
      sku: 'RZR-BLK-V3',
      category: 'Peripherals',
      price: 159.00,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=400&h=400&fit=crop',
      status: 'Low Stock'
    },
    {
      id: '3',
      name: '4K Ultra-Wide Monitor',
      sku: 'DEL-U4-27',
      category: 'Electronics',
      price: 549.99,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&h=400&fit=crop',
      status: 'In Stock'
    }
  ];

  getStatusClass(status: string) {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700 border-green-200';
      case 'Low Stock': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Out of Stock': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}