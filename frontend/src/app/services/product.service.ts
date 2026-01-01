import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  name: string;
  category: string;
  stock: number;
  price: number;
}

export interface ProductStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = 'http://54.253.18.25:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }

  getStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(`${this.api}/stats`);
  }
}
