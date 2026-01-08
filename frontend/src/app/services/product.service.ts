import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/* =======================
   MODELS
======================= */
export interface Product {
  _id: string;
  name: string;
  category: Category | null;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  status?: 'active' | 'inactive';
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

/* =======================
   SERVICE
======================= */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = 'http://16.176.174.48:5000/api/products';
  private readonly categoryUrl = 'http://16.176.174.48:5000/api/categories';

  constructor(private http: HttpClient) {}

  /* =======================
     HELPERS
  ======================== */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /* =======================
     PRODUCTS
  ======================== */

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http
      .get<{ success: boolean; products: Product[] }>(this.apiUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((res) => res.products ?? []));
  }

  // Get a single product by ID
  getProduct(id: string): Observable<Product> {
    return this.http
      .get<{ success: boolean; product: Product }>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((res) => res.product));
  }

  // Create a new product
  createProduct(formData: FormData): Observable<{ success: boolean; product: Product }> {
    return this.http.post<{ success: boolean; product: Product }>(this.apiUrl, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // Update an existing product
  updateProduct(
    id: string,
    formData: FormData
  ): Observable<{ success: boolean; product: Product }> {
    return this.http.put<{ success: boolean; product: Product }>(`${this.apiUrl}/${id}`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // Delete a product
  deleteProduct(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /* =======================
     STATS
  ======================== */

  getStats(): Observable<ProductStats> {
    return this.http
      .get<{ success: boolean; stats: any }>(`${this.apiUrl}/stats`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((res) => ({
          totalProducts: res.stats?.totalProducts ?? 0,
          lowStock: res.stats?.lowStockItems ?? 0,
          outOfStock: res.stats?.outOfStock ?? 0,
          totalValue: res.stats?.totalValue ?? 0,
        }))
      );
  }

  /* =======================
     CATEGORIES
  ======================== */

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ success: boolean; categories: Category[] }>(this.categoryUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((res) => res.categories ?? []));
  }
}
