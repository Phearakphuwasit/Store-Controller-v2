import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // -------------------- PRODUCTS --------------------
  getProducts(params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const options: { headers: HttpHeaders; params?: HttpParams } = { headers };

    if (params) {
      options.params = new HttpParams({ fromObject: params });
    }

    return this.http.get(`${this.baseUrl}/products`, options);
  }

  getOrders(params?: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const options: { headers: HttpHeaders; params?: HttpParams } = { headers };

    if (params) {
      options.params = new HttpParams({ fromObject: params });
    }

    return this.http.get(`${this.baseUrl}/orders`, options);
  }

  getCategories(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/categories`, { headers });
  }

  createProduct(data: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseUrl}/products`, data, { headers });
  }

  createCategory(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseUrl}/categories`, data, { headers });
  }

  updateProduct(id: string, data: FormData | any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}/products/${id}`, data, { headers });
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}/orders/${id}/status`, { status }, { headers });
  }

  deleteProduct(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/products/${id}`, { headers });
  }

  deleteCategory(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}/categories/${id}`, { headers });
  }
}
