import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;      
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

  // 1. Fetch all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }

  // 2. Fetch dashboard statistics
  getStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(`${this.api}/stats`);
  }

  // 3. ADDED: Delete a product by ID
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // 4. ADDED: Create a new product
  addProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.api, product);
  }

  // 5. ADDED: Update an existing product (For your Edit button)
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product);
  }
}