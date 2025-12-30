import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  items: any[] = [];

  add(product: any) {
    this.items.push(product);
  }

  getItems() {
    return this.items;
  }

  clear() {
    this.items = [];
  }
}
