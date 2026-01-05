import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  // Products
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`);
  }

  // Categories
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  // Orders
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders`);
  }
}
