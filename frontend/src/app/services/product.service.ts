import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
  _id: string;
  name: string;
  category: any;
  price: number;
  stock: number;
  description?: string;
  image?: string; // Added image path
  status?: string;
}

export interface ProductStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://54.253.18.25:5000/api/products';

  constructor(private http: HttpClient) {}

  // ✅ GET ALL PRODUCTS
  getProducts(): Observable<Product[]> {
    return this.http
      .get<{ success: boolean; products: Product[] }>(this.apiUrl)
      .pipe(map((res) => res.products || []));
  }

  // ✅ GET STATS
  getStats(): Observable<ProductStats> {
    return this.http.get<{ success: boolean; stats: any }>(`${this.apiUrl}/stats`).pipe(
      map((res) => ({
        totalProducts: res.stats?.totalProducts || 0,
        lowStock: res.stats?.lowStockItems || 0,
        outOfStock: res.stats?.outOfStock || 0,
        totalValue: res.stats?.totalValue || 0,
      }))
    );
  }

  // ✅ CREATE PRODUCT (Using FormData for Image Upload)
  createProduct(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  // ✅ UPDATE PRODUCT
  updateProduct(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  // ✅ DELETE PRODUCT
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ success: boolean; categories: Category[] }>('http://54.253.18.25:5000/api/categories')
      .pipe(map((res) => res.categories || []));
  }
}
